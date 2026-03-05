'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'
const STATUSES = {
  PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700', next: 'CONFIRMED' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', next: 'SHIPPED' },
  SHIPPED: { label: 'Expédiée', color: 'bg-purple-100 text-purple-700', next: 'DELIVERED' },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-700', next: null },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700', next: null },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchOrders() }, [filter])

  async function fetchOrders() {
    setLoading(true)
    const url = filter === 'all' ? '/api/orders' : `/api/orders?status=${filter}`
    const res = await fetch(url)
    const data = await res.json()
    setOrders(data.orders ?? [])
    setLoading(false)
  }

  async function updateStatus(orderId, status) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchOrders()
    if (selected?.id === orderId) setSelected({ ...selected, status })
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-brown mb-6">Commandes</h1>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', 'Toutes'], ...Object.entries(STATUSES).map(([k, v]) => [k, v.label])].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full font-sans text-xs uppercase tracking-wider transition-colors ${filter === key ? 'bg-gold text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gold'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Liste */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-gray-400 font-sans text-sm">Chargement…</p>
          ) : orders.length === 0 ? (
            <p className="p-8 text-center text-gray-400 font-sans text-sm italic">Aucune commande.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Référence', 'Client', 'Montant', 'Méthode', 'Statut', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-xs uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const s = STATUSES[order.status]
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelected(order)}
                      className={`hover:bg-gray-50/70 cursor-pointer transition-colors ${selected?.id === order.id ? 'bg-gold/5' : ''}`}
                    >
                      <td className="px-4 py-3 font-sans text-sm font-medium text-brown">{order.reference}</td>
                      <td className="px-4 py-3 font-sans text-sm text-gray-600">{order.firstName} {order.lastName}</td>
                      <td className="px-4 py-3 font-sans text-sm">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-3 font-sans text-xs text-gray-400 uppercase">{order.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-sans font-medium ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3 font-sans text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Détail commande */}
        {selected && (
          <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 self-start sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base text-brown">{selected.reference}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>

            <div className="space-y-2 mb-4 font-sans text-sm text-gray-600">
              <p><strong className="text-brown">Client :</strong> {selected.firstName} {selected.lastName}</p>
              <p><strong className="text-brown">Email :</strong> {selected.email}</p>
              <p><strong className="text-brown">Téléphone :</strong> {selected.phone}</p>
              {selected.notes && <p><strong className="text-brown">Note :</strong> {selected.notes}</p>}
            </div>

            <div className="border-t border-gray-100 pt-3 mb-4">
              <p className="font-sans text-xs uppercase tracking-wider text-taupe mb-2">Articles</p>
              {selected.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm font-sans mb-1">
                  <span className="text-gray-600">{item.product?.name ?? `Produit #${item.productId}`} ×{item.quantity}</span>
                  <span className="text-brown">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-serif text-base text-brown font-semibold mt-2 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(selected.totalAmount)}</span>
              </div>
            </div>

            {/* Actions statut */}
            <div className="space-y-2">
              {STATUSES[selected.status]?.next && (
                <button
                  onClick={() => updateStatus(selected.id, STATUSES[selected.status].next)}
                  className="w-full bg-gold text-white py-2 rounded-lg font-sans text-xs uppercase tracking-wider hover:bg-rose-deep transition-colors"
                >
                  → Marquer {STATUSES[STATUSES[selected.status].next]?.label}
                </button>
              )}
              {selected.status !== 'CANCELLED' && selected.status !== 'DELIVERED' && (
                <button
                  onClick={() => updateStatus(selected.id, 'CANCELLED')}
                  className="w-full border border-red-200 text-red-500 py-2 rounded-lg font-sans text-xs uppercase tracking-wider hover:bg-red-50 transition-colors"
                >
                  Annuler la commande
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
