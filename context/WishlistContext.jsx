'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const WishlistContext = createContext(null)

function reducer(state, action) {
    switch (action.type) {
        case 'TOGGLE': {
            const exists = state.items.find((i) => i.id === action.product.id)
            return { items: exists ? state.items.filter((i) => i.id !== action.product.id) : [...state.items, action.product] }
        }
        case 'LOAD': return { items: action.items }
        default: return state
    }
}

export function WishlistProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, { items: [] })
    const { data: session } = useSession()

    // Charger les favoris au login
    useEffect(() => {
        if (session?.user) {
            fetch('/api/wishlist')
                .then(r => r.json())
                .then(data => { if (data.items?.length) dispatch({ type: 'LOAD', items: data.items }) })
                .catch(() => { })
        } else {
            try {
                const saved = localStorage.getItem('susy_wishlist')
                if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) })
            } catch { }
        }
    }, [session])

    // Sauvegarder dans localStorage si non connecté
    useEffect(() => {
        if (!session?.user) {
            try { localStorage.setItem('susy_wishlist', JSON.stringify(state.items)) } catch { }
        }
    }, [state.items, session])

    async function toggle(product) {
        dispatch({ type: 'TOGGLE', product })
        if (session?.user) {
            const exists = state.items.find((i) => i.id === product.id)
            await fetch('/api/wishlist', {
                method: exists ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id }),
            }).catch(() => { })
        }
    }

    function isWished(id) { return state.items.some((i) => i.id === id) }

    return (
        <WishlistContext.Provider value={{ items: state.items, wishlistCount: state.items.length, toggle, isWished }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const ctx = useContext(WishlistContext)
    if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
    return ctx
}