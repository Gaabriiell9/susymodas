'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'

const WishlistContext = createContext(null)

function reducer(state, action) {
    switch (action.type) {
        case 'TOGGLE': {
            const exists = state.items.find((i) => i.id === action.product.id)
            return {
                items: exists
                    ? state.items.filter((i) => i.id !== action.product.id)
                    : [...state.items, action.product],
            }
        }
        case 'LOAD':
            return { items: action.items }
        default:
            return state
    }
}

export function WishlistProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, { items: [] })

    // Persist in sessionStorage
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem('susy_wishlist')
            if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) })
        } catch { }
    }, [])

    useEffect(() => {
        try { sessionStorage.setItem('susy_wishlist', JSON.stringify(state.items)) } catch { }
    }, [state.items])

    function toggle(product) { dispatch({ type: 'TOGGLE', product }) }
    function isWished(id) { return state.items.some((i) => i.id === id) }

    return (
        <WishlistContext.Provider value={{
            items: state.items,
            wishlistCount: state.items.length,
            toggle,
            isWished,
        }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const ctx = useContext(WishlistContext)
    if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
    return ctx
}