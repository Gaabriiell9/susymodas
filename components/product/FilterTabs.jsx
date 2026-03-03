'use client'

import { cn } from '@/lib/utils'

export default function FilterTabs({ categories, active, onChange }) {
  return (
    /* Sur mobile : scroll horizontal. Sur desktop : flex wrap centré */
    <div className="overflow-x-auto pb-1 -mx-5 px-5 sm:mx-0 sm:px-0">
      <div
        className="flex gap-2 sm:flex-wrap sm:justify-center w-max sm:w-auto"
        role="tablist"
        aria-label="Filtrer par catégorie"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={active === cat.id}
            onClick={() => onChange(cat.id)}
            className={cn(
              'whitespace-nowrap px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border',
              'font-sans text-[0.68rem] sm:text-[0.72rem] tracking-[0.08em]',
              'uppercase transition-all duration-200 cursor-pointer flex-shrink-0',
              active === cat.id
                ? 'bg-gold border-gold text-white shadow-sm'
                : 'border-gold-light text-taupe hover:border-gold hover:text-gold bg-white'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}