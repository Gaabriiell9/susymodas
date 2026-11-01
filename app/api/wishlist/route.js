import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { serializeProduct } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ items: [] })
  const rows = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id, product: { active: true } },
    include: { product: true },
  })
  return NextResponse.json({ items: rows.map((r) => serializeProduct(r.product)) })
}

export async function POST(request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  const ids = [].concat((await request.json()).productId ?? []).map(Number).filter(Boolean)
  for (const productId of ids) {
    const exists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
    if (!exists) continue
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      update: {},
      create: { userId: session.user.id, productId },
    })
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  const { productId } = await request.json()
  await prisma.wishlistItem.deleteMany({ where: { userId: session.user.id, productId: Number(productId) } })
  return NextResponse.json({ success: true })
}
