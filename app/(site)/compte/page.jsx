import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Settings2 } from 'lucide-react'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import ProductImage from '@/components/ui/ProductImage'
import SignOutButton from './SignOutButton'
import PasswordForm from './PasswordForm'
import { DELIVERY_LABEL, ORDER_STATUS, cn, formatDate, formatPrice } from '@/lib/utils'

export const metadata = { title: 'Mon compte' }
export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/connexion?callbackUrl=/compte')
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, status: { not: 'PENDING' } },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])
  const isAdmin = session.user.role === 'ADMIN'

  return (
    <div className="shop-container max-w-4xl py-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <h1 >Bonjour {session.user.name?.split(' ')[0] || ''}</h1>
          <p className="mt-2 text-[14px] text-ink-muted">{session.user.email}</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && <Link href="/gestion" className="btn-dark"><Settings2 size={15} /> Gérer la boutique</Link>}
          <SignOutButton />
        </div>
      </div>

      <div className="mt-6"><PasswordForm /></div>

      <h2 className="mb-6 mt-12 font-body text-lg font-medium tracking-normal">Mes commandes</h2>
      {orders.length === 0 ? (
        <div className="border border-dashed border-line py-16 text-center">
          <p className="display text-2xl">Aucune commande pour l&apos;instant</p>
          <Link href="/" className="btn-outline mt-6">Découvrir la collection</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="border border-line bg-paper p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-medium">{o.reference}</p>
                  <p className="text-sm text-ink-muted">{formatDate(o.createdAt)} · {DELIVERY_LABEL[o.deliveryMethod]}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('px-2.5 py-1 text-sm', ORDER_STATUS[o.status].tone)}>{ORDER_STATUS[o.status].label}</span>
                  <span className="text-[14px]">{formatPrice(o.totalAmount)}</span>
                </div>
              </div>
              <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
                {o.items.map((i) => (
                  <div key={i.id} className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-sand" title={i.productName}>
                    <ProductImage src={i.productImage} alt={i.productName} sizes="56px" />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
