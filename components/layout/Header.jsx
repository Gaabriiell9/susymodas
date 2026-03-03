'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useCart } from '@/context/CartContext'
import { ShoppingBag, Search, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Collections',    href: '#collections' },
  { label: 'Nouveautés',     href: '#nouveautes' },
  { label: 'Occasions',      href: '#occasions' },
  { label: 'Notre Boutique', href: '#valeurs' },
  { label: 'Contact',        href: '#contact' },
]

export default function Header() {
  const { itemCount, toggleCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white transition-shadow duration-300',
        scrolled ? 'shadow-sm' : 'border-b border-gold-light'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-10 flex items-center justify-between h-16 sm:h-20">

        <Logo />

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                'relative font-sans text-[0.75rem] tracking-[0.12em] uppercase text-brown-light font-medium',
                'transition-colors duration-200 hover:text-gold',
                'after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gold',
                'after:transition-all after:duration-300 hover:after:w-full'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="text-brown-light hover:text-gold transition-colors" aria-label="Rechercher">
            <Search size={20} strokeWidth={1.5} />
          </button>

          <button
            onClick={toggleCart}
            className="relative text-brown-light hover:text-gold transition-colors"
            aria-label={`Panier — ${itemCount} article${itemCount !== 1 ? 's' : ''}`}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-deep text-[0.55rem] font-medium text-white">
                {itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden text-brown-light hover:text-gold transition-colors"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-beige bg-white px-5 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="font-sans text-sm tracking-[0.1em] uppercase text-brown-light hover:text-gold transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}