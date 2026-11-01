import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import AuthForm from './AuthForm'
import { getSession } from '@/lib/auth'

export const metadata = { title: 'Connexion' }
export const dynamic = 'force-dynamic'

export default async function ConnexionPage() {
  const session = await getSession()
  if (session?.user) redirect('/compte')
  const google = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  return (
    <div className="shop-container py-16 lg:py-24">
      <Suspense><AuthForm google={google} /></Suspense>
    </div>
  )
}
