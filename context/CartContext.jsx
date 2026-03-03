'use client'

import { createContext, useContext, useReducer, useCallback } from 'react'

const initialState = {
  items: [],
  isOpen: false,
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
          ),
        }
      }
      return { ...state, items: [...state.items, { ...action.payload, qty: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) }

    case 'UPDATE_QTY': {
      const { id, qty } = action.payload
      if (qty < 1) return { ...state, items: state.items.filter((i) => i.id !== id) }
      return {
        ...state,
        items: state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
      }
    }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    default:
      return state
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0)
  const total     = state.items.reduce((sum, i) => sum + i.price * i.qty, 0)

  const addItem    = useCallback((p)       => dispatch({ type: 'ADD_ITEM',    payload: p }),         [])
  const removeItem = useCallback((id)      => dispatch({ type: 'REMOVE_ITEM', payload: id }),        [])
  const updateQty  = useCallback((id, qty) => dispatch({ type: 'UPDATE_QTY',  payload: { id, qty } }), [])
  const clearCart  = useCallback(()        => dispatch({ type: 'CLEAR_CART' }),                      [])
  const openCart   = useCallback(()        => dispatch({ type: 'OPEN_CART' }),                       [])
  const closeCart  = useCallback(()        => dispatch({ type: 'CLOSE_CART' }),                      [])
  const toggleCart = useCallback(()        => dispatch({ type: 'TOGGLE_CART' }),                     [])

  return (
    <CartContext.Provider
      value={{ ...state, itemCount, total, addItem, removeItem, updateQty, clearCart, openCart, closeCart, toggleCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return ctx
}
