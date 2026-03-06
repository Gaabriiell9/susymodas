'use client'

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const initialState = { items: [], isOpen: false }

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id && i.size === action.payload.size)
      if (existing) {
        return {
          ...state, items: state.items.map((i) =>
            i.id === action.payload.id && i.size === action.payload.size ? { ...i, qty: i.qty + 1 } : i
          )
        }
      }
      return { ...state, items: [...state.items, { ...action.payload, qty: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) }
    case 'UPDATE_QTY': {
      const { id, qty } = action.payload
      if (qty < 1) return { ...state, items: state.items.filter((i) => i.id !== id) }
      return { ...state, items: state.items.map((i) => (i.id === id ? { ...i, qty } : i)) }
    }
    case 'CLEAR_CART': return { ...state, items: [] }
    case 'LOAD': return { ...state, items: action.items }
    case 'OPEN_CART': return { ...state, isOpen: true }
    case 'CLOSE_CART': return { ...state, isOpen: false }
    case 'TOGGLE_CART': return { ...state, isOpen: !state.isOpen }
    default: return state
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { data: session } = useSession()

  // Charger le panier au login
  useEffect(() => {
    if (session?.user) {
      fetch('/api/cart')
        .then(r => r.json())
        .then(data => {
          if (data.items?.length) dispatch({ type: 'LOAD', items: data.items })
        })
        .catch(() => { })
    } else {
      // Non connecté : charger depuis localStorage
      try {
        const saved = localStorage.getItem('susy_cart')
        if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) })
      } catch { }
    }
  }, [session])

  // Sauvegarder dans localStorage si non connecté
  useEffect(() => {
    if (!session?.user) {
      try { localStorage.setItem('susy_cart', JSON.stringify(state.items)) } catch { }
    }
  }, [state.items, session])

  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0)
  const total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0)

  const addItem = useCallback(async (p) => {
    dispatch({ type: 'ADD_ITEM', payload: p })
    if (session?.user) {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: p.id, quantity: 1, size: p.size }),
      }).catch(() => { })
    }
  }, [session])

  const removeItem = useCallback(async (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
    if (session?.user) {
      await fetch(`/api/cart?productId=${id}`, { method: 'DELETE' }).catch(() => { })
    }
  }, [session])

  const updateQty = useCallback((id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), [])
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), [])
  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), [])

  return (
    <CartContext.Provider value={{ ...state, itemCount, total, addItem, removeItem, updateQty, clearCart, openCart, closeCart, toggleCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return ctx
}