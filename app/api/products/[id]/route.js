// app/api/products/[id]/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

// ── GET /api/products/:id ─────────────────────────────────────────────────────
export async function GET(_, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
    })
    if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ── PUT /api/products/:id ─────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await request.json()

    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(body.name          && { name: body.name }),
        ...(body.description   !== undefined && { description: body.description }),
        ...(body.price         && { price: parseFloat(body.price) }),
        ...(body.originalPrice !== undefined && { originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null }),
        ...(body.category      && { category: body.category }),
        ...(body.tags          && { tags: body.tags }),
        ...(body.images        && { images: body.images }),
        ...(body.sizes         && { sizes: body.sizes }),
        ...(body.colors        && { colors: body.colors }),
        ...(body.stock         !== undefined && { stock: parseInt(body.stock) }),
        ...(body.active        !== undefined && { active: body.active }),
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ── DELETE /api/products/:id ──────────────────────────────────────────────────
export async function DELETE(_, { params }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    // Soft delete — désactive le produit au lieu de le supprimer
    await prisma.product.update({
      where: { id: parseInt(params.id) },
      data:  { active: false },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
