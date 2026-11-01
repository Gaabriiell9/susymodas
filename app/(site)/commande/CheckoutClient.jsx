'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Store, Truck, Lock, ArrowLeft, MapPin } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import ProductImage from '@/components/ui/ProductImage'
import { cn, formatPrice } from '@/lib/utils'

export default function CheckoutClient({ user }) {
  const { items, subtotal, settings, ready, removeItem, updateQty } = useCart()
  const params = useSearchParams()
  const cancelled = params.get('annulee') === '1'
  const [method, setMethod] = useState('PICKUP')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [badFields, setBadFields] = useState([])
  const [form, setForm] = useState(() => {
    const [firstName = '', ...rest] = (user?.name ?? '').split(' ')
    return { firstName, lastName: rest.join(' '), email: user?.email ?? '', phone: '', address: '', postalCode: '97310', city: 'Kourou', notes: '' }
  })

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('susy_checkout') || 'null')
      if (saved) setForm((f) => ({ ...f, ...saved, email: f.email || saved.email }))
    } catch {}
  }, [])

  const threshold = settings?.freeShippingThreshold
  const shipping = method === 'DELIVERY' ? (threshold && subtotal >= threshold ? 0 : settings?.shippingCost ?? 0) : 0
  const total = subtotal + shipping
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setBadFields((b) => b.filter((x) => x !== k)) }

  async function pay(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { notes, ...remember } = form
      localStorage.setItem('susy_checkout', JSON.stringify(remember))
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, deliveryMethod: method, items: items.map((i) => ({ id: i.id, size: i.size, qty: i.qty })) }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error || 'Une erreur est survenue.')
        setBadFields(data.fields ?? [])
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Connexion impossible. Vérifiez votre réseau et réessayez.')
      setLoading(false)
    }
  }

  if (!ready) return <div className="min-h-[60vh]" />

  if (!items.length) {
    return (
      <div className="shop-container py-28 text-center">
        <h1 className="display text-4xl">Votre panier est vide</h1>
        <Link href="/collection" className="btn-dark mt-8">Découvrir la collection</Link>
      </div>
    )
  }

  const field = (k) => cn('field', badFields.includes(k) && 'border-sale')

  return (
    <div className="shop-container py-10 lg:py-14">
      <Link href="/collection" className="label inline-flex items-center gap-2 text-ink-muted hover:text-ink"><ArrowLeft size={14} /> Continuer mes achats</Link>
      <h1 className="display mt-4 text-4xl lg:text-5xl">Finaliser ma commande</h1>

      {cancelled && <p className="mt-6 border border-line bg-white px-4 py-3 text-[14px]">Le paiement a été annulé. Votre panier est toujours là, vous pouvez réessayer.</p>}

      <form onSubmit={pay} className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
        <div className="space-y-12">
          {/* Mode de réception */}
          <section>
            <h2 className="label mb-5">1. Mode de réception</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Option active={method === 'PICKUP'} onClick={() => setMethod('PICKUP')} icon={Store} title="Retrait en boutique" price="Gratuit" text={settings?.storeAddress} />
              <Option
                active={method === 'DELIVERY'} onClick={() => setMethod('DELIVERY')} icon={Truck} title="Livraison à domicile"
                price={threshold && subtotal >= threshold ? 'Offerte' : formatPrice(settings?.shippingCost ?? 0)}
                text={threshold ? `Offerte dès ${formatPrice(threshold)} d'achat` : 'En Guyane'}
              />
            </div>
            {method === 'PICKUP' && (
              <p className="mt-4 flex gap-2 text-[13px] text-ink-soft"><MapPin size={15} strokeWidth={1.3} className="mt-0.5 shrink-0" /> {settings?.storeHours}. Nous vous prévenons par e-mail ou téléphone dès que votre commande est prête.</p>
            )}
          </section>

          {/* Coordonnées */}
          <section>
            <h2 className="label mb-5">2. Vos coordonnées</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom"><input className={field('firstName')} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" required /></Field>
              <Field label="Nom"><input className={field('lastName')} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" required /></Field>
              <Field label="E-mail"><input type="email" className={field('email')} value={form.email} onChange={set('email')} autoComplete="email" required /></Field>
              <Field label="Téléphone"><input type="tel" className={field('phone')} value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="0694 00 00 00" required /></Field>
            </div>
          </section>

          {method === 'DELIVERY' && (
            <section className="animate-fade">
              <h2 className="label mb-5">3. Adresse de livraison</h2>
              <div className="grid gap-4 sm:grid-cols-[1fr_140px_1fr]">
                <div className="sm:col-span-3"><Field label="Adresse"><input className={field('address')} value={form.address} onChange={set('address')} autoComplete="street-address" required /></Field></div>
                <Field label="Code postal"><input className={field('postalCode')} value={form.postalCode} onChange={set('postalCode')} autoComplete="postal-code" inputMode="numeric" required /></Field>
                <div className="sm:col-span-2"><Field label="Ville"><input className={field('city')} value={form.city} onChange={set('city')} autoComplete="address-level2" required /></Field></div>
              </div>
            </section>
          )}

          <section>
            <Field label="Message (facultatif)">
              <textarea className="field h-24 py-3" value={form.notes} onChange={set('notes')} placeholder="Une précision pour votre commande ?" />
            </Field>
          </section>
        </div>

        {/* Récapitulatif */}
        <aside className="h-fit border border-line bg-white p-6 lg:sticky lg:top-28">
          <h2 className="label mb-5">Récapitulatif</h2>
          <ul className="max-h-[40vh] space-y-4 overflow-y-auto">
            {items.map((i) => (
              <li key={`${i.id}-${i.size}`} className="flex gap-3">
                <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-sand"><ProductImage src={i.image} alt={i.name} sizes="64px" /></div>
                <div className="min-w-0 flex-1 text-[13px]">
                  <p className="leading-snug">{i.name}</p>
                  <p className="mt-0.5 text-ink-muted">{i.size === 'TU' ? 'Taille unique' : `Taille ${i.size}`}</p>
                  <div className="mt-1 flex items-center gap-3 text-ink-muted">
                    <select value={i.qty} onChange={(e) => updateQty(i.id, i.size, Number(e.target.value))} className="bg-transparent outline-none" aria-label="Quantité">
                      {Array.from({ length: Math.min(10, i.maxStock ?? 10) }, (_, n) => n + 1).map((n) => <option key={n} value={n}>Qté {n}</option>)}
                    </select>
                    <button type="button" onClick={() => removeItem(i.id, i.size)} className="underline underline-offset-2">Retirer</button>
                  </div>
                </div>
                <p className="text-[13px]">{formatPrice(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-line pt-5 text-[14px]">
            <div className="flex justify-between"><dt className="text-ink-soft">Sous-total</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">{method === 'PICKUP' ? 'Retrait en boutique' : 'Livraison'}</dt><dd>{shipping ? formatPrice(shipping) : 'Gratuit'}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-[16px]"><dt>Total</dt><dd className="font-medium">{formatPrice(total)}</dd></div>
          </dl>
          {error && <p className="mt-4 bg-red-50 px-3 py-2.5 text-[13px] text-sale">{error}</p>}
          <button type="submit" disabled={loading} className="btn-dark mt-6 w-full">
            <Lock size={14} /> {loading ? 'Redirection...' : `Payer ${formatPrice(total)}`}
          </button>
          <p className="mt-3 text-center text-[12px] text-ink-muted">Paiement sécurisé par Stripe. Vos données bancaires ne transitent jamais par notre site.</p>
        </aside>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block"><span className="field-label">{label}</span>{children}</label>
}

function Option({ active, onClick, icon: Icon, title, price, text }) {
  return (
    <button type="button" onClick={onClick} className={cn('flex items-start gap-4 border bg-white p-5 text-left transition', active ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-ink-muted')}>
      <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', active ? 'border-ink' : 'border-ink-muted')}>
        {active && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
      </span>
      <span className="flex-1">
        <span className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-[14px] font-medium"><Icon size={16} strokeWidth={1.4} /> {title}</span><span className="text-[13px]">{price}</span></span>
        {text && <span className="mt-1 block text-[12px] text-ink-muted">{text}</span>}
      </span>
    </button>
  )
}
