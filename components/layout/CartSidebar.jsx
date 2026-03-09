'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Trash2, CreditCard, Store } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { useSession, signIn } from 'next-auth/react'

export default function CartSidebar() {
  const { isOpen, items, total, closeCart, updateQty, removeItem, clearCart } = useCart()
  const { data: session } = useSession()
  const [step, setStep] = useState('cart')
  const [saving, setSaving] = useState(false)
  const [delivery, setDelivery] = useState('retrait')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', postalCode: '',
  })
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => { if (!isOpen) setTimeout(() => setStep('cart'), 300) }, [isOpen])

  useEffect(() => {
    if (session?.user) {
      const [firstName, ...rest] = (session.user.name || '').split(' ')
      setForm(f => ({ ...f, firstName: firstName || '', lastName: rest.join(' ') || '', email: session.user.email || '' }))
    }
  }, [session])

  function handleCommander() {
    if (!session) {
      closeCart()
      signIn(undefined, { callbackUrl: window.location.href })
      return
    }
    setStep('checkout')
  }

  async function handleOrder() {
    if (!form.firstName || !form.lastName || !form.phone) {
      alert('Veuillez remplir les champs obligatoires.')
      return
    }
    if (delivery === 'livraison' && (!form.street || !form.city)) {
      alert("Veuillez remplir l'adresse complète.")
      return
    }
    setSaving(true)
    try {
      const fullAddress = delivery === 'livraison'
        ? `${form.street}, ${form.city}${form.postalCode ? ' ' + form.postalCode : ''}`
        : 'Retrait en boutique — Kourou'

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, phone: form.phone,
          address: fullAddress,
          paymentMethod: 'STRIPE',
          items: items.map(i => ({ productId: i.id, quantity: i.qty, size: i.size })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const stripeRes = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ name: i.name, price: i.price, quantity: i.qty, images: i.images })),
          customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
          orderId: data.order.id,
        }),
      })
      const stripeData = await stripeRes.json()

      if (stripeData.url) {
        // Vider le panier avant de rediriger vers Stripe
        clearCart()
        window.location.href = stripeData.url
      }
    } catch (err) {
      alert('Erreur : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-brown outline-none focus:border-gold transition-colors"

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-brown-dark/40 backdrop-blur-sm" onClick={closeCart} aria-hidden />}

      <aside role="dialog" aria-label="Panier"
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="flex items-center justify-between px-6 py-5 border-b border-beige">
          <h2 className="font-serif text-xl text-brown">{step === 'cart' ? 'Mon Panier' : 'Finaliser'}</h2>
          <button onClick={closeCart} className="text-taupe hover:text-brown transition-colors"><X size={20} /></button>
        </div>

        {success && (
          <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="text-green-700 font-sans text-sm font-medium">✅ Commande créée !</p>
            <p className="text-green-600 font-sans text-xs mt-1">Référence : {success}</p>
            <button onClick={() => setSuccess(null)} className="text-xs text-green-500 mt-2 underline">Fermer</button>
          </div>
        )}

        {/* ── PANIER ── */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-taupe">
                  <span className="text-5xl">🛍️</span>
                  <p className="font-serif text-lg italic">Votre panier est vide</p>
                  <Button onClick={closeCart} variant="outline" size="sm">Continuer mes achats</Button>
                </div>
              ) : items.map(item => (
                <CartItem key={`${item.id}-${item.size}`} item={item} onQtyChange={updateQty} onRemove={removeItem} />
              ))}
            </div>

            {items.length > 0 && (
              <div className="border-t border-beige px-6 py-5 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-sans text-sm text-brown-light uppercase tracking-wider">Total</span>
                  <span className="font-serif text-2xl text-brown font-semibold">{formatPrice(total)}</span>
                </div>
                {!session && (
                  <p className="text-center font-sans text-xs text-taupe bg-beige/50 rounded-lg py-2">
                    🔐 Connexion requise pour commander
                  </p>
                )}
                <Button fullWidth size="lg" onClick={handleCommander}>
                  {session ? 'Commander →' : 'Se connecter pour commander →'}
                </Button>
                <p className="text-center text-[0.65rem] text-taupe">Livraison & retrait en boutique — Kourou</p>
              </div>
            )}
          </>
        )}

        {/* ── CHECKOUT ── */}
        {step === 'checkout' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <button onClick={() => setStep('cart')} className="text-xs text-taupe hover:text-gold font-sans flex items-center gap-1 mb-2">
                ← Retour au panier
              </button>

              {/* Récap */}
              <div className="bg-beige/50 rounded-xl p-3 mb-2">
                {items.map(i => (
                  <div key={`${i.id}-${i.size}`} className="flex justify-between font-sans text-xs text-brown-light">
                    <span>{i.name}{i.size ? ` — ${i.size}` : ''} ×{i.qty}</span>
                    <span>{formatPrice(i.price * i.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-serif text-sm text-brown font-semibold mt-2 pt-2 border-t border-beige">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Mode récupération */}
              <div>
                <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-2">Mode de récupération</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'retrait', icon: <Store size={18} />, label: 'Retrait boutique', sub: 'Kourou, Guyane' },
                    { key: 'livraison', icon: <span className="text-lg">🚚</span>, label: 'Livraison', sub: 'Guyane Française' },
                  ].map(({ key, icon, label, sub }) => (
                    <button key={key} type="button" onClick={() => setDelivery(key)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 font-sans text-xs font-medium transition-all ${delivery === key ? 'border-gold bg-gold/5 text-gold' : 'border-gray-200 text-taupe hover:border-gold'}`}>
                      {icon}{label}<span className="text-[0.6rem] font-normal opacity-70">{sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prénom / Nom */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Prénom *</label>
                  <input className={inputClass} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Nom *</label>
                  <input className={inputClass} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Téléphone *</label>
                <input type="tel" inputMode="numeric" className={inputClass} value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone" />
              </div>

              {/* Email */}
              <div>
                <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Email</label>
                <input type="email" className={inputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              {/* Adresse livraison */}
              {delivery === 'livraison' && (
                <>
                  <div>
                    <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Rue / Adresse *</label>
                    <input className={inputClass} value={form.street}
                      onChange={e => setForm({ ...form, street: e.target.value })} placeholder="Numéro et nom de rue" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Ville *</label>
                      <input className={inputClass} value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Kourou" />
                    </div>
                    <div>
                      <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Code postal</label>
                      <input type="text" inputMode="numeric" className={inputClass} value={form.postalCode}
                        onChange={e => setForm({ ...form, postalCode: e.target.value })} placeholder="97310" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-beige px-6 py-4 space-y-2">
              <button onClick={handleOrder} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brown text-white font-sans text-xs tracking-widest uppercase hover:bg-brown-dark transition-colors disabled:opacity-60">
                <CreditCard size={15} />
                {saving ? 'En cours…' : 'Payer par carte'}
              </button>
              <p className="text-center text-[0.6rem] text-taupe">🔒 Paiement sécurisé · Stripe</p>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

function CartItem({ item, onQtyChange, onRemove }) {
  const atMax = item.maxStock !== undefined && item.qty >= item.maxStock

  return (
    <div className="flex gap-4 py-3 border-b border-beige/60 last:border-0">
      <div className="relative w-16 h-20 rounded-lg bg-cream flex-shrink-0 overflow-hidden">
        {item.images?.[0]
          ? <Image src={item.images[0]} alt={item.name} fill className="object-cover object-top" />
          : <span className="text-2xl flex items-center justify-center h-full">👗</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif text-sm text-brown truncate">{item.name}</p>
        {item.size && <p className="font-sans text-[0.65rem] text-taupe mt-0.5">Taille {item.size}</p>}
        <p className="font-sans text-sm font-medium text-gold mt-1">{formatPrice(item.price)}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button onClick={() => onQtyChange(item.id, item.qty - 1, item.size)}
              className="w-6 h-6 rounded bg-beige flex items-center justify-center hover:bg-gold-light transition-colors text-xs">−</button>
            <span className="font-sans text-sm w-4 text-center">{item.qty}</span>
            <button onClick={() => !atMax && onQtyChange(item.id, item.qty + 1, item.size)} disabled={atMax}
              title={atMax ? `Stock max atteint (${item.maxStock})` : undefined}
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors text-xs ${atMax ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-beige hover:bg-gold-light'}`}>+</button>
          </div>
          <div className="flex items-center gap-2">
            {atMax && <span className="font-sans text-[0.6rem] text-amber-500">Stock max</span>}
            <button onClick={() => onRemove(item.id, item.size)} className="text-taupe hover:text-rose-deep transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}