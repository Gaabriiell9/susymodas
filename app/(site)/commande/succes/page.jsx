'use client'
import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Store, Truck } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import ProductImage from '@/components/ui/ProductImage'
import { formatPrice } from '@/lib/utils'

function Success() {
  const params = useSearchParams()
  const { clearCart, settings } = useCart()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = params.get('session_id')
    if (!id) { setError('Lien invalide.'); return }
    let tries = 0
    const load = async () => {
      const res = await fetch(`/api/orders/by-session?session_id=${encodeURIComponent(id)}`)
      const data = await res.json().catch(() => ({}))
      if (res.ok) { setOrder(data.order); clearCart() }
      else if (res.status === 402 && tries++ < 5) setTimeout(load, 2000)
      else setError(data.error || 'Impossible de charger la commande.')
    }
    load()
  }, [params, clearCart])

  if (error) {
    return (
      <div className="shop-container py-28 text-center">
        <h1 >Impossible d&apos;afficher la commande</h1>
        <p className="mt-3 text-ink-muted">{error}</p>
        <Link href="/" className="btn-dark mt-8">Retour à l&apos;accueil</Link>
      </div>
    )
  }
  if (!order) return <div className="shop-container py-32 text-center text-ink-muted">Confirmation du paiement…</div>

  const pickup = order.deliveryMethod === 'PICKUP'
  return (
    <div className="shop-container max-w-2xl py-16 lg:py-24">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-ivory"><Check size={24} /></span>
        <h1 className="mt-6">Merci {order.firstName} !</h1>
        <p className="mt-4 text-ink-soft">Votre paiement est confirmé pour la commande {order.reference}. Un récapitulatif a été envoyé à {order.email}.</p>
      </div>

      <div className="mt-12 border border-line bg-paper p-6">
        <p className="flex items-start gap-3 text-[14px]">
          {pickup ? <Store size={18} strokeWidth={1.3} className="mt-0.5 shrink-0" /> : <Truck size={18} strokeWidth={1.3} className="mt-0.5 shrink-0" />}
          <span>
            {pickup
              ? <>Retrait en boutique : {settings?.storeAddress}. Nous vous prévenons dès que votre commande est prête.</>
              : <>Livraison à : {order.address}, {order.postalCode} {order.city}. Nous vous prévenons à l&apos;expédition.</>}
          </span>
        </p>
        <ul className="mt-6 space-y-4 border-t border-line pt-6">
          {order.items.map((i, n) => (
            <li key={n} className="flex items-center gap-4 text-[14px]">
              <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-sand"><ProductImage src={i.image} alt={i.name} sizes="56px" /></div>
              <div className="flex-1"><p>{i.name}</p><p className="text-sm text-ink-muted">{i.size && i.size !== 'TU' ? `Taille ${i.size} · ` : ''}Qté {i.quantity}</p></div>
              <p>{formatPrice(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-1.5 border-t border-line pt-5 text-[14px]">
          <div className="flex justify-between"><dt className="text-ink-soft">Sous-total</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-soft">{pickup ? 'Retrait' : 'Livraison'}</dt><dd>{order.shippingCost ? formatPrice(order.shippingCost) : 'Gratuit'}</dd></div>
          <div className="flex justify-between pt-2 text-[16px] font-medium"><dt>Total payé</dt><dd>{formatPrice(order.totalAmount)}</dd></div>
        </dl>
      </div>
      <div className="mt-10 flex justify-center gap-3">
        <Link href="/" className="btn-dark">Continuer mes achats</Link>
        <Link href="/compte" className="btn-outline">Mes commandes</Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return <Suspense><Success /></Suspense>
}
