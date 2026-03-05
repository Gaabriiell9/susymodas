import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const data = {}

    if (body.name !== undefined) data.name = body.name
    if (body.description !== undefined) data.description = body.description
    if (body.price !== undefined) data.price = parseFloat(body.price)
    if (body.originalPrice !== undefined) data.originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null
    if (body.category !== undefined) data.category = body.category
    if (body.sizes !== undefined) data.sizes = body.sizes
    if (body.colors !== undefined) data.colors = body.colors
    if (body.tags !== undefined) data.tags = body.tags
    if (body.stock !== undefined) data.stock = parseInt(body.stock)
    if (body.active !== undefined) data.active = body.active
    if (body.images !== undefined) data.images = body.images

    const product = await prisma.product.update({ where: { id }, data })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)
    // Supprime d'abord les OrderItems liés (contrainte FK)
    await prisma.orderItem.deleteMany({ where: { productId: id } })
    // Puis supprime le produit
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}