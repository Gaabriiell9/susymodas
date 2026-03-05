'use client'

import { useWishlist } from '@/context/WishlistContext'
import ProductCard from '@/components/product/ProductCard'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function FavorisPage() {
    const { items } = useWishlist()

    return (
        <div className="min-h-screen bg-cream py-12 px-4 sm:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 text-center">
                    <p className="font-sans text-xs tracking-widest uppercase text-gold mb-2">Ma liste</p>
                    <h1 className="font-serif text-3xl sm:text-4xl text-brown">Mes Favoris</h1>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6 text-taupe">
                        <Heart size={48} strokeWidth={1} />
                        <p className="font-serif text-xl italic">Aucun favori pour l&apos;instant</p>
                        <p className="font-sans text-sm text-center max-w-xs">
                            Cliquez sur le sur les robes qui vous plaisent pour les retrouver ici.
                        </p>
                        <Link href="/" className="px-8 py-3 bg-gold text-white font-sans text-xs uppercase tracking-widest rounded-lg hover:bg-rose-deep transition-colors">
                            Découvrir la collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}