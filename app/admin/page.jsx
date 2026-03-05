export const dynamic = 'force-dynamic'

import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react'

async function getStats() {
  const [totalOrders, pendingOrders, totalProducts, recentOrders, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { active: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } },
      _sum: { totalAmount: true },
    }),
  ])
  return { totalOrders, pendingOrders, totalProducts, recentOrders, revenue: revenue._sum.totalAmount ?? 0 }
}

const STATUS_LABELS = {
  PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
  SHIPPED: { label: 'Expédiée', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Commandes totales', value: stats.totalOrders, icon: ShoppingBag, color: 'text-gold' },
    { label: 'En attente', value: stats.pendingOrders, icon: Clock, color: 'text-amber-500' },
    { label: 'Produits actifs', value: stats.totalProducts, icon: Package, color: 'text-blue-500' },
    { label: "Chiffre d'affaires", value: formatPrice(stats.revenue), icon: TrendingUp, color: 'text-green-600' },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl text-brown mb-8">Tableau de bord</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-xs text-gray-500 uppercase tracking-wider">{card.label}</p>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="font-serif text-2xl text-brown">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-serif text-lg text-brown">Commandes récentes</h2>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="p-8 text-center font-sans text-sm text-gray-400 italic">
            Aucune commande pour l&apos;instant.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                {['Référence', 'Client', 'Montant', 'Statut', 'Date'].map((h) => (
                  <th key={h} className="px-5 py-3 font-sans text-xs uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((order) => {
                const s = STATUS_LABELS[order.status]
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-sans text-sm font-medium text-brown">{order.reference}</td>
                    <td className="px-5 py-3.5 font-sans text-sm text-gray-600">{order.firstName} {order.lastName}</td>
                    <td className="px-5 py-3.5 font-sans text-sm text-gray-800">{formatPrice(order.totalAmount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium font-sans ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}