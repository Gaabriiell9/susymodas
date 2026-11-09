'use client'
import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import ShopFilters from '@/components/shop/ShopFilters'
import { SORTS, PRICE_RANGES } from '@/components/shop/filters'
import { useFilterUrl } from '@/components/shop/useFilterUrl'
import { CATEGORIES } from '@/lib/catalog'

// Barre de tri + filtres actifs (et tiroir de filtres sur mobile)
export default function ShopToolbar({ sizes, counts, count }) {
  const { get, update } = useFilterUrl()
  const [open, setOpen] = useState(false)
  const chips = [
    get('categorie') && { k: 'categorie', label: CATEGORIES.find((c) => c.id === get('categorie'))?.label },
    get('taille') && { k: 'taille', label: `Taille ${get('taille')}` },
    get('prix') && { k: 'prix', label: PRICE_RANGES.find((r) => r.id === get('prix'))?.label },
    get('dispo') === '1' && { k: 'dispo', label: 'En stock' },
    get('promo') === '1' && { k: 'promo', label: 'En promotion' },
    get('q') && { k: 'q', label: `« ${get('q')} »` },
  ].filter(Boolean)

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-y border-rule py-3">
        <button type="button" onClick={() => setOpen(true)} className="btn-outline min-h-10 px-4 text-sm lg:hidden">
          <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden="true" /> Filtrer{chips.length ? ` (${chips.length})` : ''}
        </button>
        <ul className="hidden flex-1 flex-wrap gap-2 lg:flex" aria-label="Filtres actifs">
          {chips.map((c) => (
            <li key={c.k}>
              <button type="button" onClick={() => update({ [c.k]: '' })} className="inline-flex min-h-8 items-center gap-1.5 bg-paper-2 px-3 text-sm hover:bg-paper-3" aria-label={`Retirer le filtre ${c.label}`}>
                {c.label} <X size={13} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-muted">Trier par</span>
          <select name="tri" value={get('tri') || 'selection'} onChange={(e) => update({ tri: e.target.value === 'selection' ? '' : e.target.value })} className="field min-h-10 w-auto py-1.5 text-sm">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {open && (
        <div className="fixed inset-0 z-modal lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres">
          <div className="absolute inset-0 animate-fade bg-ink/40 motion-reduce:animate-none" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-full max-w-sm animate-slide-in-left flex-col bg-paper motion-reduce:animate-none">
            <div className="flex h-16 items-center justify-between border-b border-rule-ink px-5">
              <p className="font-semibold">Filtres</p>
              <button type="button" onClick={() => setOpen(false)} className="-mr-2 inline-flex h-11 w-11 items-center justify-center" aria-label="Fermer les filtres"><X size={22} strokeWidth={1.5} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6"><ShopFilters sizes={sizes} counts={counts} /></div>
            <div className="border-t border-rule p-5">
              <button type="button" onClick={() => setOpen(false)} className="btn-primary w-full">Voir les {count} article{count > 1 ? 's' : ''}</button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
