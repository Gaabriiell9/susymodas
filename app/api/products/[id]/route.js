// app/api/products/[id]/route.js
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
    if (body.colors !== undefined) data.colors = body.colors
    if (body.tags !== undefined) data.tags = body.tags
    if (body.active !== undefined) data.active = body.active
    if (body.images !== undefined) data.images = body.images

    // Gestion stock + tailles
    if (body.sizes !== undefined) data.sizes = body.sizes
    if (body.stock !== undefined) data.stock = parseInt(body.stock)

    // sizeStock : { XL: 1, S: 2, ... }
    // Quand on sauvegarde depuis l'admin, on reconstruit sizeStock depuis sizeStock du form
    if (body.sizeStock !== undefined) {
      data.sizeStock = body.sizeStock
    } else if (body.sizes !== undefined && body.stock !== undefined) {
      // Fallback : répartition égale si pas de sizeStock explicite
      const sizes = body.sizes
      const stock = parseInt(body.stock)
      const perSize = sizes.length > 0 ? Math.floor(stock / sizes.length) || 1 : 0
      const ss = {}
      sizes.forEach(s => { ss[s] = perSize })
      data.sizeStock = ss
    }

    const product = await prisma.product.update({ where: { id }, data })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)
    await prisma.wishlistItem.deleteMany({ where: { productId: id } })
    await prisma.cartItem.deleteMany({ where: { productId: id } })
    await prisma.orderItem.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}