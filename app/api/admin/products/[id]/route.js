import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminRoute } from '@/lib/server/admin-api'
import { parseProductInput, uniqueSlug } from '@/lib/server/product-input'
import { serializeProduct } from '@/lib/catalog'
import { deleteImages } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export const PUT = adminRoute(async (request, { params }) => {
  const id = parseInt((await params).id, 10)
  const current = await prisma.product.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })

  const body = await request.json()
  // Mise à jour rapide (ex : activer / désactiver depuis la liste)
  if (body.quick) {
    const data = {}
    if (typeof body.active === 'boolean') data.active = body.active
    if (typeof body.featured === 'boolean') data.featured = body.featured
    const product = await prisma.product.update({ where: { id }, data })
    revalidatePath('/', 'layout')
    return NextResponse.json({ product: serializeProduct(product) })
  }

  const { errors, data } = parseProductInput(body)
  if (errors.length) return NextResponse.json({ error: errors.join(' ') }, { status: 400 })
  const slug = data.name !== current.name ? await uniqueSlug(data.name, id) : current.slug
  const product = await prisma.product.update({ where: { id }, data: { ...data, slug } })

  const removed = (current.images ?? []).filter((u) => !data.images.includes(u))
  if (removed.length) await deleteImages(removed)
  revalidatePath('/', 'layout')
  return NextResponse.json({ product: serializeProduct(product) })
})

export const DELETE = adminRoute(async (_request, { params }) => {
  const id = parseInt((await params).id, 10)
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
  // L'historique des ventes est conservé (nom et photo copiés dans chaque ligne de commande)
  await prisma.product.delete({ where: { id } })
  await deleteImages(product.images)
  revalidatePath('/', 'layout')
  return NextResponse.json({ success: true })
})
