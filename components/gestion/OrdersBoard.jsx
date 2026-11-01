'use client'
import { useMemo, useState } from 'react'
import { ChevronDown, Phone, Mail, MapPin, Store, Truck, MessageCircle } from 'lucide-react'
import ProductImage from '@/components/ui/ProductImage'
import { DELIVERY_LABEL, ORDER_STATUS, cn, formatDate, formatPrice, whatsappLink } from '@/lib/utils'

const FILTERS = [
  { id: '', label: 'Toutes' },
  { id: 'CONFIRMED', label: 'À préparer' },
  { id: 'READY', label: 'Prêtes au retrait' },
  { id: 'SHIPPED', label: 'Expédiées' },
  { id: 'DELIVERED', label: 'Terminées' },
  { id: 'CANCELLED', label: 'Annulées' },
]

function nextSteps(o) {
  if (o.status === 'CONFIRMED') return o.deliveryMethod === 'PICKUP' ? ['READY'] : ['SHIPPED']
  if (o.status === 'READY' || o.status === 'SHIPPED') return ['DELIVERED']
  return []
}
const STEP_LABEL = { READY: 'Marquer prête au retrait', SHIPPED: 'Marquer expédiée', DELIVERED: 'Marquer livrée / retirée' }

function phoneForWa(phone) {
  const d = String(phone).replace(/\D/g, '')
  if (d.startsWith('0') && d.length === 10) return `594${d.slice(1)}`
  return d
}

export default function OrdersBoard({ initial, initialStatus, initialRef }) {
  const [orders, setOrders] = useState(initial)
  const [status, setStatus] = useState(initialStatus)
  const [q, setQ] = useState(initialRef)
  const [open, setOpen] = useState(initialRef || null)
  const [busy, setBusy] = useState(null)

  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.id, f.id ? orders.filter((o) => o.status === f.id).length : orders.length])), [orders])
  const shown = orders.filter((o) => {
    if (status && o.status !== status) return false
    if (q) {
      const s = q.toLowerCase()
      return [o.reference, o.firstName, o.lastName, o.email, o.phone].some((v) => v?.toLowerCase().includes(s))
    }
    return true
  })

  async function update(o, next) {
    if (next === 'CANCELLED' && !confirm('Annuler cette commande ? Pensez à rembourser le client depuis Stripe.')) return
    setBusy(o.id)
    const res = await fetch(`/api/admin/orders/${o.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    setBusy(null)
    if (res.ok) setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: next } : x)))
    else alert('Mise à jour impossible.')
  }

  return (
    <div className="mt-8">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setStatus(f.id)} className={cn('shrink-0 border px-3.5 py-2 text-[12px] transition', status === f.id ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink')}>
            {f.label} <span className="ml-1 opacity-60">{counts[f.id]}</span>
          </button>
        ))}
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (nom, référence, téléphone...)" className="field mt-4 h-10 bg-white" />

      <div className="mt-4 border border-line bg-white">
        {shown.length === 0 ? (
          <p className="px-5 py-16 text-center text-[14px] text-ink-muted">Aucune commande ici.</p>
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((o) => {
              const isOpen = open === o.reference
              const units = o.items.reduce((s, i) => s + i.quantity, 0)
              return (
                <li key={o.id}>
                  <button onClick={() => setOpen(isOpen ? null : o.reference)} className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-sand/40 sm:px-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-sand">{o.deliveryMethod === 'PICKUP' ? <Store size={16} strokeWidth={1.4} /> : <Truck size={16} strokeWidth={1.4} />}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px]">{o.firstName} {o.lastName}</p>
                      <p className="truncate text-[12px] text-ink-muted">{o.reference} · {formatDate(o.createdAt, true)} · {units} art.</p>
                    </div>
                    <span className={cn('hidden shrink-0 px-2 py-0.5 text-[11px] sm:inline', ORDER_STATUS[o.status].tone)}>{ORDER_STATUS[o.status].label}</span>
                    <span className="w-20 shrink-0 text-right text-[14px]">{formatPrice(o.totalAmount)}</span>
                    <ChevronDown size={16} className={cn('shrink-0 text-ink-muted transition', isOpen && 'rotate-180')} />
                  </button>

                  {isOpen && (
                    <div className="grid gap-6 border-t border-line bg-[#FCFBF9] px-4 py-5 sm:px-5 lg:grid-cols-[1.3fr_1fr]">
                      <div>
                        <p className="text-[11px] uppercase tracking-label text-ink-muted">Articles</p>
                        <ul className="mt-3 space-y-3">
                          {o.items.map((i) => (
                            <li key={i.id} className="flex items-center gap-3 text-[14px]">
                              <div className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden bg-sand"><ProductImage src={i.productImage} alt={i.productName} sizes="48px" /></div>
                              <div className="flex-1">
                                <p>{i.productName}</p>
                                <p className="text-[12px] text-ink-muted">{i.size ? `Taille ${i.size === 'TU' ? 'unique' : i.size} · ` : ''}Qté {i.quantity}</p>
                              </div>
                              <p>{formatPrice(i.price * i.quantity)}</p>
                            </li>
                          ))}
                        </ul>
                        <dl className="mt-4 space-y-1 border-t border-line pt-3 text-[13px]">
                          <div className="flex justify-between"><dt className="text-ink-muted">Sous-total</dt><dd>{formatPrice(o.subtotal)}</dd></div>
                          <div className="flex justify-between"><dt className="text-ink-muted">{DELIVERY_LABEL[o.deliveryMethod]}</dt><dd>{o.shippingCost ? formatPrice(o.shippingCost) : 'Gratuit'}</dd></div>
                          <div className="flex justify-between font-medium"><dt>Total payé</dt><dd>{formatPrice(o.totalAmount)}</dd></div>
                        </dl>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-label text-ink-muted">Client</p>
                          <ul className="mt-3 space-y-2 text-[14px]">
                            <li className="flex gap-2"><Phone size={15} className="mt-0.5 shrink-0 text-ink-muted" /><a href={`tel:${o.phone}`} className="underline-offset-2 hover:underline">{o.phone}</a></li>
                            <li className="flex gap-2"><Mail size={15} className="mt-0.5 shrink-0 text-ink-muted" /><a href={`mailto:${o.email}`} className="break-all underline-offset-2 hover:underline">{o.email}</a></li>
                            {o.deliveryMethod === 'DELIVERY' && <li className="flex gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-ink-muted" />{o.address}, {o.postalCode} {o.city}</li>}
                          </ul>
                          {o.notes && <p className="mt-3 bg-sand px-3 py-2 text-[13px]">« {o.notes} »</p>}
                          <a href={whatsappLink(phoneForWa(o.phone), `Bonjour ${o.firstName}, c'est Susy Modas au sujet de votre commande ${o.reference}.`)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-[13px] underline underline-offset-4">
                            <MessageCircle size={14} /> Contacter sur WhatsApp
                          </a>
                        </div>
                        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                          {nextSteps(o).map((s) => (
                            <button key={s} disabled={busy === o.id} onClick={() => update(o, s)} className="btn-dark h-10 px-4">{STEP_LABEL[s]}</button>
                          ))}
                          {!['DELIVERED', 'CANCELLED'].includes(o.status) && (
                            <button disabled={busy === o.id} onClick={() => update(o, 'CANCELLED')} className="btn-ghost h-10 bg-white px-4 text-sale">Annuler</button>
                          )}
                          {o.status === 'DELIVERED' && <p className="text-[13px] text-emerald-700">Commande terminée.</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
