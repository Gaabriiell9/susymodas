import { CATEGORIES, deriveStock, slugify } from '@/lib/catalog'
import prisma from '@/lib/prisma'

const toList = (v) =>
  (Array.isArray(v) ? v : String(v ?? '').split(','))
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 30)

// Valide et normalise les données d'un article envoyées par l'espace gestion
export function parseProductInput(body) {
  const name = String(body.name ?? '').trim().slice(0, 120)
  const price = Math.round(parseFloat(body.price) * 100) / 100
  const originalPrice = body.originalPrice ? Math.round(parseFloat(body.originalPrice) * 100) / 100 : null
  const category = CATEGORIES.some((c) => c.id === body.category) ? body.category : CATEGORIES[0].id
  const errors = []
  if (!name) errors.push('Le nom est obligatoire.')
  if (!(price > 0)) errors.push('Le prix doit être supérieur à 0.')
  if (originalPrice !== null && !(originalPrice > price)) errors.push('Le prix barré doit être supérieur au prix de vente.')

  const { sizeStock, sizes, stock } = deriveStock(body.sizeStock)
  if (!sizes.length) errors.push('Ajoutez au moins une taille (ou "TU" pour taille unique).')

  const images = toList(body.images).filter((u) => /^https:\/\//.test(u)).slice(0, 10)

  return {
    errors,
    data: {
      name,
      description: String(body.description ?? '').trim().slice(0, 4000),
      price,
      originalPrice,
      category,
      tags: toList(body.tags).map((t) => t.toLowerCase()),
      colors: toList(body.colors),
      images,
      sizeStock,
      sizes,
      stock,
      featured: !!body.featured,
      active: body.active !== false,
    },
  }
}

export async function uniqueSlug(name, exceptId) {
  const base = slugify(name) || 'article'
  let slug = base
  for (let i = 2; i < 50; i++) {
    const found = await prisma.product.findUnique({ where: { slug }, select: { id: true } })
    if (!found || found.id === exceptId) return slug
    slug = `${base}-${i}`
  }
  return `${base}-${Date.now()}`
}
