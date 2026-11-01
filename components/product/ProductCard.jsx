'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { discountPercent, isNew, stockForSize } from '@/lib/catalog'
import { cn, formatPrice } from '@/lib/utils'

export default function ProductCard({ product, priority = false }) {
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
    <article className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
        <Link href={`/produit/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          {img1 ? (
            <>
              <Image
                src={img1}
                alt={product.name}
                fill
                priority={priority}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn('object-cover transition duration-700 ease-out', img2 ? 'group-hover:opacity-0' : 'group-hover:scale-[1.04]', soldOut && 'opacity-60')}
              />
              {img2 && (
                <Image src={img2} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover opacity-0 transition duration-700 group-hover:opacity-100" />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand to-blush-light">
              <span className="font-serif text-lg italic text-ink-muted/60">Susy Modas</span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="bg-ivory px-2 py-1 text-[10px] uppercase tracking-label">Épuisé</span>
          ) : discount > 0 ? (
            <span className="bg-sale px-2 py-1 text-[10px] uppercase tracking-label text-ivory">-{discount}%</span>
          ) : isNew(product) ? (
            <span className="bg-ivory px-2 py-1 text-[10px] uppercase tracking-label">Nouveau</span>
          ) : null}
        </div>

        <button
          onClick={() => toggle(product)}
          aria-label={wished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className="absolute right-1.5 top-1.5 p-2"
        >
          <Heart size={19} strokeWidth={1.3} className={cn('transition', wished ? 'fill-ink text-ink' : 'text-ink')} />
        </button>

        {/* Ajout rapide (ordinateur) */}
        {!soldOut && (
          <div className="absolute inset-x-2.5 bottom-2.5 hidden translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
            <div className="bg-ivory/95 p-3 backdrop-blur">
              {single ? (
                <button onClick={() => quickAdd(product.sizes[0])} className="label flex w-full items-center justify-center gap-2 py-1">
                  <Plus size={14} /> Ajouter au panier
                </button>
              ) : (
                <>
                  <p className="mb-2 text-center text-[10px] uppercase tracking-label text-ink-muted">Ajout rapide</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {product.sizes.map((s) => {
                      const left = stockForSize(product, s)
                      return (
                        <button
                          key={s}
                          disabled={left <= 0}
                          onClick={() => quickAdd(s)}
                          className="min-w-[36px] border border-line px-2 py-1.5 text-[12px] transition hover:border-ink disabled:cursor-not-allowed disabled:text-ink-muted/40 disabled:line-through"
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Link href={`/produit/${product.slug}`} className="mt-3 block">
        <h3 className="text-[14px] leading-snug">{product.name}</h3>
        <div className="mt-1 flex items-baseline gap-2 text-[14px]">
          <span className={cn(discount > 0 && 'text-sale')}>{formatPrice(product.price)}</span>
          {discount > 0 && <span className="text-[13px] text-ink-muted line-through">{formatPrice(product.originalPrice)}</span>}
        </div>
        {product.colors?.length > 1 && <p className="mt-1 text-[12px] text-ink-muted">{product.colors.length} coloris</p>}
        {lowStock && <p className="mt-1 text-[12px] text-sale">Plus que {product.stock} en stock</p>}
      </Link>
    </article>
  )
}
