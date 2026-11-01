'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Shirt, Receipt, Settings, ExternalLink, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/gestion', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/gestion/articles', label: 'Articles', icon: Shirt },
  { href: '/gestion/ventes', label: 'Ventes', icon: Receipt },
  { href: '/gestion/reglages', label: 'Réglages', icon: Settings },
]

export default function GestionNav({ name }) {
  const path = usePathname()
  const isActive = (l) => (l.exact ? path === l.href : path.startsWith(l.href))
  return (
    <>
      {/* Ordinateur */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-paper lg:flex">
        <div className="border-b border-line px-6 py-6">
          <p className="display text-[2rem]">Susy Modas</p>
          <p className="mt-1 text-sm text-ink-muted">Gestion de la boutique</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={cn('flex items-center gap-3 px-3 py-2.5 text-[14px] transition', isActive(l) ? 'bg-ink text-ivory' : 'text-ink-soft hover:bg-sand')}>
              <l.icon size={17} strokeWidth={1.5} /> {l.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-line p-3 text-sm">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-ink-soft hover:bg-sand"><ExternalLink size={16} strokeWidth={1.5} /> Voir la boutique</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-3 px-3 py-2 text-ink-soft hover:bg-sand"><LogOut size={16} strokeWidth={1.5} /> Déconnexion</button>
          <p className="truncate px-3 pt-2 text-sm text-ink-muted">{name}</p>
        </div>
      </aside>

      {/* Mobile */}
      <div className="sticky top-0 z-30 border-b border-line bg-paper lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <p className="display text-[2rem]">Gestion</p>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-ink-soft"><ExternalLink size={14} /> Boutique</Link>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-2 pb-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={cn('flex shrink-0 items-center gap-2 px-3 py-2 text-sm', isActive(l) ? 'bg-ink text-ivory' : 'text-ink-soft')}>
              <l.icon size={15} strokeWidth={1.5} /> {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
