'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

const WishlistContext = createContext(null)
const KEY = 'susy_wishlist_v2'

// Favoris : dans le navigateur, et synchronisés avec le compte une fois connecté
export function WishlistProvider({ children }) {
  const { data: session, status } = useSession()
  const [items, setItems] = useState([])
  const merged = useRef(false)

  useEffect(() => {
    if (status === 'loading') return
    let local = []
    try { local = JSON.parse(localStorage.getItem(KEY) || '[]') } catch {}
    if (!session?.user) { setItems(local); merged.current = false; return }

    const sync = async () => {
      if (!merged.current && local.length) {
        await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: local.map((p) => p.id) }) }).catch(() => {})
        localStorage.removeItem(KEY)
      }
      merged.current = true
      const data = await fetch('/api/wishlist').then((r) => r.json()).catch(() => ({ items: [] }))
      setItems(data.items ?? [])
    }
    sync()
  }, [session?.user, status])

  const toggle = useCallback(async (product) => {
    const exists = items.some((i) => i.id === product.id)
    const next = exists ? items.filter((i) => i.id !== product.id) : [...items, product]
    setItems(next)
    if (session?.user) {
      await fetch('/api/wishlist', {
        method: exists ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      }).catch(() => {})
    } else {
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
    }
  }, [items, session?.user])

  const isWished = useCallback((id) => items.some((i) => i.id === id), [items])

  return (
    <WishlistContext.Provider value={{ items, count: items.length, toggle, isWished }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist doit être utilisé dans <WishlistProvider>')
  return ctx
}
