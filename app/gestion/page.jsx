import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import prisma from '@/lib/prisma'
import ProductImage from '@/components/ui/ProductImage'
import { DELIVERY_LABEL, ORDER_STATUS, cn, formatDate, formatPrice } from '@/lib/utils'

const PAID = ['CONFIRMED', 'READY', 'SHIPPED', 'DELIVERED']

export default async function Dashboard() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const [month, total, toPrepare, latest, lowStock, productCount] = await Promise.all([
    prisma.order.aggregate({ where: { status: { in: PAID }, paidAt: { gte: monthStart } }, _sum: { totalAmount: true }, _count: true }),
    prisma.order.aggregate({ where: { status: { in: PAID } }, _sum: { totalAmount: true }, _count: true }),
    prisma.order.count({ where: { status: { in: ['CONFIRMED', 'READY'] } } }),
    prisma.order.findMany({ where: { status: { not: 'PENDING' } }, orderBy: { createdAt: 'desc' }, take: 6, include: { items: true } }),
    prisma.product.findMany({ where: { active: true, stock: { lte: 2 } }, orderBy: { stock: 'asc' }, take: 6 }),
    prisma.product.count({ where: { active: true } }),
  ])

  const stats = [
    { label: 'Ventes ce mois-ci', value: formatPrice(month._sum.totalAmount ?? 0), sub: `${month._count} commande(s)` },
    { label: 'À préparer / à retirer', value: toPrepare, sub: 'commandes en cours', href: '/gestion/ventes?statut=CONFIRMED', alert: toPrepare > 0 },
    { label: 'Chiffre total', value: formatPrice(total._sum.totalAmount ?? 0), sub: `${total._count} commande(s) payée(s)` },
    { label: 'Articles en ligne', value: productCount, sub: `${lowStock.length} en stock faible`, href: '/gestion/articles' },
  ]

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-ink-muted">{formatDate(now)}</p>
        </div>
        <Link href="/gestion/articles/nouveau" className="btn-dark"><Plus size={15} /> Nouvel article</Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const inner = (
            <>
              <p className="text-sm text-ink-muted">{s.label}</p>
              <p className={cn('mt-3 display text-[2.25rem]', s.alert && 'text-sale')}>{s.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.sub}</p>
            </>
          )
          return s.href
            ? <Link key={s.label} href={s.href} className="border border-line bg-paper p-5 transition hover:border-ink">{inner}</Link>
            : <div key={s.label} className="border border-line bg-paper p-5">{inner}</div>
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="border border-line bg-paper">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-body text-sm font-medium tracking-normal">Dernières ventes</h2>
            <Link href="/gestion/ventes" className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink">Tout voir <ArrowRight size={13} /></Link>
          </div>
          {latest.length === 0 ? (
            <p className="px-5 py-12 text-center text-[14px] text-ink-muted">Aucune vente pour le moment.</p>
          ) : (
            <ul className="divide-y divide-line">
              {latest.map((o) => (
                <li key={o.id}>
                  <Link href={`/gestion/ventes?ref=${o.reference}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-sand/40">
                    <div className="min-w-0">
                      <p className="truncate text-[14px]">{o.firstName} {o.lastName}</p>
                      <p className="text-sm text-ink-muted">{formatDate(o.createdAt, true)} · {DELIVERY_LABEL[o.deliveryMethod]} · {o.items.reduce((s, i) => s + i.quantity, 0)} art.</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={cn('hidden px-2 py-0.5 text-sm sm:inline', ORDER_STATUS[o.status].tone)}>{ORDER_STATUS[o.status].label}</span>
                      <span className="text-[14px]">{formatPrice(o.totalAmount)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-line bg-paper">
          <div className="border-b border-line px-5 py-4"><h2 className="font-body text-sm font-medium tracking-normal">Stock faible</h2></div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-12 text-center text-[14px] text-ink-muted">Tout est bien approvisionné.</p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/gestion/articles/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-sand/40">
                    <div className="relative aspect-[3/4] w-10 shrink-0 overflow-hidden bg-sand"><ProductImage src={p.images[0]} alt={p.name} sizes="40px" /></div>
                    <p className="min-w-0 flex-1 truncate text-[14px]">{p.name}</p>
                    <span className={cn('text-sm', p.stock === 0 ? 'text-sale' : 'text-accent')}>{p.stock === 0 ? 'Épuisé' : `${p.stock} restant(s)`}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
