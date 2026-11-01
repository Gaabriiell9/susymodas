import Link from 'next/link'
import { Suspense } from 'react'
import ProductCard from '@/components/product/ProductCard'
import CollectionToolbar from '@/components/product/CollectionToolbar'
import { listProducts, availableSizes } from '@/lib/products'
import { CATEGORIES } from '@/lib/catalog'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function heading({ categorie, q, promo, tri }) {
  if (q) return { title: `« ${q} »`, kicker: 'Recherche' }
  if (promo) return { title: 'Promotions', kicker: 'Petits prix, grande élégance' }
  const cat = CATEGORIES.find((c) => c.id === categorie)
  if (cat) return { title: cat.label, kicker: cat.description }
  if (tri === 'nouveautes') return { title: 'Nouveautés', kicker: 'Les dernières arrivées' }
  return { title: 'Toute la collection', kicker: 'Mode évangélique' }
}

export async function generateMetadata({ searchParams }) {
  return { title: heading(searchParams).title.replace(/[«»]/g, '').trim() }
}

export default async function CollectionPage({ searchParams }) {
  const categorie = CATEGORIES.some((c) => c.id === searchParams.categorie) ? searchParams.categorie : undefined
  const q = typeof searchParams.q === 'string' ? searchParams.q.slice(0, 60) : undefined
  const promo = searchParams.promo === '1'
  const [products, sizes] = await Promise.all([
    listProducts({ category: categorie, q, size: searchParams.taille, sort: searchParams.tri, promo, inStock: searchParams.dispo === '1' }),
    availableSizes(categorie),
  ])
  const { title, kicker } = heading({ categorie, q, promo, tri: searchParams.tri })

  const tab = (active) => cn('shrink-0 whitespace-nowrap border-b-2 py-3 transition-colors duration-short', active ? 'border-accent text-ink' : 'border-transparent text-ink-2 hover:border-ink')

  return (
    <>
      <section className="shop-container pt-12 lg:pt-16">
        <div className="grid items-end gap-6 lg:grid-cols-12">
          <h1 className="text-display-s lg:col-span-8">{title}</h1>
          <p className="text-muted lg:col-span-4 lg:text-right">{kicker}, {products.length} article{products.length > 1 ? 's' : ''}</p>
        </div>
        <nav aria-label="Catégories" className="no-scrollbar -mx-gutter mt-12 overflow-x-auto px-gutter">
          <ul className="flex gap-8 border-b border-rule">
            <li><Link href="/collection" aria-current={!categorie && !promo && !q ? 'page' : undefined} className={tab(!categorie && !promo && !q)}>Tout</Link></li>
            {CATEGORIES.map((c) => (
              <li key={c.id}><Link href={`/collection?categorie=${c.id}`} aria-current={categorie === c.id ? 'page' : undefined} className={tab(categorie === c.id)}>{c.label}</Link></li>
            ))}
            <li><Link href="/collection?promo=1" aria-current={promo ? 'page' : undefined} className={cn(tab(promo), 'text-accent')}>Promotions</Link></li>
          </ul>
        </nav>
      </section>

      <Suspense>
        <CollectionToolbar sizes={sizes} count={products.length} />
      </Suspense>

      <section className="shop-container pb-section pt-12">
        {products.length ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-16 max-sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
          </div>
        ) : (
          <div className="rule-ink grid gap-6 py-16 lg:grid-cols-12">
            <p className="display text-[2.5rem] lg:col-span-7">Aucun article ne correspond</p>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="text-muted">Essayez une autre taille ou une autre catégorie.</p>
              <Link href="/collection" className="btn-outline mt-6">Voir toute la collection</Link>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
