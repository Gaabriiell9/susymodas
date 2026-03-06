import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { ShoppingBag, Package, LayoutDashboard, Menu, X } from 'lucide-react'
import LogoutButton from '@/components/admin/LogoutButton'
import AdminSidebar from '@/components/admin/AdminSidebar'

async function getAdmin() {
  const token = cookies().get('susy_admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export const metadata = { title: 'Admin — Susy Modas' }

export default async function AdminLayout({ children }) {
  const admin = await getAdmin()
  const NAV = [
    { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/admin/products', label: 'Produits', icon: 'Package' },
    { href: '/admin/orders', label: 'Commandes', icon: 'ShoppingBag' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar nav={NAV} admin={admin} />
      <main className="md:ml-60 p-4 sm:p-8 pt-20 md:pt-8">
        {children}
      </main>
    </div>
  )
}