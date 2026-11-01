'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { CATEGORIES } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/collection?tri=nouveautes', label: 'Nouveautés' },
  { href: '/collection', label: 'Collection' },
  { href: '/boutique', label: 'Notre boutique' },
]

export default function Header({ announcement }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { itemCount, openCart, ready } = useCart()
  const { count: wishCount } = useWishlist()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const isAdmin = session?.user?.role === 'ADMIN'

  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [pathname])
  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function submitSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setSearchOpen(false)
    router.push(`/collection?q=${encodeURIComponent(q)}`)
  }

  const iconBtn = 'inline-flex h-11 w-11 items-center justify-center text-ink transition-colors duration-short hover:text-accent'

  return (
    <>
      {announcement && (
        <p className="truncate bg-ink px-gutter py-2 text-center text-sm text-paper">{announcement}</p>
      )}

      <header className="sticky top-0 z-nav border-b-2 border-rule-ink bg-paper">
        <div className="shop-container flex h-[72px] items-center justify-between gap-2 sm:gap-6">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setMenuOpen(true)} className={cn(iconBtn, '-ml-3 lg:hidden')} aria-label="Ouvrir le menu">
              <Menu size={22} strokeWidth={1.5} />
            </button>
            <Logo />
          </div>

          <nav aria-label="Navigation principale" className="flex items-center gap-1">
            <ul className="mr-4 hidden items-center gap-7 lg:flex">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline py-1 font-medium">{l.label}</Link>
                </li>
              ))}
              {isAdmin && <li><Link href="/gestion" className="link-underline py-1 font-medium text-accent">Gestion</Link></li>}
            </ul>
            <button type="button" onClick={() => setSearchOpen(true)} className={cn(iconBtn, 'max-[359px]:hidden')} aria-label="Rechercher">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link href={session ? '/compte' : '/connexion'} className={cn(iconBtn, 'hidden sm:inline-flex')} aria-label="Mon compte">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link href="/favoris" className={cn(iconBtn, 'relative')} aria-label={`Mes favoris${wishCount ? ` (${wishCount})` : ''}`}>
              <Heart size={20} strokeWidth={1.5} />
              {wishCount > 0 && <span className="absolute right-1 top-1 min-w-[18px] bg-ink px-1 text-center text-xs leading-[18px] text-paper">{wishCount}</span>}
            </Link>
            <button type="button" onClick={openCart} className="btn-primary ml-1 min-h-[44px] px-3 sm:ml-2 sm:px-4" aria-label={`Ouvrir le panier${ready && itemCount ? `, ${itemCount} article${itemCount > 1 ? 's' : ''}` : ''}`}>
              <ShoppingBag size={18} strokeWidth={1.5} className="sm:hidden" aria-hidden="true" />
              <span className="max-sm:sr-only">Panier</span>
              {ready && itemCount > 0 ? <span className="tabular-nums">{itemCount}</span> : null}
            </button>
          </nav>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-modal animate-fade bg-ink/40 motion-reduce:animate-none" onClick={() => setSearchOpen(false)}>
          <div className="border-b-2 border-rule-ink bg-paper" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={submitSearch} role="search" className="shop-container flex min-h-24 items-center gap-4 py-4">
              <label htmlFor="site-search" className="visually-hidden">Rechercher dans la boutique</label>
              <Search size={22} strokeWidth={1.5} className="shrink-0 text-muted" aria-hidden="true" />
              <input
                id="site-search"
                ref={searchRef}
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Une robe, une jupe, une couleur…"
                className="display min-w-0 flex-1 bg-transparent text-[2rem] text-ink outline-none placeholder:text-muted focus-visible:outline-none"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className={iconBtn} aria-label="Fermer la recherche">
                <X size={22} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-modal lg:hidden">
          <div className="absolute inset-0 animate-fade bg-ink/40 motion-reduce:animate-none" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm animate-slide-in-left flex-col bg-paper motion-reduce:animate-none">
            <div className="flex h-[72px] items-center justify-between border-b-2 border-rule-ink px-6">
              <Logo />
              <button type="button" onClick={() => setMenuOpen(false)} className={cn(iconBtn, '-mr-3')} aria-label="Fermer le menu"><X size={22} strokeWidth={1.5} /></button>
            </div>
            <nav aria-label="Menu" className="flex-1 overflow-y-auto px-6 py-6">
              <ul className="divide-y divide-rule border-b border-rule">
                {NAV.map((l) => (
                  <li key={l.href}><Link href={l.href} className="display block py-4 text-[2rem]">{l.label}</Link></li>
                ))}
                <li><Link href="/collection?promo=1" className="display block py-4 text-[2rem] text-accent">Promotions</Link></li>
              </ul>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3">
                {CATEGORIES.map((c) => (
                  <li key={c.id}><Link href={`/collection?categorie=${c.id}`} className="link-underline">{c.label}</Link></li>
                ))}
              </ul>
            </nav>
            <div className="space-y-3 border-t border-rule px-6 py-6">
              {isAdmin && <Link href="/gestion" className="btn-primary w-full">Gérer la boutique</Link>}
              <Link href={session ? '/compte' : '/connexion'} className="btn-outline w-full"><User size={18} strokeWidth={1.5} /> {session ? 'Mon compte' : 'Se connecter'}</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
