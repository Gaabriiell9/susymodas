import { Suspense } from 'react'
import CheckoutClient from './CheckoutClient'
import { getSession } from '@/lib/auth'

export const metadata = { title: 'Commande' }
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const session = await getSession()
  const user = session?.user ? { name: session.user.name ?? '', email: session.user.email ?? '' } : null
  return (
    <Suspense>
      <CheckoutClient user={user} />
    </Suspense>
  )
}
