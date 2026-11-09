'use client'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Heart, Menu, Search, ShoppingBag, User, X, Store } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { CATEGORIES } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const CATS = [
  { href: '/?tri=nouveautes', label: 'Nouveautés', match: (p) => p.get('tri') === 'nouveautes' },
  ...CATEGORIES.map((c) => ({ href: `/?categorie=${c.id}`, label: c.label, match: (p) => p.get('categorie') === c.id })),
  { href: '/?promo=1', label: 'Promotions', accent: true, match: (p) => p.get('promo') === '1' },
]

export default function Header({ announcement }) {
  return (
    <Suspense fallback={<div className="h-[148px]" />}>
      <HeaderInner announcement={announcement} />
    </Suspense>
  )
}

function HeaderInner({ announcement }) {
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { itemCount, openCart, ready } = useCart()
  const { count: wishCount } = useWishlist()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const isAdmin = session?.user?.role === 'ADMIN'
  const onShop = pathname === '/' || pathname === '/collection'

  useEffect(() => { setMenuOpen(false) }, [pathname, params])
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function submitSearch(e) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  const icon = 'relative inline-flex h-11 min-w-11 items-center justify-center gap-2 px-2 text-ink transition-colors duration-short hover:text-accent'
  const badge = 'absolute right-0.5 top-1 min-w-[18px] bg-accent px-1 text-center text-xs font-semibold leading-[18px] text-accent-ink'

  const searchForm = (id) => (
    <form onSubmit={submitSearch} role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">Rechercher un article</label>
      <input
        id={id}
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une robe, une jupe, une couleur…"
        className="field min-h-11 bg-paper-2 py-2 pl-11 pr-4"
      />
      <Search size={18} strokeWidth={1.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
    </form>
  )

  return (
    <>
      {announcement && <p className="truncate bg-accent px-gutter py-1.5 text-center text-sm text-accent-ink">{announcement}</p>}

      <header className="sticky top-0 z-nav border-b border-rule bg-paper">
        <div className="shop-container flex h-16 items-center gap-3 lg:gap-8">
          <button type="button" onClick={() => setMenuOpen(true)} className={cn(icon, '-ml-2 lg:hidden')} aria-label="Ouvrir le menu">
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <Logo />
          <div className="hidden max-w-xl flex-1 md:block">{searchForm('search-desktop')}</div>
          <nav aria-label="Mon espace" className="ml-auto flex items-center">
            <Link href="/boutique" className={cn(icon, 'hidden xl:inline-flex')}><Store size={20} strokeWidth={1.5} aria-hidden="true" /><span className="text-sm font-medium">Notre boutique</span></Link>
            {isAdmin && <Link href="/gestion" className="mr-2 hidden min-h-9 items-center bg-ink px-3 text-sm font-medium text-paper sm:inline-flex">Gestion</Link>}
            <Link href={session ? '/compte' : '/connexion'} className={icon} aria-label="Mon compte">
              <User size={20} strokeWidth={1.5} aria-hidden="true" /><span className="hidden text-sm font-medium lg:inline">{session ? 'Mon compte' : 'Connexion'}</span>
            </Link>
            <Link href="/favoris" className={icon} aria-label={`Favoris${wishCount ? `, ${wishCount}` : ''}`}>
              <Heart size={20} strokeWidth={1.5} aria-hidden="true" />
              {wishCount > 0 && <span className={badge}>{wishCount}</span>}
            </Link>
            <button type="button" onClick={openCart} className={cn(icon, '-mr-2')} aria-label={`Panier${ready && itemCount ? `, ${itemCount} article${itemCount > 1 ? 's' : ''}` : ''}`}>
              <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" /><span className="hidden text-sm font-medium lg:inline">Panier</span>
              {ready && itemCount > 0 && <span className={badge}>{itemCount}</span>}
            </button>
          </nav>
        </div>

        <div className="shop-container pb-3 md:hidden">{searchForm('search-mobile')}</div>

        <nav aria-label="Catégories" className="border-t border-rule">
          <ul className="no-scrollbar shop-container flex gap-6 overflow-x-auto">
            {CATS.map((c) => {
              const on = onShop && c.match(params)
              return (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    aria-current={on ? 'page' : undefined}
                    className={cn('inline-flex h-11 items-center whitespace-nowrap border-b-2 text-sm font-medium transition-colors duration-short',
                      on ? 'border-accent text-ink' : 'border-transparent text-ink-2 hover:border-ink hover:text-ink',
                      c.accent && 'text-accent')}
                  >
                    {c.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-modal lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 animate-fade bg-ink/40 motion-reduce:animate-none" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-slide-in-left flex-col bg-paper motion-reduce:animate-none">
            <div className="flex h-16 items-center justify-between border-b border-rule px-5">
              <Logo />
              <button type="button" onClick={() => setMenuOpen(false)} className={cn(icon, '-mr-2')} aria-label="Fermer le menu"><X size={22} strokeWidth={1.5} /></button>
            </div>
            <nav aria-label="Menu" className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-rule">
                <li><Link href="/" className="flex min-h-12 items-center px-5 font-semibold">Toute la boutique</Link></li>
                {CATS.map((c) => (
                  <li key={c.href}><Link href={c.href} className={cn('flex min-h-12 items-center px-5', c.accent && 'text-accent')}>{c.label}</Link></li>
                ))}
                <li><Link href="/boutique" className="flex min-h-12 items-center px-5">Notre boutique à Kourou</Link></li>
              </ul>
            </nav>
            <div className="space-y-2 border-t border-rule p-5">
              {isAdmin && <Link href="/gestion" className="btn-primary w-full">Gérer la boutique</Link>}
              <Link href={session ? '/compte' : '/connexion'} className="btn-outline w-full">{session ? 'Mon compte' : 'Se connecter'}</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
