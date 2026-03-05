'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { ShoppingBag, Search, Menu, X, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const { itemCount, toggleCart } = useCart()
  const { wishlistCount } = useWishlist()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn('sticky top-0 z-50 bg-white transition-shadow duration-300', scrolled ? 'shadow-sm' : 'border-b border-gold-light')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-10 flex items-center justify-between h-16 sm:h-20">

        <Logo />

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="text-brown-light hover:text-gold transition-colors" aria-label="Rechercher">
            <Search size={20} strokeWidth={1.5} />
          </button>

          {/* Favoris */}
          <Link href="/favoris" className="relative text-brown-light hover:text-gold transition-colors" aria-label="Favoris">
            <Heart size={20} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[0.55rem] font-medium text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Panier */}
          <button onClick={toggleCart} className="relative text-brown-light hover:text-gold transition-colors" aria-label="Panier">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-deep text-[0.55rem] font-medium text-white">
                {itemCount}
              </span>
            )}
          </button>

          <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden text-brown-light hover:text-gold transition-colors">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-beige bg-white px-5 py-4 flex flex-col gap-4">
          <Link href="/favoris" onClick={() => setMobileOpen(false)}
            className="font-sans text-sm tracking-[0.1em] uppercase text-brown-light hover:text-gold transition-colors flex items-center gap-2">
            <Heart size={14} /> Mes Favoris {wishlistCount > 0 && `(${wishlistCount})`}
          </Link>
        </nav>
      )}
    </header>
  )
}