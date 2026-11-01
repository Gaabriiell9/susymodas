'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const KEY = 'susy_cart_v2'

// Panier conservé dans le navigateur. Prix et stock sont revérifiés par le serveur au paiement.
export function CartProvider({ children, settings }) {
  const [items, setItems] = useState([])
  const [isOpen, setOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      if (Array.isArray(saved)) setItems(saved)
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
  }, [items, ready])

  const addItem = useCallback((product, size, qty = 1) => {
    setItems((prev) => {
      const max = product.maxStock ?? 99
      const found = prev.find((i) => i.id === product.id && i.size === size)
      if (found) return prev.map((i) => (i === found ? { ...i, qty: Math.min(max, i.qty + qty), maxStock: max } : i))
      return [...prev, {
        id: product.id, slug: product.slug, name: product.name, price: product.price,
        image: product.images?.[0] ?? null, size, qty: Math.min(max, qty), maxStock: max,
      }]
    })
    setLastAdded({ name: product.name, size, at: Date.now() })
    setOpen(true)
  }, [])

  const updateQty = useCallback((id, size, qty) => {
    setItems((prev) => prev.flatMap((i) => {
      if (i.id !== id || i.size !== size) return [i]
      if (qty < 1) return []
      return [{ ...i, qty: Math.min(i.maxStock ?? 99, qty) }]
    }))
  }, [])

  const removeItem = useCallback((id, size) => setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size))), [])
  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const itemCount = items.reduce((s, i) => s + i.qty, 0)
    const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100
    return {
      items, itemCount, subtotal, ready, isOpen, lastAdded, settings,
      addItem, updateQty, removeItem, clearCart,
      openCart: () => setOpen(true), closeCart: () => setOpen(false),
    }
  }, [items, ready, isOpen, lastAdded, settings, addItem, updateQty, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return ctx
}
