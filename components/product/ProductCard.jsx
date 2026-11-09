'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { discountPercent, isNew, stockForSize } from '@/lib/catalog'
import { cn, formatPrice } from '@/lib/utils'

export default function ProductCard({ product, priority = false, sizes = '(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 22vw' }) {
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
    <article className="group flex h-full min-w-0 flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-paper-2">
        <Link href={`/produit/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          {img1 ? (
            <>
              <Image src={img1} alt="" fill priority={priority} sizes={sizes} className={cn('object-cover transition-transform duration-long ease-out group-hover:scale-[1.03] motion-reduce:transition-none', soldOut && 'opacity-55')} />
              {img2 && <Image src={img2} alt="" fill sizes={sizes} className="object-cover opacity-0 transition-opacity duration-long ease-out group-hover:opacity-100" />}
            </>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <span className="wordmark text-[1.75rem] text-ink-2/70">Susy Modas</span>
            </span>
          )}
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {soldOut && <span className="bg-ink px-2 py-0.5 text-xs font-semibold text-paper">Épuisé</span>}
          {!soldOut && discount > 0 && <span className="bg-accent px-2 py-0.5 text-xs font-semibold text-accent-ink">-{discount} %</span>}
          {!soldOut && isNew(product) && <span className="bg-paper px-2 py-0.5 text-xs font-semibold">Nouveau</span>}
        </div>

        <button
          type="button"
          onClick={() => toggle(product)}
          aria-label={wished ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          aria-pressed={wished}
          className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 text-ink transition-colors duration-short hover:text-accent"
        >
          <Heart size={18} strokeWidth={1.6} className={cn(wished && 'fill-current text-accent')} />
        </button>

        {!soldOut && single && (
          <button
            type="button"
            onClick={() => quickAdd(product.sizes[0])}
            aria-label={`Ajouter ${product.name} au panier`}
            className="absolute bottom-2 right-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink transition-colors duration-short hover:bg-accent-2"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <Link href={`/produit/${product.slug}`} className="hover:text-accent">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug sm:text-md">{product.name}</h3>
        </Link>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 tabular-nums">
          <span className={cn('font-semibold', discount > 0 && 'text-accent')}>{formatPrice(product.price)}</span>
          {discount > 0 && <s className="text-sm text-muted">{formatPrice(product.originalPrice)}</s>}
        </p>
        {lowStock && <p className="mt-0.5 text-xs font-medium text-accent">Plus que {product.stock} en stock</p>}

        {!soldOut && !single && (
          <div className="mt-auto flex flex-wrap gap-1 pt-2" role="group" aria-label={`Ajouter ${product.name} au panier, choisir une taille`}>
            {product.sizes.map((s) => {
              const left = stockForSize(product, s)
              return (
                <button
                  key={s}
                  type="button"
                  disabled={left <= 0}
                  onClick={() => quickAdd(s)}
                  title={left > 0 ? `Ajouter en taille ${s}` : `Taille ${s} épuisée`}
                  className="h-9 min-w-9 border border-muted px-1.5 text-xs font-medium transition-colors duration-micro hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-rule disabled:text-muted/60 disabled:line-through disabled:hover:bg-transparent disabled:hover:text-muted/60"
                >
                  {s}
                </button>
              )
            })}
          </div>
        )}
        {soldOut && <p className="mt-auto pt-2 text-xs text-muted">Bientôt de retour</p>}
      </div>
    </article>
  )
}
