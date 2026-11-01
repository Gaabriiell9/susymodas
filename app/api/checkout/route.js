// Crée la commande (en attente) puis la session de paiement Stripe.
// Les prix, le stock et les frais de livraison sont TOUJOURS recalculés ici, jamais pris du navigateur.
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getSettings, shippingFor } from '@/lib/settings'
import { stockForSize } from '@/lib/catalog'
import { getStripe, siteUrl } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const clean = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

async function nextReference() {
  const year = new Date().getFullYear()
  const count = await prisma.order.count({ where: { reference: { startsWith: `SM-${year}-` } } })
  return `SM-${year}-${String(count + 1).padStart(4, '0')}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

export async function POST(request) {
  try {
    const body = await request.json()
    const deliveryMethod = body.deliveryMethod === 'DELIVERY' ? 'DELIVERY' : 'PICKUP'
    const customer = {
      firstName: clean(body.firstName, 80),
      lastName: clean(body.lastName, 80),
      email: clean(body.email, 160).toLowerCase(),
      phone: clean(body.phone, 30),
      address: clean(body.address),
      postalCode: clean(body.postalCode, 10),
      city: clean(body.city, 80),
      notes: clean(body.notes, 500),
    }

    const missing = ['firstName', 'lastName', 'email', 'phone'].filter((k) => !customer[k])
    if (deliveryMethod === 'DELIVERY') missing.push(...['address', 'postalCode', 'city'].filter((k) => !customer[k]))
    if (missing.length) return NextResponse.json({ error: 'Merci de remplir tous les champs obligatoires.', fields: missing }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
      return NextResponse.json({ error: 'Adresse e-mail invalide.', fields: ['email'] }, { status: 400 })

    const items = Array.isArray(body.items) ? body.items.slice(0, 50) : []
    if (!items.length) return NextResponse.json({ error: 'Votre panier est vide.' }, { status: 400 })

    // Regroupe par produit + taille
    const wanted = new Map()
    for (const it of items) {
      const id = Number(it.id)
      const size = clean(it.size, 10)
      const qty = Math.max(1, Math.min(20, parseInt(it.qty, 10) || 1))
      if (!id) continue
      const key = `${id}|${size}`
      wanted.set(key, { id, size, qty: (wanted.get(key)?.qty ?? 0) + qty })
    }

    const products = await prisma.product.findMany({ where: { id: { in: [...wanted.values()].map((w) => w.id) }, active: true } })
    const byId = new Map(products.map((p) => [p.id, p]))

    const lines = []
    const problems = []
    for (const w of wanted.values()) {
      const p = byId.get(w.id)
      if (!p) { problems.push('Un article de votre panier n\'est plus disponible.'); continue }
      const available = stockForSize(p, w.size)
      if (available < w.qty) {
        problems.push(available > 0
          ? `${p.name}${w.size ? ` (${w.size})` : ''} : il n'en reste que ${available}.`
          : `${p.name}${w.size ? ` (${w.size})` : ''} est épuisé.`)
        continue
      }
      lines.push({ product: p, size: w.size || null, qty: w.qty })
    }
    if (problems.length) return NextResponse.json({ error: problems.join(' '), stock: true }, { status: 409 })

    const settings = await getSettings()
    const subtotal = Math.round(lines.reduce((s, l) => s + l.product.price * l.qty, 0) * 100) / 100
    const shippingCost = shippingFor(deliveryMethod, subtotal, settings)
    const totalAmount = Math.round((subtotal + shippingCost) * 100) / 100

    const session = await getSession()
    const userId = session?.user?.id
      ? (await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } }))?.id ?? null
      : null

    const order = await prisma.order.create({
      data: {
        reference: await nextReference(),
        deliveryMethod,
        subtotal,
        shippingCost,
        totalAmount,
        ...customer,
        address: deliveryMethod === 'DELIVERY' ? customer.address : null,
        postalCode: deliveryMethod === 'DELIVERY' ? customer.postalCode : null,
        city: deliveryMethod === 'DELIVERY' ? customer.city : null,
        userId,
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            productName: l.product.name,
            productImage: l.product.images?.[0] ?? null,
            quantity: l.qty,
            price: l.product.price,
            size: l.size,
          })),
        },
      },
    })

    const stripe = getStripe()
    const base = siteUrl()
    const line_items = lines.map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(l.product.price * 100),
        product_data: {
          name: l.size ? `${l.product.name} (taille ${l.size})` : l.product.name,
          ...(l.product.images?.[0]?.startsWith('https://') ? { images: [l.product.images[0]] } : {}),
        },
      },
    }))
    if (shippingCost > 0) {
      line_items.push({
        quantity: 1,
        price_data: { currency: 'eur', unit_amount: Math.round(shippingCost * 100), product_data: { name: 'Livraison à domicile' } },
      })
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: customer.email,
      client_reference_id: String(order.id),
      metadata: { orderId: String(order.id), reference: order.reference },
      payment_intent_data: { metadata: { orderId: String(order.id), reference: order.reference } },
      success_url: `${base}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/commande?annulee=1`,
      locale: 'fr',
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 h
    })

    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkout.id } })
    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    console.error('[checkout]', error)
    const msg = String(error?.message || '').includes('STRIPE_SECRET_KEY')
      ? 'Le paiement en ligne n\'est pas encore configuré.'
      : 'Impossible de lancer le paiement. Réessayez dans un instant.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
