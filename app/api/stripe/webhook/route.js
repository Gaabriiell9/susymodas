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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    if (session.payment_status === 'paid') {
      const orderId = session.metadata?.orderId

      if (orderId) {
        // 1. Confirmer la commande
        await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: { status: 'CONFIRMED', paidAt: new Date() },
        })

        // 2. Récupérer les articles achetés
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: parseInt(orderId) },
          include: { product: true },
        })

        // 3. Mettre à jour le stock de chaque produit
        for (const item of orderItems) {
          const product = item.product
          const size = item.size
          const qty = item.quantity

          // Récupérer sizeStock actuel
          const currentSizeStock = (product.sizeStock ?? {})

          // Décrémenter la taille achetée
          const updatedSizeStock = { ...currentSizeStock }
          if (size && updatedSizeStock[size] !== undefined) {
            updatedSizeStock[size] = Math.max(0, updatedSizeStock[size] - qty)
          }

          // Recalculer sizes = tailles avec stock > 0
          const updatedSizes = Object.entries(updatedSizeStock)
            .filter(([, stock]) => stock > 0)
            .map(([s]) => s)

          // Recalculer stock total
          const updatedStock = Object.values(updatedSizeStock).reduce((a, b) => a + b, 0)

          await prisma.product.update({
            where: { id: product.id },
            data: {
              sizeStock: updatedSizeStock,
              sizes: updatedSizes,
              stock: updatedStock,
              // active reste true — produit visible même si stock=0 (affiché grisé)
            },
          })

          console.log(`📦 ${product.name} | taille ${size} | stock ${product.stock} → ${updatedStock} | tailles dispo: ${updatedSizes.join(', ') || 'aucune'}`)
        }

        console.log(`✅ Commande #${orderId} confirmée, stocks mis à jour`)
      }
    }
  }

  return NextResponse.json({ received: true })
}