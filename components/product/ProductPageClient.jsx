'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { Heart, Minus, Plus, ChevronDown, Store, Truck, ShieldCheck, RotateCcw, MessageCircle } from 'lucide-react'
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
  const sizesRef = useRef(null)

  const images = product.images.length ? product.images : [null]
  const discount = discountPercent(product)
  const soldOut = product.stock <= 0
  const left = size ? stockForSize(product, size) : null
  const wished = isWished(product.id)

  function add() {
    if (!size) {
      setSizeError(true)
      sizesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    addItem({ ...product, maxStock: left }, size, qty)
    setQty(1)
  }

  function show(i) {
    setActive(i)
    const el = railRef.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <>
      <div className="shop-container pb-28 pt-4 lg:pb-section-s lg:pt-6">
        <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
          <Link href="/" className="link-underline">Boutique</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <Link href={`/?categorie=${product.category}`} className="link-underline">{categoryLabel(product.category)}</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span className="text-ink-2">{product.name}</span>
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
          {/* Galerie */}
          <div className="flex gap-3">
            {images.length > 1 && (
              <ul className="hidden w-20 shrink-0 flex-col gap-2 lg:flex" aria-label="Miniatures">
                {images.map((src, i) => (
                  <li key={i}>
                    <button type="button" onClick={() => show(i)} aria-label={`Voir la photo ${i + 1}`} aria-current={i === active} className={cn('relative block aspect-[3/4] w-full overflow-hidden bg-paper-2 outline outline-1 outline-offset-0', i === active ? 'outline-ink' : 'outline-transparent hover:outline-muted')}>
                      {src && <Image src={src} alt="" fill sizes="80px" className="object-cover" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="relative min-w-0 flex-1 max-lg:-mx-gutter">
              <div
                ref={railRef}
                onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
                className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
                aria-label="Photos de l'article"
              >
                {images.map((src, i) => (
                  <div key={i} className="relative aspect-[3/4] w-full shrink-0 snap-center bg-paper-2">
                    {src ? (
                      <Image src={src} alt={`${product.name}, photo ${i + 1}`} fill priority={i === 0} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center"><span className="wordmark text-[2.5rem] text-ink-2/60">Susy Modas</span></span>
                    )}
                  </div>
                ))}
              </div>
              {images.length > 1 && (
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden">
                  {images.map((_, i) => <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i === active ? 'bg-ink' : 'bg-ink/30')} />)}
                </div>
              )}
              {discount > 0 && <span className="absolute left-3 top-3 bg-accent px-2.5 py-1 text-sm font-semibold text-accent-ink max-lg:left-[calc(var(--gutter)+0.25rem)]">-{discount} %</span>}
            </div>
          </div>

          {/* Bloc d'achat */}
          <div className="lg:sticky lg:top-[124px] lg:self-start">
            <p className="text-sm text-muted">{categoryLabel(product.category)}</p>
            <h1 className="mt-1">{product.name}</h1>

            <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
              <span className={cn('text-2xl font-semibold tabular-nums', discount > 0 && 'text-accent')}>{formatPrice(product.price)}</span>
              {discount > 0 && <s className="text-lg text-muted">{formatPrice(product.originalPrice)}</s>}
            </p>
            <p className={cn('mt-1 text-sm font-medium', soldOut ? 'text-error' : product.stock <= 3 ? 'text-accent' : 'text-success')}>
              {soldOut ? 'Épuisé' : product.stock <= 3 ? `Plus que ${product.stock} en stock` : 'En stock, retrait possible en boutique'}
            </p>

            {product.colors.length > 0 && <p className="mt-5 text-sm"><span className="text-muted">Coloris : </span>{product.colors.join(', ')}</p>}

            <fieldset ref={sizesRef} className="mt-6">
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <legend className="text-sm font-semibold">{single ? 'Taille' : 'Taille'}{size ? ` : ${size === 'TU' ? 'unique' : size}` : ''}</legend>
                {size && left > 0 && left <= 3 && <p className="text-sm text-accent">Plus que {left}</p>}
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
                        'h-11 min-w-[52px] border px-3 text-sm font-medium transition-colors duration-micro',
                        size === s ? 'border-ink bg-ink text-paper' : 'border-muted bg-paper hover:border-ink',
                        'disabled:cursor-not-allowed disabled:border-rule disabled:bg-paper-2 disabled:text-muted disabled:line-through'
                      )}
                    >
                      {s === 'TU' ? 'Taille unique' : s}
                    </button>
                  )
                })}
              </div>
              {sizeError && <p className="mt-2 text-sm font-medium text-error" role="alert">Choisissez une taille pour continuer.</p>}
            </fieldset>

            <div className="mt-6 flex gap-2">
              <div className="flex h-12 items-center border border-muted" role="group" aria-label="Quantité">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-full w-10 items-center justify-center hover:bg-paper-2" aria-label="Moins"><Minus size={14} /></button>
                <span className="w-7 text-center tabular-nums" aria-live="polite">{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(left ?? 1, q + 1))} disabled={!size || qty >= (left ?? 1)} className="flex h-full w-10 items-center justify-center hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Plus"><Plus size={14} /></button>
              </div>
              <button type="button" onClick={add} disabled={soldOut} className="btn-primary min-w-0 flex-1 px-4">
                {soldOut ? 'Épuisé' : 'Ajouter au panier'}
              </button>
              <button type="button" onClick={() => toggle(product)} aria-pressed={wished} className="inline-flex h-12 w-12 shrink-0 items-center justify-center border border-muted hover:border-ink" aria-label={wished ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                <Heart size={19} strokeWidth={1.6} className={cn(wished && 'fill-current text-accent')} />
              </button>
            </div>

            {soldOut && (
              <a href={whatsappLink(settings.whatsapp, `Bonjour, la ${product.name} sera-t-elle bientôt de retour ?`)} target="_blank" rel="noopener noreferrer" className="btn-outline mt-3 w-full">
                <MessageCircle size={16} aria-hidden="true" /> Me prévenir du retour
              </a>
            )}

            <ul className="mt-6 grid grid-cols-2 gap-px border border-rule bg-rule text-sm">
              <Perk icon={Store} title="Retrait gratuit" text="En boutique à Kourou" />
              <Perk icon={Truck} title={`Livraison ${formatPrice(settings.shippingCost)}`} text={settings.freeShippingThreshold ? `Offerte dès ${formatPrice(settings.freeShippingThreshold)}` : 'En Guyane'} />
              <Perk icon={ShieldCheck} title="Paiement sécurisé" text="Carte bancaire" />
              <Perk icon={RotateCcw} title="Échange 14 jours" text="En boutique" />
            </ul>

            <div className="mt-6 divide-y divide-rule border-y border-rule">
              {product.description && (
                <Accordion title="Description" defaultOpen>
                  <p className="whitespace-pre-line">{product.description}</p>
                </Accordion>
              )}
              <Accordion title="Livraison et retrait">
                <p>Retrait gratuit : {settings.storeAddress}, {settings.storeHours}. Nous vous prévenons dès que la commande est prête.</p>
              </Accordion>
              <Accordion title="Une question sur cet article ?">
                <a href={whatsappLink(settings.whatsapp, `Bonjour, j'ai une question sur : ${product.name}`)} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-2">
                  <MessageCircle size={15} aria-hidden="true" /> Nous écrire sur WhatsApp
                </a>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'achat fixe (mobile) */}
      {!soldOut && (
        <div className="fixed inset-x-0 bottom-0 z-sticky flex items-center gap-3 border-t border-rule bg-paper px-gutter py-3 lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{product.name}</p>
            <p className="font-semibold tabular-nums">{formatPrice(product.price)}{size ? <span className="font-normal text-muted"> · {size === 'TU' ? 'Unique' : size}</span> : null}</p>
          </div>
          <button type="button" onClick={add} className="btn-primary min-h-11 shrink-0 px-5">{size ? 'Ajouter au panier' : 'Choisir la taille'}</button>
        </div>
      )}
    </>
  )
}

function Perk({ icon: Icon, title, text }) {
  return (
    <li className="flex items-start gap-2.5 bg-paper p-3">
      <Icon size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
      <span><span className="block font-medium">{title}</span><span className="block text-muted">{text}</span></span>
    </li>
  )
}

function Accordion({ title, children, defaultOpen = false }) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold hover:text-accent">
        {title}
        <ChevronDown size={16} strokeWidth={1.5} className="transition-transform duration-short group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <div className="pb-4 text-sm leading-relaxed text-ink-2">{children}</div>
    </details>
  )
}
