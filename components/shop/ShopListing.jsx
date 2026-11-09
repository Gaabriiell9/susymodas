import Link from 'next/link'
import { Suspense } from 'react'
import ProductCard from '@/components/product/ProductCard'
import ShopFilters from '@/components/shop/ShopFilters'
import ShopToolbar from '@/components/shop/ShopToolbar'
import { listProducts, availableSizes, categoryCounts } from '@/lib/products'
import { PRICE_RANGES, parseFilters, titleFor } from '@/components/shop/filters'

// Vitrine : page d'arrivée du site et /collection
export default async function ShopListing({ searchParams }) {
  const f = parseFilters(searchParams)
  const range = PRICE_RANGES.find((r) => r.id === f.prix)
  const [products, sizes, counts] = await Promise.all([
    listProducts({
      category: f.categorie || undefined,
      q: f.q || undefined,
      size: f.taille || undefined,
      sort: f.tri,
      promo: f.promo,
      inStock: f.dispo,
      minPrice: range?.min || undefined,
      maxPrice: range?.max || undefined,
    }),
    availableSizes(f.categorie || undefined),
    categoryCounts(),
  ])
  const title = titleFor(f)

  return (
    <div className="shop-container pb-section-s pt-6 lg:pt-8">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <Link href="/" className="link-underline">Boutique</Link>
        {title !== 'Toute la boutique' && <><span className="px-2" aria-hidden="true">/</span><span className="text-ink-2">{title}</span></>}
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Filtres (ordinateur) */}
        <aside className="hidden lg:block" aria-label="Filtres">
          <div className="sticky top-[124px] max-h-[calc(100dvh-136px)] overflow-y-auto pb-8 pr-2">
            <Suspense><ShopFilters sizes={sizes} counts={counts} /></Suspense>
          </div>
        </aside>

        <section aria-labelledby="titre-vitrine" className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h1 id="titre-vitrine">{title}</h1>
            <p className="text-sm text-muted tabular-nums">{products.length} article{products.length > 1 ? 's' : ''}</p>
          </div>

          <Suspense><ShopToolbar sizes={sizes} counts={counts} count={products.length} /></Suspense>

          {products.length ? (
            <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <li key={p.id}><ProductCard product={p} priority={i < 4} /></li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 border border-rule bg-paper-2 px-6 py-14 text-center">
              <p className="text-lg font-semibold">Aucun article ne correspond à votre recherche</p>
              <p className="mt-2 text-muted">Retirez un filtre ou essayez une autre taille.</p>
              <Link href="/" className="btn-outline mt-6">Voir toute la boutique</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
