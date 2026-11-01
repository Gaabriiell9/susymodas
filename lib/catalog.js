// Référentiel du catalogue : catégories, tailles, calculs de stock.

export const CATEGORIES = [
  { id: 'robes', label: 'Robes', description: 'Robes longues et midi, modestes et élégantes' },
  { id: 'ensembles', label: 'Ensembles', description: 'Jupes et hauts coordonnés' },
  { id: 'jupes', label: 'Jupes', description: 'Jupes midi et longues' },
  { id: 'hauts', label: 'Hauts & Blouses', description: 'Blouses, chemisiers, tuniques' },
  { id: 'ceremonie', label: 'Cérémonie', description: 'Mariages, baptêmes, grandes occasions' },
  { id: 'enfants', label: 'Enfants', description: 'Pour les petites filles' },
  { id: 'accessoires', label: 'Accessoires', description: 'Sacs, ceintures, bijoux' },
]

export const SIZE_ORDER = ['TU', '2A', '4A', '6A', '8A', '10A', '12A', '14A', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

export const SIZE_LABEL = { TU: 'Taille unique' }

export function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}

export function sortSizes(sizes) {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a)
    const ib = SIZE_ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

// Nettoie un objet { taille: quantité } venant d'un formulaire
export function normalizeSizeStock(input) {
  const out = {}
  for (const [size, qty] of Object.entries(input ?? {})) {
    const s = String(size).trim().toUpperCase()
    const q = Math.max(0, parseInt(qty, 10) || 0)
    if (s) out[s] = q
  }
  return out
}

// Champs dérivés du stock par taille
export function deriveStock(sizeStock) {
  const ss = normalizeSizeStock(sizeStock)
  const sizes = sortSizes(Object.keys(ss))
  const stock = Object.values(ss).reduce((a, b) => a + b, 0)
  return { sizeStock: ss, sizes, stock }
}

export function stockForSize(product, size) {
  const ss = product?.sizeStock ?? {}
  if (size && ss[size] !== undefined) return ss[size]
  if (!size && Object.keys(ss).length === 1) return Object.values(ss)[0]
  return 0
}

export function isNew(product) {
  if (product?.tags?.includes('nouveau')) return true
  const created = new Date(product?.createdAt ?? 0).getTime()
  return Date.now() - created < 1000 * 60 * 60 * 24 * 21
}

export function discountPercent(product) {
  if (!product?.originalPrice || product.originalPrice <= product.price) return 0
  return Math.round((1 - product.price / product.originalPrice) * 100)
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Version "sûre" pour envoyer au navigateur (dates sérialisées)
export function serializeProduct(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    category: p.category,
    tags: p.tags ?? [],
    images: p.images ?? [],
    sizes: sortSizes(p.sizes ?? []),
    colors: p.colors ?? [],
    stock: p.stock ?? 0,
    sizeStock: p.sizeStock ?? {},
    featured: !!p.featured,
    active: !!p.active,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  }
}
