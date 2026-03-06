'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/ui/Logo'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { ShoppingBag, Search, Heart, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'

export default function Header() {
  const { itemCount, toggleCart } = useCart()
  const { wishlistCount } = useWishlist()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        const q = query.toLowerCase()
        const filtered = (data.products ?? []).filter(p =>
          p.name.toLowerCase().includes(q)
        )
        setResults(filtered.slice(0, 6))
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function close() {
    setSearchOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <>
      <header className={cn('sticky top-0 z-50 bg-white transition-shadow duration-300', scrolled ? 'shadow-sm' : 'border-b border-gold-light')}>
        <div className="mx-auto max-w-7xl px-4 sm:px-10 flex items-center justify-between h-16 sm:h-20">

          <Logo />

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setSearchOpen(true)} className="text-brown-light hover:text-gold transition-colors" aria-label="Rechercher">
              <Search size={20} strokeWidth={1.5} />
            </button>

            <Link href="/favoris" className="relative text-brown-light hover:text-gold transition-colors" aria-label="Favoris">
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[0.55rem] font-medium text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button onClick={toggleCart} className="relative text-brown-light hover:text-gold transition-colors" aria-label="Panier">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-deep text-[0.55rem] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay recherche */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col">
          {/* Fond sombre */}
          <div className="absolute inset-0 bg-black/40" onClick={close} />

          {/* Panneau */}
          <div className="relative z-10 bg-white shadow-2xl">
            <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
              <Search size={18} className="text-gold flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher une robe…"
                className="flex-1 font-sans text-base text-brown outline-none placeholder:text-taupe bg-transparent"
              />
              <button onClick={close} className="text-brown-light hover:text-gold transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Résultats */}
            {query.trim() && (
              <div className="mx-auto max-w-2xl px-4 pb-4 border-t border-gray-100">
                {searching ? (
                  <p className="py-6 text-center font-sans text-sm text-taupe">Recherche…</p>
                ) : results.length === 0 ? (
                  <p className="py-6 text-center font-sans text-sm text-taupe italic">Aucune robe trouvée pour &ldquo;{query}&rdquo;</p>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {results.map(p => (
                      <li key={p.id}>
                        <Link href={`/produit/${p.slug}`} onClick={close}
                          className="flex items-center gap-4 py-3 hover:bg-beige/30 rounded-xl px-2 transition-colors">
                          <div className="w-12 h-14 rounded-lg overflow-hidden bg-beige flex-shrink-0 relative">
                            {p.images?.[0]
                              ? <Image src={p.images[0]} alt={p.name} fill className="object-cover object-top" />
                              : <span className="text-xl flex items-center justify-center h-full">👗</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-sm text-brown truncate">{p.name}</p>
                            <p className="font-sans text-xs text-taupe">{p.sizes?.join(' · ')}</p>
                          </div>
                          <span className="font-serif text-sm font-medium text-brown flex-shrink-0">{formatPrice(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}