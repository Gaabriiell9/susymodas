'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { Heart, Minus, Plus, Store, Truck, ShieldCheck, MessageCircle, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { categoryLabel, discountPercent, stockForSize } from '@/lib/catalog'
import { cn, formatPrice, whatsappLink } from '@/lib/utils'

export default function ProductPageClient({ product, settings }) {
  const { addItem } = useCart()
  const { toggle, isWished } = useWishlist()
  const single = product.sizes.length === 1
  const [size, setSize] = useState(single ? product.sizes[0] : null)
  const [qty, setQty] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const [active, setActive] = useState(0)
  const railRef = useRef(null)

  const images = product.images.length ? product.images : [null]
  const discount = discountPercent(product)
  const soldOut = product.stock <= 0
  const left = size ? stockForSize(product, size) : null
  const wished = isWished(product.id)

  function add() {
    if (!size) { setSizeError(true); return }
    addItem({ ...product, maxStock: left }, size, qty)
    setQty(1)
  }

  function onScroll() {
    const el = railRef.current
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div className="shop-container grid gap-8 pb-16 pt-4 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:pt-8">
      {/* Galerie */}
      <div>
        {/* Mobile : carrousel */}
        <div className="relative -mx-4 sm:mx-0 lg:hidden">
          <div ref={railRef} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
            {images.map((src, i) => (
              <div key={i} className="relative aspect-[3/4] w-full shrink-0 snap-center bg-sand">
                {src ? <Image src={src} alt={`${product.name}, photo ${i + 1}`} fill priority={i === 0} sizes="100vw" className="object-cover" /> : <Placeholder />}
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
              {images.map((_, i) => <span key={i} className={cn('h-[3px] w-6 transition', i === active ? 'bg-ink' : 'bg-ink/25')} />)}
            </div>
          )}
        </div>
        {/* Ordinateur : grille éditoriale */}
        <div className={cn('hidden gap-2 lg:grid', images.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
          {images.map((src, i) => (
            <div key={i} className={cn('relative aspect-[3/4] overflow-hidden bg-sand', images.length > 2 && i === 0 && 'col-span-2 aspect-[4/5]')}>
              {src ? <Image src={src} alt={`${product.name}, photo ${i + 1}`} fill priority={i === 0} sizes="(max-width: 1024px) 100vw, 35vw" className="object-cover" /> : <Placeholder />}
            </div>
          ))}
        </div>
      </div>

      {/* Infos */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <nav className="text-[12px] text-ink-muted">
          <Link href="/collection" className="hover:text-ink">Collection</Link>
          <span className="mx-2">/</span>
          <Link href={`/collection?categorie=${product.category}`} className="hover:text-ink">{categoryLabel(product.category)}</Link>
        </nav>

        <h1 className="display mt-4 text-4xl leading-tight lg:text-[44px]">{product.name}</h1>
        <div className="mt-3 flex items-baseline gap-3">
          <span className={cn('text-xl', discount > 0 && 'text-sale')}>{formatPrice(product.price)}</span>
          {discount > 0 && (
            <>
              <span className="text-ink-muted line-through">{formatPrice(product.originalPrice)}</span>
              <span className="bg-sale px-2 py-0.5 text-[11px] text-ivory">-{discount}%</span>
            </>
          )}
        </div>

        {product.colors.length > 0 && (
          <p className="mt-6 text-[13px]"><span className="text-ink-muted">Coloris : </span>{product.colors.join(', ')}</p>
        )}

        {/* Tailles */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="label">{single ? 'Taille' : 'Choisir une taille'}</p>
            {size && left > 0 && left <= 3 && <p className="text-[12px] text-sale">Plus que {left} en stock</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const n = stockForSize(product, s)
              return (
                <button
                  key={s}
                  disabled={n <= 0}
                  onClick={() => { setSize(s); setSizeError(false); setQty(1) }}
                  className={cn(
                    'h-12 min-w-[56px] border px-4 text-[14px] transition',
                    size === s ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink',
                    n <= 0 && 'cursor-not-allowed bg-transparent text-ink-muted/40 line-through hover:border-line'
                  )}
                >
                  {s === 'TU' ? 'Taille unique' : s}
                </button>
              )
            })}
          </div>
          {sizeError && <p className="mt-2 text-[13px] text-sale">Merci de choisir une taille.</p>}
        </div>

        {/* Ajout */}
        <div className="mt-8 flex gap-2">
          <div className="flex h-12 items-center border border-line bg-white">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-full w-11 items-center justify-center" aria-label="Moins"><Minus size={14} /></button>
            <span className="w-8 text-center text-[14px]">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(left ?? 1, q + 1))} disabled={!size || qty >= (left ?? 1)} className="flex h-full w-11 items-center justify-center disabled:opacity-30" aria-label="Plus"><Plus size={14} /></button>
          </div>
          <button onClick={add} disabled={soldOut} className="btn-dark flex-1">
            {soldOut ? 'Épuisé' : 'Ajouter au panier'}
          </button>
          <button onClick={() => toggle(product)} className="flex h-12 w-12 shrink-0 items-center justify-center border border-line bg-white hover:border-ink" aria-label="Favoris">
            <Heart size={19} strokeWidth={1.3} className={cn(wished && 'fill-ink')} />
          </button>
        </div>

        {soldOut && (
          <a href={whatsappLink(settings.whatsapp, `Bonjour, la ${product.name} sera-t-elle bientôt de retour ?`)} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-3 w-full">
            <MessageCircle size={15} /> Être prévenue du retour
          </a>
        )}

        <ul className="mt-8 space-y-3 border-y border-line py-6 text-[13px] text-ink-soft">
          <li className="flex gap-3"><Store size={17} strokeWidth={1.3} className="shrink-0" /> Retrait gratuit en boutique à Kourou</li>
          <li className="flex gap-3"><Truck size={17} strokeWidth={1.3} className="shrink-0" /> Livraison à domicile {formatPrice(settings.shippingCost)}{settings.freeShippingThreshold ? `, offerte dès ${formatPrice(settings.freeShippingThreshold)}` : ''}</li>
          <li className="flex gap-3"><ShieldCheck size={17} strokeWidth={1.3} className="shrink-0" /> Paiement sécurisé par carte bancaire</li>
        </ul>

        <div className="divide-y divide-line border-b border-line">
          {product.description && (
            <Accordion title="Description" defaultOpen>
              <p className="whitespace-pre-line">{product.description}</p>
            </Accordion>
          )}
          <Accordion title="Livraison et retrait">
            <p>Retrait gratuit en boutique : {settings.storeAddress}. {settings.storeHours}. Nous vous prévenons dès que votre commande est prête.</p>
            <p className="mt-2">Livraison à domicile en Guyane : {formatPrice(settings.shippingCost)}{settings.freeShippingThreshold ? ` (offerte dès ${formatPrice(settings.freeShippingThreshold)} d'achat)` : ''}.</p>
          </Accordion>
          <Accordion title="Une question ?">
            <p>Besoin d&apos;un conseil de taille ou d&apos;une photo supplémentaire ? Écrivez-nous, nous répondons rapidement.</p>
            <a href={whatsappLink(settings.whatsapp, `Bonjour, j'ai une question sur : ${product.name}`)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 underline underline-offset-4">
              <MessageCircle size={14} /> Discuter sur WhatsApp
            </a>
          </Accordion>
        </div>
      </div>
    </div>
  )
}

function Accordion({ title, children, defaultOpen = false }) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4">
        <span className="label">{title}</span>
        <ChevronDown size={16} strokeWidth={1.3} className="transition group-open:rotate-180" />
      </summary>
      <div className="pb-5 text-[14px] leading-relaxed text-ink-soft">{children}</div>
    </details>
  )
}

function Placeholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand to-blush-light">
      <span className="font-serif text-2xl italic text-ink-muted/60">Susy Modas</span>
    </div>
  )
}
