// app/api/stripe/webhook/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature invalide:', err.message)
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  // ── Paiement réussi ────────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    if (session.payment_status === 'paid') {
      const orderId = session.metadata?.orderId

      if (orderId) {
        await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: {
            status: 'CONFIRMED',
            paidAt: new Date(),
          },
        })
        console.log(`✅ Commande #${orderId} payée via Stripe`)
      }
    }
  }

  return NextResponse.json({ received: true })
}