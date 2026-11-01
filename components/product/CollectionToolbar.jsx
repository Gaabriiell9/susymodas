'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { SlidersHorizontal, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const SORTS = [
  { id: 'selection', label: 'Sélection' },
  { id: 'nouveautes', label: 'Nouveautés' },
  { id: 'prix-asc', label: 'Prix croissant' },
  { id: 'prix-desc', label: 'Prix décroissant' },
]

export default function CollectionToolbar({ sizes, count }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)

  const current = {
    tri: params.get('tri') || 'selection',
    taille: params.get('taille') || '',
    dispo: params.get('dispo') === '1',
  }

  function update(changes) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(changes)) {
      if (v === '' || v === null || v === false) next.delete(k)
      else next.set(k, v === true ? '1' : v)
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  const activeCount = (current.taille ? 1 : 0) + (current.dispo ? 1 : 0)

  return (
    <>
      <div className="sticky top-[74px] z-sticky border-b border-rule bg-paper">
        <div className="shop-container flex min-h-14 items-center justify-between gap-4">
          <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 font-medium hover:text-accent">
            <SlidersHorizontal size={17} strokeWidth={1.5} aria-hidden="true" /> Filtrer{activeCount ? ` (${activeCount})` : ''}
          </button>
          <label className="flex items-center gap-3">
            <span className="hidden text-muted sm:inline">Trier par</span>
            <select
              value={current.tri}
              onChange={(e) => update({ tri: e.target.value === 'selection' ? '' : e.target.value })}
              className="field min-h-11 w-auto py-2"
              name="tri"
            >
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true" aria-label="Filtres">
          <div className="absolute inset-0 animate-fade bg-ink/40 motion-reduce:animate-none" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-full max-w-sm animate-slide-in-left flex-col bg-paper motion-reduce:animate-none">
            <div className="flex h-[72px] items-center justify-between border-b-2 border-rule-ink px-6">
              <p className="font-medium">Filtres</p>
              <button type="button" onClick={() => setOpen(false)} className="-mr-3 inline-flex h-11 w-11 items-center justify-center hover:text-accent" aria-label="Fermer les filtres"><X size={22} strokeWidth={1.5} /></button>
            </div>
            <div className="flex-1 space-y-10 overflow-y-auto px-6 py-8">
              <fieldset>
                <legend className="mb-4 font-medium">Taille</legend>
                {sizes.length ? (
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={current.taille === s}
                        onClick={() => update({ taille: current.taille === s ? '' : s })}
                        className={cn('h-12 border transition-colors duration-micro', current.taille === s ? 'border-ink bg-ink text-paper' : 'border-muted hover:bg-paper-2')}
                      >
                        {s === 'TU' ? 'Unique' : s}
                      </button>
                    ))}
                  </div>
                ) : <p className="text-muted">Aucune taille disponible.</p>}
              </fieldset>
              <fieldset>
                <legend className="mb-4 font-medium">Disponibilité</legend>
                <button type="button" aria-pressed={current.dispo} onClick={() => update({ dispo: !current.dispo })} className="inline-flex min-h-11 items-center gap-3">
                  <span className={cn('flex h-5 w-5 items-center justify-center border', current.dispo ? 'border-ink bg-ink text-paper' : 'border-muted')}>
                    {current.dispo && <Check size={13} aria-hidden="true" />}
                  </span>
                  En stock uniquement
                </button>
              </fieldset>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-rule p-6">
              <button type="button" onClick={() => update({ taille: '', dispo: false })} className="btn-outline">Effacer</button>
              <button type="button" onClick={() => setOpen(false)} className="btn-primary">Voir {count}</button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
