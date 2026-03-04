import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { ShoppingBag, Package, LayoutDashboard } from 'lucide-react'
import LogoutButton from '@/components/admin/LogoutButton'

async function getAdmin() {
  const token = cookies().get('susy_admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export const metadata = { title: 'Admin — Susy Modas' }

export default async function AdminLayout({ children }) {
  const admin = await getAdmin()

  const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Produits', icon: Package },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 bg-brown min-h-screen flex flex-col fixed top-0 left-0 bottom-0 z-40">
        <div className="p-6 border-b border-white/10">
          <p className="font-serif text-lg text-white">Susy Modas</p>
          <p className="font-sans text-[0.6rem] tracking-widest uppercase text-gold mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all font-sans text-sm"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {admin && (
            <p className="font-sans text-xs text-white/40 mb-3 truncate">{admin.email}</p>
          )}
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 ml-60 p-8">
        {children}
      </main>
    </div>
  )
}