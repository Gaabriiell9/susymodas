'use client'

import { useState, useEffect } from 'react'
import FilterTabs from '@/components/product/FilterTabs'
import ProductCard from '@/components/product/ProductCard'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'

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

export default function ProductGrid() {
  const [products, setProducts] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)

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
      } catch (err) {
        console.error('Erreur chargement produits:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [activeFilter])

  return (
    <section id="nouveautes" className="py-14 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <SectionHeader
          label="Nos Créations"
          title='Robes <em class="text-gold" style="font-style:italic">Choisies avec Soin</em>'
          className="mb-8 sm:mb-12"
        />
        <FilterTabs
          categories={SIZES}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        {loading ? (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-beige animate-pulse">
                <div className="aspect-[3/4]" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-3 bg-gold-light rounded w-1/3" />
                  <div className="h-4 bg-gold-light rounded w-2/3" />
                  <div className="h-4 bg-gold-light rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <p className="text-center font-serif italic text-taupe text-lg mt-16">
            Aucune robe disponible dans cette taille pour l&apos;instant.
          </p>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Voir toute la collection →
          </Button>
        </div>
      </div>
    </section>
  )
}