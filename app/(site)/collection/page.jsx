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

  const chip = (active) => cn('shrink-0 border px-4 py-2 text-[12px] uppercase tracking-[0.12em] transition', active ? 'border-ink bg-ink text-ivory' : 'border-line hover:border-ink')

  return (
    <>
      <section className="shop-container pb-8 pt-10 text-center lg:pt-14">
        <p className="label text-ink-muted">{kicker}</p>
        <h1 className="display mt-3 text-5xl lg:text-6xl">{title}</h1>
        <nav className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:justify-center">
          <Link href="/collection" className={chip(!categorie && !promo && !q)}>Tout</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/collection?categorie=${c.id}`} className={chip(categorie === c.id)}>{c.label}</Link>
          ))}
          <Link href="/collection?promo=1" className={cn(chip(promo), !promo && 'text-sale')}>Promotions</Link>
        </nav>
      </section>

      <Suspense>
        <CollectionToolbar sizes={sizes} count={products.length} />
      </Suspense>

      <section className="shop-container py-10">
        {products.length ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="display text-3xl">Aucun article ne correspond</p>
            <p className="mt-3 text-[14px] text-ink-muted">Essayez une autre taille ou une autre catégorie.</p>
            <Link href="/collection" className="btn-outline mt-8">Voir toute la collection</Link>
          </div>
        )}
      </section>
    </>
  )
}
