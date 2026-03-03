'use client'

import { useState } from 'react'
import { PRODUCTS, CATEGORIES } from '@/data/products'
import FilterTabs from '@/components/product/FilterTabs'
import ProductCard from '@/components/product/ProductCard'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'

export default function ProductGrid() {
  const [activeFilter, setActiveFilter] = useState('all')

  const visible = activeFilter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeFilter)

  return (
    <section id="nouveautes" className="py-14 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <SectionHeader
          label="Nos Créations"
          title='Robes &lt;em class=&quot;text-gold&quot; style=&quot;font-style:italic&quot;&gt;Choisies avec Soin&lt;/em&gt;'
          className="mb-8 sm:mb-12"
        />

        <FilterTabs
          categories={CATEGORIES}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        {/* Grille produits */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* État vide */}
        {visible.length === 0 && (
          <p className="text-center font-serif italic text-taupe text-lg mt-16">
            Aucun modèle dans cette catégorie pour l&apos;instant.
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