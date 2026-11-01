import { notFound } from 'next/navigation'
import { getAdmin } from '@/lib/auth'
import GestionNav from '@/components/gestion/GestionNav'

export const metadata = { title: 'Gestion', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function GestionLayout({ children }) {
  const admin = await getAdmin()
  if (!admin) notFound()
  return (
    <div className="min-h-screen bg-paper-2 lg:flex">
      <GestionNav name={admin.name || admin.email} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-10">{children}</div>
      </div>
    </div>
  )
}
