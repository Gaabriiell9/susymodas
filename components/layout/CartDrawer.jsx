'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { Minus, Plus, X, Truck, Store } from 'lucide-react'
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
  const progress = threshold ? Math.min(100, (subtotal / threshold) * 100) : 0

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Panier">
      <div className="absolute inset-0 animate-fade bg-ink/40" onClick={closeCart} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[440px] animate-slide-in flex-col bg-ivory">
        <div className="flex h-16 items-center justify-between border-b border-line px-6">
          <p className="label">Panier ({itemCount})</p>
          <button onClick={closeCart} className="-mr-2 p-2" aria-label="Fermer le panier"><X size={22} strokeWidth={1.3} /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="display text-3xl">Votre panier est vide</p>
            <p className="mt-3 text-sm text-ink-muted">Laissez-vous inspirer par nos dernières pièces.</p>
            <Link href="/collection?tri=nouveautes" onClick={closeCart} className="btn-dark mt-8">Voir les nouveautés</Link>
          </div>
        ) : (
          <>
            {threshold ? (
              <div className="border-b border-line px-6 py-4">
                <p className="text-[13px] text-ink-soft">
                  {remaining > 0
                    ? <>Plus que <strong className="font-medium text-ink">{formatPrice(remaining)}</strong> pour la livraison offerte</>
                    : <>Livraison à domicile <strong className="font-medium text-ink">offerte</strong></>}
                </p>
                <div className="mt-2.5 h-[3px] bg-line"><div className="h-full bg-ink transition-all duration-500" style={{ width: `${progress}%` }} /></div>
              </div>
            ) : null}

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}`} className="flex gap-4 py-5">
                  <Link href={`/produit/${item.slug}`} onClick={closeCart} className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-sand">
                    <ProductImage src={item.image} alt={item.name} sizes="96px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link href={`/produit/${item.slug}`} onClick={closeCart} className="text-[14px] leading-snug">{item.name}</Link>
                      <p className="shrink-0 text-[14px]">{formatPrice(item.price * item.qty)}</p>
                    </div>
                    {item.size && <p className="mt-1 text-[12px] text-ink-muted">Taille : {item.size === 'TU' ? 'Unique' : item.size}</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex h-9 items-center border border-line">
                        <button onClick={() => updateQty(item.id, item.size, item.qty - 1)} className="flex h-full w-9 items-center justify-center" aria-label="Retirer un"><Minus size={13} /></button>
                        <span className="w-7 text-center text-[13px]">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.size, item.qty + 1)} disabled={item.qty >= (item.maxStock ?? 99)} className="flex h-full w-9 items-center justify-center disabled:opacity-30" aria-label="Ajouter un"><Plus size={13} /></button>
                      </div>
                      <button onClick={() => removeItem(item.id, item.size)} className="text-[12px] text-ink-muted underline underline-offset-4 hover:text-ink">Retirer</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line bg-white px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="label">Sous-total</span>
                <span className="text-lg">{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-muted">
                <span className="flex items-center gap-1.5"><Store size={13} /> Retrait gratuit à Kourou</span>
                <span className="flex items-center gap-1.5"><Truck size={13} /> Livraison {formatPrice(settings?.shippingCost ?? 0)}</span>
              </div>
              <Link href="/commande" onClick={closeCart} className="btn-dark mt-5 w-full">Commander</Link>
              <button onClick={closeCart} className="mt-3 w-full text-center text-[12px] uppercase tracking-label text-ink-soft underline underline-offset-4">Continuer mes achats</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
