// Utilisé par la page "commande confirmée". Vérifie le paiement directement chez Stripe.
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { markOrderPaid } from '@/lib/server/orders'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const sessionId = new URL(request.url).searchParams.get('session_id')
  if (!sessionId?.startsWith('cs_')) return NextResponse.json({ error: 'Lien invalide' }, { status: 400 })

  try {
    const stripeSession = await getStripe().checkout.sessions.retrieve(sessionId)
    if (stripeSession.payment_status !== 'paid') return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 402 })

    const order = await prisma.order.findUnique({ where: { stripeSessionId: sessionId } })
    if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

    // Filet de sécurité si le webhook n'est pas encore arrivé
    if (!order.stockDecremented) await markOrderPaid(order.id)

    const full = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } })
    return NextResponse.json({
      order: {
        reference: full.reference,
        firstName: full.firstName,
        email: full.email,
        deliveryMethod: full.deliveryMethod,
        address: full.address,
        postalCode: full.postalCode,
        city: full.city,
        subtotal: full.subtotal,
        shippingCost: full.shippingCost,
        totalAmount: full.totalAmount,
        items: full.items.map((i) => ({ name: i.productName, image: i.productImage, size: i.size, quantity: i.quantity, price: i.price })),
      },
    })
  } catch (err) {
    console.error('[by-session]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
