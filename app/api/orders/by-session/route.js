// app/api/orders/by-session/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId || !sessionId.startsWith('cs_')) {
        return NextResponse.json({ error: 'session_id invalide' }, { status: 400 })
    }

    try {
        // 1. Vérifier la session directement chez Stripe — impossible à falsifier
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

        // 2. Vérifier que le paiement est bien effectué
        if (stripeSession.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 403 })
        }

        // 3. Récupérer la commande via le stripeSessionId en DB
        const order = await prisma.order.findFirst({
            where: { stripeSessionId: sessionId },
            include: {
                items: {
                    include: { product: { select: { name: true, images: true, slug: true } } }
                }
            },
        })

        if (!order) {
            return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
        }

        // 4. Ne retourner que les champs nécessaires pour le reçu (pas de données sensibles)
        return NextResponse.json({
            order: {
                reference: order.reference,
                status: order.status,
                createdAt: order.createdAt,
                firstName: order.firstName,
                lastName: order.lastName,
                email: order.email,
                phone: order.phone,
                address: order.address,
                paymentMethod: order.paymentMethod,
                totalAmount: order.totalAmount,
                paidAt: order.paidAt,
                items: order.items.map(i => ({
                    name: i.product?.name ?? 'Produit',
                    image: i.product?.images?.[0] ?? null,
                    size: i.size,
                    quantity: i.quantity,
                    price: i.price,
                })),
            }
        })
    } catch (err) {
        console.error('[by-session]', err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}