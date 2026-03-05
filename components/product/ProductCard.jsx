'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Heart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { formatPrice, cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Stars from '@/components/ui/Stars'

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart()
  const { toggle, isWished } = useWishlist()
  const [added, setAdded] = useState(false)

  const wished = isWished(product.id)
  const badge = product.tags?.[0] ?? null
  const hasImage = product.images?.length > 0

  function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    addItem({ id: product.id, name: product.name, price: product.price, images: product.images })
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 1500)
  }

  function handleWish(e) {
    e.preventDefault()
    e.stopPropagation()
    toggle(product)
  }

  return (
    <Link href={`/produit/${product.slug}`}>
      <article className="group relative bg-cream rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm cursor-pointer">

        {/* Zone image */}
        <div className="relative flex items-center justify-center overflow-hidden aspect-[4/3] sm:aspect-[3/4]">
          {hasImage ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
          ) : (
            <span className="text-5xl sm:text-6xl opacity-40 select-none" aria-hidden>👗</span>
          )}

          {badge && <Badge label={badge} />}

          {/* Coeur favoris — toujours visible sur mobile */}
          <button
            onClick={handleWish}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
            aria-label={wished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart size={14} className={wished ? 'fill-rose-deep text-rose-deep' : 'text-brown-light'} />
          </button>

          {/* Bouton panier desktop au survol */}
          <div className="absolute inset-x-0 bottom-0 hidden sm:block translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2.5">
            <button onClick={handleAdd}
              className={cn('w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-sans text-[0.68rem] tracking-[0.08em] uppercase font-medium transition-colors duration-200',
                added ? 'bg-green-600' : 'bg-gold hover:bg-rose-deep'
              )}>
              <ShoppingBag size={13} />
              {added ? '✓ Ajouté !' : 'Ajouter au panier'}
            </button>
          </div>
        </div>

        {/* Infos */}
        <div className="p-3 sm:p-4">
          <p className="font-sans text-[0.6rem] tracking-[0.1em] uppercase text-taupe mb-0.5">{product.category}</p>
          <h3 className="font-serif text-sm sm:text-base text-brown leading-snug">{product.name}</h3>

          <div className="flex items-center justify-between mt-1.5 sm:mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-base sm:text-lg font-semibold text-brown">{formatPrice(product.price)}</span>
              {product.originalPrice && <span className="font-sans text-[0.7rem] text-taupe line-through">{formatPrice(product.originalPrice)}</span>}
            </div>
            <Stars rating={5} />
          </div>

          {/* Bouton panier mobile */}
          <button onClick={handleAdd}
            className={cn('sm:hidden mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-white font-sans text-[0.68rem] tracking-[0.06em] uppercase font-medium transition-colors duration-200',
              added ? 'bg-green-600' : 'bg-gold'
            )}>
            <ShoppingBag size={12} />
            {added ? '✓ Ajouté !' : 'Panier'}
          </button>
        </div>
      </article>
    </Link>
  )
}