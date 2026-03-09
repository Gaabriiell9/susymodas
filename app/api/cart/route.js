// app/api/cart/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

function getMaxStock(product, size) {
    if (!size || !product.sizes?.length) return product.stock ?? 1
    const idx = product.sizes.indexOf(size)
    if (idx === -1) return product.stock ?? 1
    return Math.floor(product.stock / product.sizes.length) || 1
}

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ items: [] })

    const cartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true },
    })

    // Filtrer les items dont le produit n'a plus de stock pour cette taille
    const items = cartItems
        .filter(c => c.product.active)
        .map(c => ({
            id: c.product.id,
            name: c.product.name,
            price: c.product.price,
            size: c.size,
            qty: c.quantity,
            images: c.product.images,
            maxStock: getMaxStock(c.product, c.size),
        }))

    return NextResponse.json({ items })
}

export async function POST(request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const { productId, quantity, size } = await request.json()

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })

    const maxStock = getMaxStock(product, size)
    const existing = await prisma.cartItem.findUnique({
        where: { userId_productId_size: { userId: session.user.id, productId, size: size ?? '' } }
    })
    const currentQty = existing?.quantity ?? 0
    const newQty = Math.min(currentQty + quantity, maxStock)

    await prisma.cartItem.upsert({
        where: { userId_productId_size: { userId: session.user.id, productId, size: size ?? '' } },
        update: { quantity: newQty },
        create: { userId: session.user.id, productId, quantity: newQty, size: size ?? '' },
    })

    return NextResponse.json({ success: true })
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (productId) {
        // Supprimer un article spécifique
        await prisma.cartItem.deleteMany({
            where: { userId: session.user.id, productId: parseInt(productId) },
        })
    } else {
        // Vider tout le panier (appelé après paiement)
        await prisma.cartItem.deleteMany({
            where: { userId: session.user.id },
        })
    }

    return NextResponse.json({ success: true })
}