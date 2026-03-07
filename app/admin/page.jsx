export const dynamic = 'force-dynamic'

import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

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
    { label: 'Commandes totales', value: stats.totalOrders, icon: ShoppingBag, color: 'text-gold', bg: 'bg-gold/10', href: '/admin/orders' },
    { label: 'En attente', value: stats.pendingOrders, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', href: '/admin/orders' },
    { label: 'Produits actifs', value: stats.totalProducts, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', href: '/admin/products' },
    { label: "Chiffre d'affaires", value: formatPrice(stats.revenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', href: null },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl text-brown mb-6">Tableau de bord</h1>

      {/* Stats cards — 2 colonnes sur mobile, 4 sur desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {cards.map((card) => {
          const content = (
            <div className={`bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm ${card.href ? 'hover:border-gold/30 hover:shadow-md transition-all cursor-pointer active:scale-98' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-sans text-[0.65rem] sm:text-xs text-gray-500 uppercase tracking-wider leading-tight">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
                  <card.icon size={16} className={card.color} />
                </div>
              </div>
              <p className="font-serif text-2xl sm:text-3xl text-brown">{card.value}</p>
            </div>
          )
          return card.href
            ? <Link key={card.label} href={card.href}>{content}</Link>
            : <div key={card.label}>{content}</div>
        })}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
          <h2 className="font-serif text-lg text-brown">Commandes récentes</h2>
          <Link href="/admin/orders" className="font-sans text-xs text-gold hover:underline">Voir tout →</Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="p-8 text-center font-sans text-sm text-gray-400 italic">Aucune commande pour l&apos;instant.</p>
        ) : (
          <>
            {/* Mobile : cards */}
            <div className="block sm:hidden divide-y divide-gray-50">
              {stats.recentOrders.map((order) => {
                const s = STATUS_LABELS[order.status]
                return (
                  <Link key={order.id} href="/admin/orders" className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="font-sans text-sm font-medium text-brown">{order.reference}</p>
                      <p className="font-sans text-xs text-gray-500 mt-0.5">{order.firstName} {order.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-sans text-sm text-brown">{formatPrice(order.totalAmount)}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-medium font-sans ${s.color}`}>{s.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Desktop : tableau */}
            <table className="hidden sm:table w-full">
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
                      <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-medium font-sans ${s.color}`}>{s.label}</span></td>
                      <td className="px-5 py-3.5 font-sans text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}