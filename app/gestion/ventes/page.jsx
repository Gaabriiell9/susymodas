import prisma from '@/lib/prisma'
import OrdersBoard from '@/components/gestion/OrdersBoard'

export default async function VentesPage({ searchParams }) {
  const orders = await prisma.order.findMany({
    where: { status: { not: 'PENDING' } },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 300,
  })
  const plain = JSON.parse(JSON.stringify(orders))
  return (
    <>
      <h1 className="display text-[2.5rem]">Ventes</h1>
      <p className="mt-1 text-sm text-ink-muted">Commandes payées en ligne. Mettez à jour le statut pour suivre la préparation.</p>
      <OrdersBoard initial={plain} initialStatus={searchParams.statut ?? ''} initialRef={searchParams.ref ?? ''} />
    </>
  )
}
