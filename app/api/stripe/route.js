// app/api/stripe/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })

// ── POST /api/stripe  →  Créer une session de paiement ───────────────────────
export async function POST(request) {
  try {
    const { items, customer, orderId } = await request.json()

    // Construit les line_items Stripe depuis le panier
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: item.images?.length ? [item.images[0]] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: customer?.email,
      metadata: {
        orderId: orderId?.toString() ?? '',
        firstName: customer?.firstName ?? '',
        lastName: customer?.lastName ?? '',
        phone: customer?.phone ?? '',
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/commande/annulee`,
      locale: 'fr',
    })

    // Sauvegarde l'ID de session dans la commande si elle existe
    if (orderId) {
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { stripeSessionId: session.id, paymentMethod: 'STRIPE' },
      })
    }

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('[POST /api/stripe]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
