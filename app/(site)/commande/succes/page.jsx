'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Download, Store, Truck, Loader2 } from 'lucide-react'
import { generateReceipt } from '@/lib/generateReceipt'

function formatPrice(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

function SuccesContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!sessionId) { setLoading(false); return }
        fetch(`/api/orders/by-session?session_id=${sessionId}`)
            .then(r => r.json())
            .then(d => { if (d.error) setError(d.error); else setOrder(d.order) })
            .catch(() => setError('Erreur'))
            .finally(() => setLoading(false))
    }, [sessionId])

    const isRetrait = !order?.address || order.address.includes('Retrait')

    async function handleDownload() {
        if (!order) return
        setGenerating(true)
        try { await generateReceipt(order, isRetrait) }
        catch (e) { console.error(e); alert('Erreur PDF.') }
        finally { setGenerating(false) }
    }

    if (loading) return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-gold" />
        </div>
    )

    if (error || !order) return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <h1 className="font-serif text-3xl text-brown mb-4">Commande confirmée !</h1>
                <p className="font-sans text-brown-light text-sm mb-8">Merci pour votre commande. Vous recevrez une confirmation par email.</p>
                <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-gold text-white font-sans text-xs uppercase tracking-widest rounded-lg">
                    Retour à la boutique
                </Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-cream py-8 px-4">
            <div className="max-w-lg mx-auto">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h1 className="font-serif text-3xl text-brown mb-2">Commande confirmée !</h1>
                    <p className="font-sans text-brown-light text-sm">
                        {isRetrait
                            ? 'Téléchargez votre bon de retrait et présentez-le en boutique.'
                            : 'Nous vous contacterons pour organiser la livraison.'}
                    </p>
                </div>

                {/* Aperçu */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-sans text-[0.6rem] uppercase tracking-wider text-taupe">Référence</p>
                            <p className="font-serif text-lg text-brown font-semibold">{order.reference}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-sans text-[0.6rem] uppercase tracking-wider text-taupe">Total payé</p>
                            <p className="font-serif text-xl text-brown font-semibold">{formatPrice(order.totalAmount)}</p>
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4 ${isRetrait ? 'bg-gold/10' : 'bg-blue-50'}`}>
                        {isRetrait ? <Store size={16} className="text-gold" /> : <Truck size={16} className="text-blue-500" />}
                        <p className="font-sans text-xs font-medium text-brown">
                            {isRetrait ? 'Retrait en boutique — Kourou' : order.address}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                {item.image && (
                                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-beige flex-shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover object-top" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-serif text-sm text-brown">{item.name}</p>
                                    {item.size && <p className="font-sans text-xs text-taupe">Taille {item.size}</p>}
                                </div>
                                <p className="font-sans text-sm font-medium text-brown">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={handleDownload} disabled={generating}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold text-white rounded-xl font-sans text-xs uppercase tracking-widest hover:bg-rose-deep transition-colors disabled:opacity-60">
                        {generating
                            ? <><Loader2 size={15} className="animate-spin" /> Génération…</>
                            : <><Download size={15} /> {isRetrait ? 'Télécharger mon bon de retrait' : 'Télécharger mon reçu'}</>}
                    </button>
                    <Link href="/"
                        className="w-full flex items-center justify-center py-3 border border-gray-200 text-brown rounded-xl font-sans text-xs uppercase tracking-widest hover:border-gold transition-colors">
                        Retour à la boutique
                    </Link>
                </div>

            </div>
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