'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Package, Clock, CheckCircle, Truck, XCircle, Download, Loader2, Store } from 'lucide-react'
import { generateReceipt } from '@/lib/generateReceipt'

const STATUS_MAP = {
    PENDING: { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: Clock },
    CONFIRMED: { label: 'Confirmée', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
    SHIPPED: { label: 'Expédiée', color: 'text-purple-600 bg-purple-50', icon: Truck },
    DELIVERED: { label: 'Livrée', color: 'text-green-600 bg-green-50', icon: CheckCircle },
    CANCELLED: { label: 'Annulée', color: 'text-red-500 bg-red-50', icon: XCircle },
}

function formatPrice(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

export default function CommandesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [dlLoading, setDlLoading] = useState({}) // { [orderId]: boolean }

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/connexion')
    }, [status, router])

    useEffect(() => {
        if (!session?.user) return
        fetch('/api/compte/commandes')
            .then(r => r.json())
            .then(data => setOrders(data.orders ?? []))
            .finally(() => setLoading(false))
    }, [session])

    async function handleDownload(order) {
        setDlLoading(prev => ({ ...prev, [order.id]: true }))
        try {
            const isRetrait = !order.address || order.address.includes('Retrait')
            // Normalise les items pour generateReceipt
            const normalized = {
                ...order,
                items: order.items.map(i => ({
                    name: i.product?.name ?? 'Article',
                    image: i.product?.images?.[0] ?? null,
                    size: i.size,
                    quantity: i.quantity,
                    price: i.price,
                }))
            }
            await generateReceipt(normalized, isRetrait)
        } catch (e) {
            console.error(e)
            alert('Erreur lors de la génération du PDF.')
        } finally {
            setDlLoading(prev => ({ ...prev, [order.id]: false }))
        }
    }

    if (status === 'loading' || loading) return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
            <p className="font-serif text-taupe italic">Chargement…</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-cream py-12 px-4 sm:px-10">
            <div className="mx-auto max-w-3xl">

                <button onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-brown-light hover:text-gold transition-colors font-sans text-sm mb-8">
                    <ChevronLeft size={16} strokeWidth={1.5} />
                    Retour
                </button>

                <div className="mb-10">
                    <p className="font-sans text-xs tracking-widest uppercase text-gold mb-2">Mon compte</p>
                    <h1 className="font-serif text-3xl text-brown">Mes Commandes</h1>
                </div>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-taupe">
                        <Package size={48} strokeWidth={1} />
                        <p className="font-serif text-xl italic">Aucune commande pour l&apos;instant</p>
                        <button onClick={() => router.push('/collection')}
                            className="px-8 py-3 bg-gold text-white font-sans text-xs uppercase tracking-widest rounded-lg hover:bg-rose-deep transition-colors">
                            Découvrir la collection
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const s = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
                            const Icon = s.icon
                            const isRetrait = !order.address || order.address.includes('Retrait')
                            const isPaid = ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status)

                            return (
                                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">

                                    {/* En-tête commande */}
                                    <div className="flex items-start justify-between px-5 pt-5 pb-3">
                                        <div>
                                            <p className="font-serif text-brown text-base font-medium">{order.reference}</p>
                                            <p className="font-sans text-xs text-taupe mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-xs font-medium ${s.color}`}>
                                            <Icon size={12} />
                                            {s.label}
                                        </span>
                                    </div>

                                    {/* Articles */}
                                    <div className="px-5 pb-3 space-y-1.5">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex justify-between font-sans text-sm text-brown-light">
                                                <span>
                                                    {item.product?.name ?? 'Article'}
                                                    {item.size ? ` — ${item.size}` : ''}
                                                    {` ×${item.quantity}`}
                                                </span>
                                                <span>{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer commande */}
                                    <div className="flex items-center justify-between px-5 py-3 border-t border-beige bg-beige/30">
                                        <div className="flex items-center gap-1.5 text-taupe">
                                            {isRetrait
                                                ? <Store size={13} className="text-gold" />
                                                : <Truck size={13} className="text-blue-400" />}
                                            <p className="font-sans text-xs">
                                                {isRetrait ? 'Retrait en boutique' : order.address}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <p className="font-serif text-brown font-semibold text-sm">
                                                {formatPrice(order.totalAmount)}
                                            </p>

                                            {/* Bouton téléchargement — uniquement si commande payée */}
                                            {isPaid && (
                                                <button
                                                    onClick={() => handleDownload(order)}
                                                    disabled={dlLoading[order.id]}
                                                    title={isRetrait ? 'Télécharger le bon de retrait' : 'Télécharger le reçu'}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold rounded-lg font-sans text-xs font-medium transition-colors disabled:opacity-50">
                                                    {dlLoading[order.id]
                                                        ? <Loader2 size={12} className="animate-spin" />
                                                        : <Download size={12} />}
                                                    {isRetrait ? 'Bon de retrait' : 'Reçu'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            )
                        })}
                    </div>
                )}

            </div>
        </div>
    )
}