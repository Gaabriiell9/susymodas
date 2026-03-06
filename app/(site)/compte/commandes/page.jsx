'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'

const STATUS_MAP = {
    PENDING: { label: 'En attente', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
    CONFIRMED: { label: 'Confirmée', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
    SHIPPED: { label: 'Expédiée', color: 'text-purple-600 bg-purple-50', icon: Truck },
    DELIVERED: { label: 'Livrée', color: 'text-green-600 bg-green-50', icon: CheckCircle },
    CANCELLED: { label: 'Annulée', color: 'text-red-500 bg-red-50', icon: XCircle },
}

export default function CommandesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

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

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <p className="font-serif text-taupe italic">Chargement…</p>
            </div>
        )
    }

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
                            return (
                                <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
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

                                    <div className="space-y-2 mb-4">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex justify-between font-sans text-sm text-brown-light">
                                                <span>{item.product.name} {item.size ? `— ${item.size}` : ''} ×{item.quantity}</span>
                                                <span>{(item.price * item.quantity).toFixed(2)} €</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-beige">
                                        <p className="font-sans text-xs text-taupe">
                                            {order.address === 'Retrait en boutique — Kourou' ? '🏪 Retrait boutique' : `🚚 ${order.address}`}
                                        </p>
                                        <p className="font-serif text-brown font-semibold">{order.totalAmount.toFixed(2)} €</p>
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