// app/api/products/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

// ── GET /api/products ─────────────────────────────────────────────────────────
// Paramètres optionnels : ?category=eglise&active=true
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active') !== 'false'

    const products = await prisma.product.findMany({
      where: {
        ...(category && { category }),
        ...(activeOnly && { active: true }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('[GET /api/products]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ── POST /api/products ────────────────────────────────────────────────────────
// Réservé admin — crée un nouveau produit
export async function POST(request) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await request.json()

    // Validation basique
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Génère un slug unique depuis le nom
    const baseSlug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    let slug = baseSlug
    let count = 1
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`
    }

    const product = await prisma.product.create({
      data: {
        slug,
        name:          body.name,
        description:   body.description ?? '',
        price:         parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        category:      body.category,
        tags:          body.tags ?? [],
        images:        body.images ?? [],
        sizes:         body.sizes ?? [],
        colors:        body.colors ?? [],
        stock:         parseInt(body.stock ?? 0),
        active:        body.active ?? true,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/products]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
