'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { Heart, Minus, Plus, ChevronDown } from 'lucide-react'
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
    <div className="shop-container grid gap-10 pb-section pt-8 lg:grid-cols-12 lg:gap-8 lg:pt-12">
      {/* Galerie */}
      <div className="lg:col-span-7">
        <div className="relative -mx-gutter lg:hidden">
          <div ref={railRef} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" aria-label="Photos de l'article">
            {images.map((src, i) => (
              <div key={i} className="relative aspect-[3/4] w-full shrink-0 snap-center bg-paper-2">
                {src ? <Image src={src} alt={`${product.name}, photo ${i + 1}`} fill priority={i === 0} sizes="100vw" className="object-cover" /> : <Placeholder name={product.name} />}
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <p className="absolute bottom-3 right-3 bg-paper px-2 py-1 text-sm tabular-nums" aria-live="polite">{active + 1} sur {images.length}</p>
          )}
        </div>
        <div className={cn('hidden gap-2 lg:grid', images.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
          {images.map((src, i) => (
            <div key={i} className={cn('photo relative aspect-[3/4] overflow-hidden bg-paper-2', images.length > 2 && i === 0 && 'col-span-2 aspect-[4/5]')}>
              {src ? <Image src={src} alt={`${product.name}, photo ${i + 1}`} fill priority={i === 0} sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /> : <Placeholder name={product.name} />}
            </div>
          ))}
        </div>
      </div>

      {/* Infos et achat */}
      <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start lg:pl-8">
        <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
          <Link href="/collection" className="link-underline">Collection</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <Link href={`/collection?categorie=${product.category}`} className="link-underline">{categoryLabel(product.category)}</Link>
        </nav>

        <h1 className="mt-6 text-display-s">{product.name}</h1>
        <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className={cn('display text-[2.5rem] tabular-nums', discount > 0 && 'text-accent')}>{formatPrice(product.price)}</span>
          {discount > 0 && (
            <>
              <s className="text-lg text-muted">{formatPrice(product.originalPrice)}</s>
              <span className="chip chip-accent">-{discount} %</span>
            </>
          )}
        </p>

        <fieldset className="mt-10">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <legend className="font-medium">{single ? 'Taille' : 'Choisir une taille'}</legend>
            {size && left > 0 && left <= 3 && <p className="text-sm text-accent">Plus que {left} en stock</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const n = stockForSize(product, s)
              return (
                <button
                  key={s}
                  type="button"
                  disabled={n <= 0}
                  aria-pressed={size === s}
                  onClick={() => { setSize(s); setSizeError(false); setQty(1) }}
                  className={cn(
                    'h-12 min-w-[56px] border px-4 transition-colors duration-micro',
                    size === s ? 'border-ink bg-ink text-paper' : 'border-muted hover:bg-paper-2',
                    'disabled:cursor-not-allowed disabled:border-rule disabled:bg-transparent disabled:text-muted disabled:line-through'
                  )}
                >
                  {s === 'TU' ? 'Taille unique' : s}
                </button>
              )
            })}
          </div>
          {sizeError && <p className="mt-3 text-sm text-error" role="alert">Merci de choisir une taille.</p>}
        </fieldset>

        <div className="mt-8 flex flex-wrap gap-2">
          <div className="flex h-12 items-center border border-muted" role="group" aria-label="Quantité">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-full w-11 items-center justify-center hover:bg-paper-2" aria-label="Moins"><Minus size={14} /></button>
            <span className="w-8 text-center tabular-nums" aria-live="polite">{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(left ?? 1, q + 1))} disabled={!size || qty >= (left ?? 1)} className="flex h-full w-11 items-center justify-center hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Plus"><Plus size={14} /></button>
          </div>
          <button type="button" onClick={add} disabled={soldOut} className="btn-primary min-w-0 flex-1 px-4 max-[400px]:order-last max-[400px]:basis-full">
            {soldOut ? 'Épuisé' : 'Ajouter au panier'}
          </button>
          <button type="button" onClick={() => toggle(product)} aria-pressed={wished} className="ml-auto inline-flex h-12 w-12 shrink-0 items-center justify-center border border-muted transition-colors duration-micro hover:bg-paper-2 min-[401px]:ml-0" aria-label={wished ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
            <Heart size={19} strokeWidth={1.5} className={cn(wished && 'fill-current text-accent')} />
          </button>
        </div>

        {soldOut && (
          <a href={whatsappLink(settings.whatsapp, `Bonjour, la ${product.name} sera-t-elle bientôt de retour ?`)} target="_blank" rel="noopener noreferrer" className="btn-outline mt-3 w-full">
            Être prévenue du retour
          </a>
        )}

        <dl className="rule-ink mt-10">
          {product.colors.length > 0 && <Spec term="Coloris" value={product.colors.join(', ')} />}
          <Spec term="Retrait" value="Gratuit en boutique à Kourou" />
          <Spec term="Livraison" value={`${formatPrice(settings.shippingCost)}${settings.freeShippingThreshold ? `, offerte dès ${formatPrice(settings.freeShippingThreshold)}` : ''}`} />
          <Spec term="Paiement" value="Carte bancaire, sécurisé" />
        </dl>

        <div className="divide-y divide-rule border-b border-rule">
          {product.description && (
            <Accordion title="Description" defaultOpen>
              <p className="whitespace-pre-line">{product.description}</p>
            </Accordion>
          )}
          <Accordion title="Livraison et retrait">
            <p>Retrait gratuit en boutique : {settings.storeAddress}. {settings.storeHours}. Nous vous prévenons dès que votre commande est prête.</p>
          </Accordion>
          <Accordion title="Une question ?">
            <p>Un conseil de taille ou une photo de plus ? Écrivez-nous, nous répondons vite.</p>
            <a href={whatsappLink(settings.whatsapp, `Bonjour, j'ai une question sur : ${product.name}`)} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-block">
              Discuter sur WhatsApp
            </a>
          </Accordion>
        </div>
      </div>
    </div>
  )
}

function Spec({ term, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6 border-b border-rule py-3">
      <dt className="font-medium text-ink-2">{term}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Accordion({ title, children, defaultOpen = false }) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between py-4 font-medium hover:text-accent">
        {title}
        <ChevronDown size={16} strokeWidth={1.5} className="transition-transform duration-short group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <div className="pb-6 text-ink-2">{children}</div>
    </details>
  )
}

function Placeholder({ name }) {
  return (
    <span className="display absolute inset-0 flex items-center justify-center bg-paper-2 p-8 text-center text-[2.5rem] text-ink-2">{name}</span>
  )
}
