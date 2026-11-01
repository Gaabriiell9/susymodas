'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { discountPercent, isNew, stockForSize } from '@/lib/catalog'
import { cn, formatPrice } from '@/lib/utils'

export default function ProductCard({ product, priority = false, sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw' }) {
  const { addItem } = useCart()
  const { toggle, isWished } = useWishlist()
  const wished = isWished(product.id)
  const [img1, img2] = product.images ?? []
  const discount = discountPercent(product)
  const soldOut = product.stock <= 0
  const lowStock = !soldOut && product.stock <= 2
  const single = product.sizes.length === 1

  function quickAdd(size) {
    addItem({ ...product, maxStock: stockForSize(product, size) }, size)
  }

  return (
    <article className="group relative min-w-0">
      <div className="photo relative aspect-[3/4] overflow-hidden bg-paper-2">
        <Link href={`/produit/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          {img1 ? (
            <>
              <Image src={img1} alt="" fill priority={priority} sizes={sizes} className={cn('object-cover', soldOut && 'opacity-60')} />
              {img2 && (
                <Image src={img2} alt="" fill sizes={sizes} className="object-cover opacity-0 transition-opacity duration-long ease-out group-hover:opacity-100" />
              )}
            </>
          ) : (
            <span className="display absolute inset-0 flex items-center justify-center bg-paper-2 p-6 text-center text-[2rem] text-ink-2">
              {product.name}
            </span>
          )}
        </Link>

        {(soldOut || discount > 0 || isNew(product)) && (
          <span className={cn('chip pointer-events-none absolute left-3 top-3', !soldOut && discount > 0 && 'chip-accent')}>
            {soldOut ? 'Épuisé' : discount > 0 ? `-${discount} %` : 'Nouveau'}
          </span>
        )}

        <button
          type="button"
          onClick={() => toggle(product)}
          aria-label={wished ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          aria-pressed={wished}
          className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center text-ink transition-colors duration-short hover:text-accent"
        >
          <Heart size={20} strokeWidth={1.5} className={cn(wished && 'fill-current text-accent')} />
        </button>

        {!soldOut && (
          <div className="invisible absolute inset-x-0 bottom-0 hidden bg-paper p-3 opacity-0 transition-opacity duration-short ease-out group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 motion-reduce:transition-none md:block">
            {single ? (
              <button type="button" onClick={() => quickAdd(product.sizes[0])} className="btn-primary w-full">Ajouter au panier</button>
            ) : (
              <div className="flex flex-wrap gap-1" role="group" aria-label={`Ajouter ${product.name} au panier, choisir une taille`}>
                {product.sizes.map((s) => {
                  const left = stockForSize(product, s)
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={left <= 0}
                      onClick={() => quickAdd(s)}
                      className="h-11 min-w-[44px] flex-1 border border-muted px-2 text-sm font-medium transition-colors duration-micro hover:border-ink hover:bg-paper-2 disabled:cursor-not-allowed disabled:border-rule disabled:text-muted disabled:line-through"
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <Link href={`/produit/${product.slug}`} className="mt-4 block">
        <h3 className="font-body text-lg font-medium leading-snug tracking-normal">{product.name}</h3>
        <p className="mt-1 flex items-baseline gap-2 tabular-nums">
          <span className={cn(discount > 0 && 'text-accent')}>{formatPrice(product.price)}</span>
          {discount > 0 && <s className="text-sm text-muted">{formatPrice(product.originalPrice)}</s>}
        </p>
        {lowStock ? (
          <p className="mt-1 text-sm text-accent">Plus que {product.stock} en stock</p>
        ) : product.colors?.length > 1 ? (
          <p className="mt-1 text-sm text-muted">{product.colors.length} coloris</p>
        ) : null}
      </Link>
    </article>
  )
}
