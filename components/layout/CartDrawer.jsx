'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import ProductImage from '@/components/ui/ProductImage'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal, itemCount, settings } = useCart()

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [isOpen, closeCart])

  if (!isOpen) return null
  const threshold = settings?.freeShippingThreshold
  const remaining = threshold ? Math.max(0, threshold - subtotal) : null
  const progress = threshold ? Math.min(1, subtotal / threshold) : 0

  return (
    <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true" aria-label="Panier">
      <div className="absolute inset-0 animate-fade bg-ink/40 motion-reduce:animate-none" onClick={closeCart} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[440px] animate-slide-in flex-col bg-paper motion-reduce:animate-none">
        <div className="flex h-[72px] items-center justify-between border-b-2 border-rule-ink px-6">
          <p className="font-medium">Panier, {itemCount} article{itemCount > 1 ? 's' : ''}</p>
          <button type="button" onClick={closeCart} className="-mr-3 inline-flex h-11 w-11 items-center justify-center hover:text-accent" aria-label="Fermer le panier"><X size={22} strokeWidth={1.5} /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center px-6">
            <p className="text-xl font-semibold">Votre panier est vide</p>
            <p className="mt-3 text-muted">Laissez-vous inspirer par nos dernières pièces.</p>
            <Link href="/?tri=nouveautes" onClick={closeCart} className="btn-primary mt-8">Voir les nouveautés</Link>
          </div>
        ) : (
          <>
            {threshold ? (
              <div className="border-b border-rule px-6 py-4">
                <p className="text-sm text-ink-2">
                  {remaining > 0
                    ? <>Plus que <strong className="font-medium text-ink">{formatPrice(remaining)}</strong> pour la livraison offerte</>
                    : <>Livraison à domicile <strong className="font-medium text-ink">offerte</strong></>}
                </p>
                <div className="mt-3 h-[3px] overflow-hidden bg-paper-3">
                  <div className="h-full origin-left bg-accent transition-transform duration-long ease-out" style={{ transform: `scaleX(${progress})` }} />
                </div>
              </div>
            ) : null}

            <ul className="flex-1 divide-y divide-rule overflow-y-auto px-6">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}`} className="flex gap-4 py-5">
                  <Link href={`/produit/${item.slug}`} onClick={closeCart} className="photo relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-paper-2">
                    <ProductImage src={item.image} alt={item.name} sizes="96px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link href={`/produit/${item.slug}`} onClick={closeCart} className="font-medium leading-snug hover:text-accent">{item.name}</Link>
                      <p className="shrink-0 tabular-nums">{formatPrice(item.price * item.qty)}</p>
                    </div>
                    {item.size && <p className="mt-1 text-sm text-muted">Taille {item.size === 'TU' ? 'unique' : item.size}</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex h-11 items-center border border-muted">
                        <button type="button" onClick={() => updateQty(item.id, item.size, item.qty - 1)} className="flex h-full w-11 items-center justify-center hover:bg-paper-2" aria-label="Retirer un exemplaire"><Minus size={14} /></button>
                        <span className="w-8 text-center tabular-nums" aria-live="polite">{item.qty}</span>
                        <button type="button" onClick={() => updateQty(item.id, item.size, item.qty + 1)} disabled={item.qty >= (item.maxStock ?? 99)} className="flex h-full w-11 items-center justify-center hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Ajouter un exemplaire"><Plus size={14} /></button>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id, item.size)} className="link text-sm text-muted">Retirer</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t-2 border-rule-ink bg-paper-2 px-6 py-6">
              <dl className="flex items-baseline justify-between">
                <dt className="font-medium">Sous-total</dt>
                <dd className="text-xl font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
              </dl>
              <p className="mt-1 text-sm text-muted">Retrait gratuit à Kourou, ou livraison {formatPrice(settings?.shippingCost ?? 0)}.</p>
              <Link href="/commande" onClick={closeCart} className="btn-primary mt-5 w-full">Commander</Link>
              <button type="button" onClick={closeCart} className="link mx-auto mt-4 block text-sm">Continuer mes achats</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
