import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// Calcule le stock max pour une taille donnée
function getMaxStock(product, size) {
    if (!size || !product.sizes?.length) return product.stock ?? 1
    const idx = product.sizes.indexOf(size)
    if (idx === -1) return product.stock ?? 1
    // Stock réparti équitablement entre les tailles
    return Math.floor(product.stock / product.sizes.length) || 1
}

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ items: [] })

    const cartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true },
    })

    const items = cartItems.map(c => ({
        id: c.product.id,
        name: c.product.name,
        price: c.product.price,
        size: c.size,
        qty: c.quantity,
        images: c.product.images,
        // On recalcule maxStock à chaque chargement depuis la DB
        maxStock: getMaxStock(c.product, c.size),
    }))

    return NextResponse.json({ items })
}

export async function POST(request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const { productId, quantity, size } = await request.json()

    // Vérifier le stock avant d'ajouter
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })

    const maxStock = getMaxStock(product, size)

    // Récupérer la quantité déjà dans le panier
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
    const productId = parseInt(searchParams.get('productId'))

    await prisma.cartItem.deleteMany({
        where: { userId: session.user.id, productId },
    })

    return NextResponse.json({ success: true })
}