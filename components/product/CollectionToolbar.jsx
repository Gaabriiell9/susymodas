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
      <div className="sticky top-16 z-30 border-y border-line bg-ivory/95 backdrop-blur lg:top-[76px]">
        <div className="shop-container flex h-12 items-center justify-between gap-4">
          <button onClick={() => setOpen(true)} className="label flex items-center gap-2">
            <SlidersHorizontal size={15} strokeWidth={1.4} /> Filtrer{activeCount ? ` (${activeCount})` : ''}
          </button>
          <p className="hidden text-[13px] text-ink-muted sm:block">{count} article{count > 1 ? 's' : ''}</p>
          <label className="flex items-center gap-2">
            <span className="label hidden text-ink-muted sm:inline">Trier</span>
            <select
              value={current.tri}
              onChange={(e) => update({ tri: e.target.value === 'selection' ? '' : e.target.value })}
              className="cursor-pointer bg-transparent text-[13px] outline-none"
            >
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 animate-fade bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-full max-w-sm animate-slide-in-left flex-col bg-ivory">
            <div className="flex h-16 items-center justify-between border-b border-line px-6">
              <p className="label">Filtres</p>
              <button onClick={() => setOpen(false)} className="-mr-2 p-2" aria-label="Fermer"><X size={22} strokeWidth={1.3} /></button>
            </div>
            <div className="flex-1 space-y-10 overflow-y-auto px-6 py-8">
              <div>
                <p className="label mb-4">Taille</p>
                {sizes.length ? (
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => update({ taille: current.taille === s ? '' : s })}
                        className={cn('h-11 border text-[13px] transition', current.taille === s ? 'border-ink bg-ink text-ivory' : 'border-line hover:border-ink')}
                      >
                        {s === 'TU' ? 'Unique' : s}
                      </button>
                    ))}
                  </div>
                ) : <p className="text-[13px] text-ink-muted">Aucune taille disponible.</p>}
              </div>
              <div>
                <p className="label mb-4">Disponibilité</p>
                <button onClick={() => update({ dispo: !current.dispo })} className="flex items-center gap-3 text-[14px]">
                  <span className={cn('flex h-5 w-5 items-center justify-center border', current.dispo ? 'border-ink bg-ink text-ivory' : 'border-ink-muted')}>
                    {current.dispo && <Check size={13} />}
                  </span>
                  En stock uniquement
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-line p-6">
              <button onClick={() => update({ taille: '', dispo: false })} className="btn-ghost">Effacer</button>
              <button onClick={() => setOpen(false)} className="btn-dark">Voir ({count})</button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
