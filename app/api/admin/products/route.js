import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminRoute } from '@/lib/server/admin-api'
import { parseProductInput, uniqueSlug } from '@/lib/server/product-input'
import { serializeProduct } from '@/lib/catalog'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export const GET = adminRoute(async () => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ products: products.map(serializeProduct) })
})

export const POST = adminRoute(async (request) => {
  const { errors, data } = parseProductInput(await request.json())
  if (errors.length) return NextResponse.json({ error: errors.join(' ') }, { status: 400 })
  const product = await prisma.product.create({ data: { ...data, slug: await uniqueSlug(data.name) } })
  revalidatePath('/', 'layout')
  return NextResponse.json({ product: serializeProduct(product) }, { status: 201 })
})
