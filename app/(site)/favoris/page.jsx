'use client'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { useWishlist } from '@/context/WishlistContext'

export default function FavorisPage() {
  const { items } = useWishlist()
  return (
    <div className="shop-container py-12 lg:py-16">
      <h1 className="text-display-s">Favoris</h1>
      {items.length === 0 ? (
        <div className="rule-ink mt-12 py-16">
          <p className="text-ink-muted">Touchez le cœur d&apos;un article pour le retrouver ici.</p>
          <Link href="/collection" className="btn-dark mt-8">Découvrir la collection</Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-16 max-sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={{ ...p, sizes: p.sizes ?? [], sizeStock: p.sizeStock ?? {}, stock: p.stock ?? 0 }} />)}
        </div>
      )}
    </div>
  )
}
