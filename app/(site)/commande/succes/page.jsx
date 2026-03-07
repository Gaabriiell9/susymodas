'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Download, Store, Truck, Loader2 } from 'lucide-react'

function formatPrice(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

function SuccesContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const receiptRef = useRef(null)

    useEffect(() => {
        if (!sessionId) { setLoading(false); return }
        fetch(`/api/orders/by-session?session_id=${sessionId}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) setError(data.error)
                else setOrder(data.order)
            })
            .catch(() => setError('Erreur de chargement'))
            .finally(() => setLoading(false))
    }, [sessionId])

    const isRetrait = !order?.address || order.address.includes('Retrait')

    function handlePrint() {
        window.print()
    }

    if (loading) return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-gold" />
        </div>
    )

    if (error || !order) return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-5xl mb-4">✅</div>
                <h1 className="font-serif text-3xl text-brown mb-4">Commande confirmée !</h1>
                <p className="font-sans text-brown-light text-sm leading-relaxed mb-8">
                    Merci pour votre commande. Vous recevrez une confirmation par email très prochainement.
                </p>
                <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-gold text-white font-sans text-xs uppercase tracking-widest rounded-lg hover:bg-rose-deep transition-colors">
                    Retour à la boutique
                </Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-cream py-8 px-4">
            <div className="max-w-lg mx-auto">

                {/* Header succès */}
                <div className="text-center mb-8 no-print">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h1 className="font-serif text-3xl text-brown mb-2">Commande confirmée !</h1>
                    <p className="font-sans text-brown-light text-sm">
                        {isRetrait
                            ? 'Présentez ce reçu en boutique pour retirer votre commande.'
                            : 'Nous vous contacterons pour organiser la livraison.'}
                    </p>
                </div>

                {/* ── REÇU ── */}
                <div ref={receiptRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden receipt-card">

                    {/* En-tête reçu */}
                    <div className="bg-brown px-6 py-5 text-center">
                        <p className="font-serif text-xl text-white">Susy Modas</p>
                        <p className="font-sans text-[0.6rem] tracking-widest uppercase text-gold mt-0.5">Évangélicas · Kourou</p>
                    </div>

                    <div className="px-6 py-5 space-y-5">

                        {/* Référence + date */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-sans text-[0.6rem] uppercase tracking-wider text-taupe">Référence</p>
                                <p className="font-serif text-lg text-brown font-semibold">{order.reference}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-sans text-[0.6rem] uppercase tracking-wider text-taupe">Date</p>
                                <p className="font-sans text-xs text-brown">{formatDate(order.createdAt)}</p>
                            </div>
                        </div>

                        {/* Client */}
                        <div className="bg-beige/40 rounded-xl p-3">
                            <p className="font-sans text-[0.6rem] uppercase tracking-wider text-taupe mb-2">Client</p>
                            <p className="font-sans text-sm text-brown font-medium">{order.firstName} {order.lastName}</p>
                            <p className="font-sans text-xs text-taupe">{order.email}</p>
                            <p className="font-sans text-xs text-taupe">{order.phone}</p>
                        </div>

                        {/* Mode retrait/livraison */}
                        <div className={`flex items-center gap-3 rounded-xl p-3 border-2 ${isRetrait ? 'border-gold/30 bg-gold/5' : 'border-blue-100 bg-blue-50/50'}`}>
                            {isRetrait
                                ? <Store size={20} className="text-gold flex-shrink-0" />
                                : <Truck size={20} className="text-blue-500 flex-shrink-0" />}
                            <div>
                                <p className="font-sans text-xs font-semibold text-brown">
                                    {isRetrait ? 'Retrait en boutique' : 'Livraison à domicile'}
                                </p>
                                <p className="font-sans text-[0.65rem] text-taupe">
                                    {isRetrait ? 'Kourou, Guyane — Sur présentation de ce reçu' : order.address}
                                </p>
                            </div>
                        </div>

                        {/* Articles */}
                        <div>
                            <p className="font-sans text-[0.6rem] uppercase tracking-wider text-taupe mb-3">Articles</p>
                            <div className="space-y-3">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {item.image && (
                                            <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-beige flex-shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover object-top" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-serif text-sm text-brown truncate">{item.name}</p>
                                            {item.size && <p className="font-sans text-[0.65rem] text-taupe">Taille {item.size}</p>}
                                            <p className="font-sans text-xs text-taupe">Qté : {item.quantity}</p>
                                        </div>
                                        <p className="font-sans text-sm font-medium text-brown flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="border-t border-beige pt-4 flex justify-between items-baseline">
                            <span className="font-sans text-sm uppercase tracking-wider text-taupe">Total payé</span>
                            <span className="font-serif text-2xl text-brown font-semibold">{formatPrice(order.totalAmount)}</span>
                        </div>

                        {/* Statut paiement */}
                        <div className="flex items-center justify-center gap-2 bg-green-50 rounded-xl py-2.5">
                            <span className="text-green-600 text-sm">✅</span>
                            <span className="font-sans text-xs text-green-700 font-medium">Paiement confirmé par Stripe</span>
                        </div>

                        {/* Message retrait */}
                        {isRetrait && (
                            <div className="bg-gold/5 border border-gold/20 rounded-xl p-3 text-center">
                                <p className="font-sans text-xs text-brown leading-relaxed">
                                    📍 <strong>Présentez ce reçu en boutique</strong> pour retirer votre commande.<br />
                                    <span className="text-taupe">Boutique Susy Modas · Kourou, Guyane</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer reçu */}
                    <div className="bg-beige/30 px-6 py-3 text-center border-t border-beige">
                        <p className="font-sans text-[0.6rem] text-taupe">Merci pour votre achat · susymodas.com</p>
                    </div>
                </div>

                {/* Boutons actions */}
                <div className="mt-6 space-y-3 no-print">
                    <button onClick={handlePrint}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gold text-white rounded-xl font-sans text-xs uppercase tracking-widest hover:bg-rose-deep transition-colors">
                        <Download size={15} />
                        {isRetrait ? 'Télécharger mon bon de retrait' : 'Télécharger mon reçu'}
                    </button>
                    <Link href="/"
                        className="w-full flex items-center justify-center py-3 border border-gray-200 text-brown rounded-xl font-sans text-xs uppercase tracking-widest hover:border-gold transition-colors">
                        Retour à la boutique
                    </Link>
                </div>

            </div>

            {/* Styles impression */}
            <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .receipt-card { 
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
        </div>
    )
}

export default function SuccesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-gold" />
            </div>
        }>
            <SuccesContent />
        </Suspense>
    )
}