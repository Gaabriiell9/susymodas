import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { markOrderPaid } from '@/lib/server/orders'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  let event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] signature invalide', err.message)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  try {
    const session = event.data.object
    const orderId = parseInt(session?.metadata?.orderId, 10)

    if ((event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded')
        && session.payment_status === 'paid' && orderId) {
      await markOrderPaid(orderId)
    }

    if (event.type === 'checkout.session.expired' && orderId) {
      await prisma.order.updateMany({ where: { id: orderId, status: 'PENDING' }, data: { status: 'CANCELLED' } })
    }
  } catch (err) {
    console.error('[webhook]', err)
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
