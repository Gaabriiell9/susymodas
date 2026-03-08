// app/api/products/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const size = searchParams.get('size')
    const active = searchParams.get('active')

    const where = {}

    if (active === 'false') {
      // Admin : tous les produits sans filtre
    } else {
      // Site public : produits actifs (incluant ceux stock=0 qui sont "Vendu")
      where.active = true
    }

    if (size) where.sizes = { has: size }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, description, price, originalPrice, sizes, colors, tags, stock, active, images, category } = body

    const slug = await generateSlug(name)

    const product = await prisma.product.create({
      data: {
        slug,
        name,
        description: description || '',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category: category || sizes?.[0] || 'unique',
        sizes: sizes || [],
        colors: colors || [],
        tags: tags || [],
        stock: parseInt(stock) || 0,
        active: active ?? true,
        images: images || [],
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function generateSlug(name) {
  let slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`
  return slug
}