// Lecture du catalogue côté serveur
import prisma from '@/lib/prisma'
import { serializeProduct, sortSizes } from '@/lib/catalog'

async function safe(fn, fallback) {
  try { return await fn() } catch (e) { console.error('[products]', e.message); return fallback }
}

const SORTS = {
  nouveautes: [{ createdAt: 'desc' }],
  'prix-asc': [{ price: 'asc' }],
  'prix-desc': [{ price: 'desc' }],
  selection: [{ featured: 'desc' }, { createdAt: 'desc' }],
}

export async function listProducts({ category, q, size, sort = 'selection', promo, inStock, minPrice, maxPrice } = {}) {
  return safe(async () => {
    const where = { active: true }
    if (category) where.category = category
    if (size) where.sizes = { has: size }
    if (inStock) where.stock = { gt: 0 }
    if (minPrice || maxPrice) where.price = { ...(minPrice ? { gte: minPrice } : {}), ...(maxPrice ? { lt: maxPrice } : {}) }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { colors: { has: q } },
        { tags: { has: q.toLowerCase() } },
      ]
    }
    if (promo) where.originalPrice = { not: null }
    let rows = await prisma.product.findMany({ where, orderBy: SORTS[sort] ?? SORTS.selection, take: 200 })
    if (promo) rows = rows.filter((p) => p.originalPrice > p.price)
    // Les articles épuisés passent en fin de liste
    rows.sort((a, b) => (a.stock > 0 ? 0 : 1) - (b.stock > 0 ? 0 : 1))
    return rows.map(serializeProduct)
  }, [])
}

export async function availableSizes(category) {
  return safe(async () => {
    const rows = await prisma.product.findMany({ where: { active: true, ...(category ? { category } : {}) }, select: { sizes: true } })
    return sortSizes([...new Set(rows.flatMap((r) => r.sizes))])
  }, [])
}

export async function getProductBySlug(slug) {
  return safe(async () => {
    const p = await prisma.product.findFirst({ where: { slug, active: true } })
    return p ? serializeProduct(p) : null
  }, null)
}

export async function getRelated(product, take = 4) {
  return safe(async () => {
    const rows = await prisma.product.findMany({
      where: { active: true, id: { not: product.id }, category: product.category, stock: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      take,
    })
    if (rows.length < take) {
      const more = await prisma.product.findMany({
        where: { active: true, id: { notIn: [product.id, ...rows.map((r) => r.id)] }, stock: { gt: 0 } },
        orderBy: { createdAt: 'desc' },
        take: take - rows.length,
      })
      rows.push(...more)
    }
    return rows.map(serializeProduct)
  }, [])
}

export async function homeData() {
  return safe(async () => {
    const [newest, featured, counts, covers] = await Promise.all([
      prisma.product.findMany({ where: { active: true, stock: { gt: 0 } }, orderBy: { createdAt: 'desc' }, take: 8 }),
      prisma.product.findMany({ where: { active: true, featured: true }, orderBy: { updatedAt: 'desc' }, take: 8 }),
      prisma.product.groupBy({ by: ['category'], where: { active: true }, _count: true }),
      prisma.product.findMany({
        where: { active: true, NOT: { images: { isEmpty: true } } },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        distinct: ['category'],
        select: { category: true, images: true },
      }),
    ])
    return {
      newest: newest.map(serializeProduct),
      featured: featured.map(serializeProduct),
      counts: Object.fromEntries(counts.map((c) => [c.category, c._count])),
      covers: Object.fromEntries(covers.map((c) => [c.category, c.images[0]])),
    }
  }, { newest: [], featured: [], counts: {}, covers: {} })
}

// Nombre d'articles en ligne par catégorie (pour la barre de filtres)
export async function categoryCounts() {
  return safe(async () => {
    const rows = await prisma.product.groupBy({ by: ['category'], where: { active: true }, _count: true })
    return Object.fromEntries(rows.map((r) => [r.category, r._count]))
  }, {})
}
