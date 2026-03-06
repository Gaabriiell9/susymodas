'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/product/ProductCard'
import FilterTabs from '@/components/product/FilterTabs'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SIZES = [
    { id: 'all', label: 'Tout voir' },
    { id: 'XS', label: 'XS' },
    { id: 'S', label: 'S' },
    { id: 'M', label: 'M' },
    { id: 'L', label: 'L' },
    { id: 'XL', label: 'XL' },
    { id: '2XL', label: '2XL' },
    { id: '3XL', label: '3XL' },
]

const PER_PAGE = 8

export default function CollectionPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('all')
    const [page, setPage] = useState(1)

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true)
            try {
                const url = activeFilter === 'all'
                    ? '/api/products'
                    : `/api/products?size=${activeFilter}`
                const res = await fetch(url)
                const data = await res.json()
                setProducts(data.products ?? [])
                setPage(1)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [activeFilter])

    const totalPages = Math.ceil(products.length / PER_PAGE)
    const paginated = products.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    function goTo(n) {
        setPage(n)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-cream py-12 px-4 sm:px-10">
            <div className="mx-auto max-w-7xl">

                {/* Titre */}
                <div className="text-center mb-10">
                    <p className="font-sans text-xs tracking-widest uppercase text-gold mb-2">Nos Créations</p>
                    <h1 className="font-serif text-3xl sm:text-4xl text-brown">
                        Toute la <em className="text-gold italic">Collection</em>
                    </h1>
                </div>

                {/* Filtres tailles */}
                <FilterTabs categories={SIZES} active={activeFilter} onChange={setActiveFilter} />

                {/* Grille */}
                {loading ? (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-beige animate-pulse aspect-[3/4]" />
                        ))}
                    </div>
                ) : paginated.length === 0 ? (
                    <p className="text-center font-serif italic text-taupe text-lg mt-16">
                        Aucune robe disponible dans cette taille pour l&apos;instant.
                    </p>
                ) : (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {paginated.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-14">
                        <button onClick={() => goTo(page - 1)} disabled={page === 1}
                            className="w-9 h-9 rounded-full border border-gold-light flex items-center justify-center text-brown-light hover:border-gold hover:text-gold transition-colors disabled:opacity-30">
                            <ChevronLeft size={16} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                            const n = i + 1
                            return (
                                <button key={n} onClick={() => goTo(n)}
                                    className={`w-9 h-9 rounded-full font-sans text-sm font-medium transition-colors ${n === page
                                            ? 'bg-gold text-white'
                                            : 'border border-gold-light text-brown-light hover:border-gold hover:text-gold'
                                        }`}>
                                    {n}
                                </button>
                            )
                        })}

                        <button onClick={() => goTo(page + 1)} disabled={page === totalPages}
                            className="w-9 h-9 rounded-full border border-gold-light flex items-center justify-center text-brown-light hover:border-gold hover:text-gold transition-colors disabled:opacity-30">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {/* Indicateur page x/x */}
                {totalPages > 1 && (
                    <p className="text-center font-sans text-xs text-taupe mt-3 tracking-widest">
                        {page} / {totalPages}
                    </p>
                )}

            </div>
        </div>
    )
}