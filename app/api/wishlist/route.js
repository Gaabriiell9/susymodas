import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ items: [] })

    const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: session.user.id },
        include: { product: true },
    })

    const items = wishlistItems.map(w => ({
        id: w.product.id,
        name: w.product.name,
        price: w.product.price,
        slug: w.product.slug,
        images: w.product.images,
        sizes: w.product.sizes,
        tags: w.product.tags,
    }))

    return NextResponse.json({ items })
}

export async function POST(request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const { productId } = await request.json()

    await prisma.wishlistItem.upsert({
        where: { userId_productId: { userId: session.user.id, productId } },
        update: {},
        create: { userId: session.user.id, productId },
    })

    return NextResponse.json({ success: true })
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const { productId } = await request.json()

    await prisma.wishlistItem.deleteMany({
        where: { userId: session.user.id, productId },
    })

    return NextResponse.json({ success: true })
}