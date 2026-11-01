'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronRight, Settings2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { CATEGORIES } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const MAIN_NAV = [
  { href: '/collection?tri=nouveautes', label: 'Nouveautés' },
  { href: '/collection?categorie=robes', label: 'Robes' },
  { href: '/collection?categorie=ensembles', label: 'Ensembles' },
  { href: '/collection?categorie=ceremonie', label: 'Cérémonie' },
  { href: '/collection?promo=1', label: 'Promotions', accent: true },
]

export default function Header({ announcement }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { itemCount, openCart, ready } = useCart()
  const { count: wishCount } = useWishlist()
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const isAdmin = session?.user?.role === 'ADMIN'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setMegaOpen(false); setSearchOpen(false) }, [pathname])
  useEffect(() => { if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50) }, [searchOpen])
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

  return (
    <>
      {announcement && (
        <div className="bg-ink text-ivory">
          <div className="shop-container flex h-9 items-center justify-center text-center text-[10px] tracking-[0.1em] uppercase sm:text-[11px] sm:tracking-[0.12em]">
            <span className="truncate">{announcement}</span>
          </div>
        </div>
      )}

      <header
        className={cn('sticky top-0 z-40 border-b transition-colors duration-300', scrolled ? 'border-line bg-ivory/95 backdrop-blur' : 'border-transparent bg-ivory')}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className="shop-container grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-[76px]">
          {/* Gauche */}
          <div className="flex items-center gap-1">
            <button onClick={() => setMenuOpen(true)} className="-ml-2 p-2 lg:hidden" aria-label="Ouvrir le menu">
              <Menu size={22} strokeWidth={1.4} />
            </button>
            <button onClick={() => setSearchOpen(true)} className="p-2 lg:hidden" aria-label="Rechercher">
              <Search size={20} strokeWidth={1.4} />
            </button>
            <nav className="hidden items-center gap-7 lg:flex">
              <button
                onMouseEnter={() => setMegaOpen(true)}
                onClick={() => setMegaOpen((v) => !v)}
                className={cn('label h-[76px] link-underline', megaOpen && 'after:scale-x-100')}
              >
                Boutique
              </button>
              {MAIN_NAV.slice(0, 4).map((l) => (
                <Link key={l.href} href={l.href} onMouseEnter={() => setMegaOpen(false)} className="label link-underline">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <Logo />

          {/* Droite */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <Link href="/collection?promo=1" className="label mr-5 hidden text-sale link-underline xl:inline-block">Promotions</Link>
            <button onClick={() => setSearchOpen(true)} className="hidden p-2 lg:block" aria-label="Rechercher">
              <Search size={20} strokeWidth={1.4} />
            </button>
            {isAdmin && (
              <Link href="/gestion" className="hidden items-center gap-1.5 border border-ink px-3 py-1.5 text-[10px] uppercase tracking-label sm:flex" title="Gérer la boutique">
                <Settings2 size={13} /> Gestion
              </Link>
            )}
            <Link href={session ? '/compte' : '/connexion'} className="hidden p-2 sm:block" aria-label="Mon compte">
              <User size={20} strokeWidth={1.4} />
            </Link>
            <Link href="/favoris" className="relative p-2" aria-label="Mes favoris">
              <Heart size={20} strokeWidth={1.4} />
              {wishCount > 0 && <Dot>{wishCount}</Dot>}
            </Link>
            <button onClick={openCart} className="relative -mr-2 p-2" aria-label="Ouvrir le panier">
              <ShoppingBag size={20} strokeWidth={1.4} />
              {ready && itemCount > 0 && <Dot>{itemCount}</Dot>}
            </button>
          </div>
        </div>

        {/* Méga-menu */}
        {megaOpen && (
          <div className="absolute inset-x-0 top-full hidden animate-fade border-b border-line bg-ivory lg:block">
            <div className="shop-container grid grid-cols-[1fr_1fr_1.2fr] gap-12 py-10">
              <div>
                <p className="label mb-5 text-ink-muted">Catégories</p>
                <ul className="space-y-3">
                  {CATEGORIES.map((c) => (
                    <li key={c.id}>
                      <Link href={`/collection?categorie=${c.id}`} className="font-serif text-2xl font-light hover:italic">{c.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label mb-5 text-ink-muted">À découvrir</p>
                <ul className="space-y-3 text-[15px]">
                  <li><Link href="/collection?tri=nouveautes" className="link-underline">Nouveautés</Link></li>
                  <li><Link href="/collection?promo=1" className="text-sale link-underline">Promotions</Link></li>
                  <li><Link href="/collection" className="link-underline">Tout voir</Link></li>
                  <li><Link href="/boutique" className="link-underline">Notre boutique à Kourou</Link></li>
                </ul>
              </div>
              <Link href="/collection?tri=nouveautes" className="group relative block aspect-[16/10] overflow-hidden bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hero-robe.jpg" alt="" className="h-full w-full object-cover object-[50%_30%] transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                <div className="absolute bottom-5 left-5 text-ivory">
                  <p className="label">Nouvelle collection</p>
                  <p className="mt-1 font-serif text-3xl font-light">Découvrir</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Recherche */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 animate-fade bg-ink/40" onClick={() => setSearchOpen(false)}>
          <div className="bg-ivory" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={submitSearch} className="shop-container flex h-24 items-center gap-4">
              <Search size={22} strokeWidth={1.3} className="shrink-0 text-ink-muted" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une robe, une jupe, une couleur..."
                className="h-full flex-1 bg-transparent font-serif text-2xl font-light outline-none placeholder:text-ink-muted/50 sm:text-3xl"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2" aria-label="Fermer la recherche">
                <X size={22} strokeWidth={1.3} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm animate-slide-in-left flex-col bg-ivory">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Logo compact />
              <button onClick={() => setMenuOpen(false)} className="-mr-2 p-2" aria-label="Fermer le menu"><X size={22} strokeWidth={1.3} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="space-y-1">
                {MAIN_NAV.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={cn('flex items-center justify-between py-3 font-serif text-[26px] font-light', l.accent && 'text-sale')}>
                      {l.label} <ChevronRight size={18} strokeWidth={1.2} />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="label mb-3 mt-8 text-ink-muted">Catégories</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-[15px]">
                {CATEGORIES.map((c) => (
                  <li key={c.id}><Link href={`/collection?categorie=${c.id}`}>{c.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 border-t border-line px-5 py-5 text-[14px]">
              {isAdmin && (
                <Link href="/gestion" className="btn-dark w-full"><Settings2 size={15} /> Gérer la boutique</Link>
              )}
              <Link href={session ? '/compte' : '/connexion'} className="flex items-center gap-3"><User size={18} strokeWidth={1.4} /> {session ? 'Mon compte' : 'Se connecter'}</Link>
              <Link href="/boutique" className="flex items-center gap-3"><ShoppingBag size={18} strokeWidth={1.4} /> Notre boutique à Kourou</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Dot({ children }) {
  return (
    <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-ivory">
      {children}
    </span>
  )
}
