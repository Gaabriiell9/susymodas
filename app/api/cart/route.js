import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

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
    }))

    return NextResponse.json({ items })
}

export async function POST(request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const { productId, quantity, size } = await request.json()

    await prisma.cartItem.upsert({
        where: { userId_productId_size: { userId: session.user.id, productId, size: size ?? '' } },
        update: { quantity: { increment: quantity } },
        create: { userId: session.user.id, productId, quantity, size: size ?? '' },
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