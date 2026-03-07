// app/api/orders/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ── GET /api/orders ── admin uniquement
export async function GET(request) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    include: {
      items: { include: { product: { select: { name: true, images: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ orders })
}

// ── POST /api/orders ── crée une commande et lie au user connecté
export async function POST(request) {
  try {
    const body = await request.json()

    // Récupère le user connecté
    const session = await getServerSession(authOptions)
    const rawId = session?.user?.id
    const userId = rawId ? Number(rawId) : null
    console.log('[ORDER] session userId raw:', rawId, '→ parsed:', userId)

    // Validation
    const required = ['firstName', 'lastName', 'email', 'phone', 'items']
    for (const field of required) {
      if (!body[field]) return NextResponse.json({ error: `Champ requis : ${field}` }, { status: 400 })
    }
    if (!body.items?.length) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 })
    }

    // Vérifie les produits et calcule le total
    let totalAmount = 0
    const itemsData = []

    for (const item of body.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product || !product.active) {
        return NextResponse.json({ error: `Produit indisponible : ${item.productId}` }, { status: 400 })
      }
      const price = product.price
      totalAmount += price * item.quantity
      itemsData.push({ productId: product.id, quantity: item.quantity, price, size: item.size, color: item.color })
    }

    // Référence unique
    const count = await prisma.order.count()
    const ref = `SME-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const order = await prisma.order.create({
      data: {
        reference: ref,
        totalAmount,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        notes: body.notes,
        paymentMethod: body.paymentMethod ?? 'WHATSAPP',
        ...(userId ? { userId } : {}),
        items: { create: itemsData },
      },
      include: { items: true },
    })

    console.log('[ORDER] created:', order.reference, '| userId in DB:', order.userId)

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/orders]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}