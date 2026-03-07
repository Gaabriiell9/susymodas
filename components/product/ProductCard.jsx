'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Heart, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { formatPrice, cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Stars from '@/components/ui/Stars'

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart()
  const { toggle, isWished } = useWishlist()
  const [added, setAdded] = useState(false)
  const [showSizes, setShowSizes] = useState(false)

  const wished = isWished(product.id)
  const badge = product.tags?.[0] ?? null
  const hasImage = product.images?.length > 0
  const isSold = product.stock === 0
  const hasSizes = product.sizes?.length > 0

  function getStockForSize(size) {
    if (product.sizeStock && product.sizeStock[size] !== undefined) return product.sizeStock[size]
    if (hasSizes && product.sizes.length > 0) return Math.floor((product.stock ?? 1) / product.sizes.length) || 1
    return product.stock ?? 1
  }

  function handleAddClick(e) {
    e.preventDefault()
    e.stopPropagation()
    if (isSold) return
    if (!hasSizes || product.sizes.length === 1) {
      doAdd(product.sizes?.[0] ?? null, getStockForSize(product.sizes?.[0]))
      return
    }
    setShowSizes(true)
  }

  function doAdd(size, maxStock) {
    addItem({ id: product.id, name: product.name, price: product.price, images: product.images, size, maxStock })
    setShowSizes(false)
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
      <article className={cn(
        'group relative bg-cream rounded-2xl overflow-hidden transition-all duration-300 shadow-sm cursor-pointer',
        isSold ? 'opacity-75' : 'hover:-translate-y-1 hover:shadow-xl'
      )}>

        <div className="relative overflow-hidden aspect-[3/4]">
          {hasImage ? (
            <Image src={product.images[0]} alt={product.name} fill
              className={cn('object-cover object-top', isSold && 'grayscale opacity-60')}
              sizes="(max-width: 768px) 50vw, 25vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl sm:text-6xl opacity-40 select-none" aria-hidden>👗</span>
            </div>
          )}

          {isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-brown font-sans text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">Vendu</span>
            </div>
          )}

          {!isSold && badge && <Badge label={badge} />}

          <button onClick={handleWish}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-all duration-200 z-10"
            aria-label={wished ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
            <Heart size={14} className={wished ? 'fill-rose-deep text-rose-deep' : 'text-brown-light'} />
          </button>

          {/* Sélecteur de taille overlay */}
          {showSizes && (
            <div onClick={e => e.preventDefault()}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizes(false) }}
                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                <X size={14} />
              </button>
              <p className="font-sans text-[0.65rem] uppercase tracking-widest text-white/80 mb-3">Choisir une taille</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {product.sizes.map((size) => {
                  const stock = getStockForSize(size)
                  return (
                    <button key={size}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); doAdd(size, stock) }}
                      className="relative min-w-[2.8rem] h-10 px-3 rounded-xl bg-white text-brown font-sans text-xs font-semibold hover:bg-gold hover:text-white transition-colors active:scale-95 flex flex-col items-center justify-center gap-0">
                      <span>{size}</span>
                      <span className="text-[0.5rem] opacity-50 leading-none">{stock} unité{stock > 1 ? 's' : ''}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!isSold && !showSizes && (
            <div className="absolute inset-x-0 bottom-0 hidden sm:block translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2.5">
              <button onClick={handleAddClick}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-sans text-[0.68rem] tracking-[0.08em] uppercase font-medium transition-colors duration-200',
                  added ? 'bg-green-600' : 'bg-gold hover:bg-rose-deep'
                )}>
                <ShoppingBag size={13} />
                {added ? '✓ Ajouté !' : 'Ajouter au panier'}
              </button>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <p className="font-sans text-[0.6rem] tracking-[0.1em] uppercase text-taupe mb-0.5">
            {product.sizes?.join(' · ') ?? product.category}
          </p>
          <h3 className={cn('font-serif text-sm sm:text-base leading-snug', isSold ? 'text-gray-400' : 'text-brown')}>{product.name}</h3>

          <div className="flex items-center justify-between mt-1.5 sm:mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className={cn('font-serif text-base sm:text-lg font-semibold', isSold ? 'text-gray-400 line-through' : 'text-brown')}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && !isSold && (
                <span className="font-sans text-[0.7rem] text-taupe line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            {!isSold && <Stars rating={5} />}
          </div>

          {isSold ? (
            <div className="sm:hidden mt-2.5 w-full flex items-center justify-center py-2 rounded-xl bg-gray-100 font-sans text-[0.68rem] uppercase text-gray-400 font-medium">Vendu</div>
          ) : (
            <button onClick={handleAddClick}
              className={cn(
                'sm:hidden mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-white font-sans text-[0.68rem] tracking-[0.06em] uppercase font-medium transition-colors duration-200',
                added ? 'bg-green-600' : 'bg-gold'
              )}>
              <ShoppingBag size={12} />
              {added ? '✓ Ajouté !' : 'Panier'}
            </button>
          )}
        </div>
      </article>
    </Link>
  )
}