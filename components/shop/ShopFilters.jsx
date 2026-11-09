'use client'
import { Check } from 'lucide-react'
import { CATEGORIES } from '@/lib/catalog'
import { PRICE_RANGES } from '@/components/shop/filters'
import { useFilterUrl } from '@/components/shop/useFilterUrl'
import { cn } from '@/lib/utils'

export default function ShopFilters({ sizes, counts }) {
  const { get, update } = useFilterUrl()
  const cat = get('categorie')
  const taille = get('taille')
  const prix = get('prix')
  const dispo = get('dispo') === '1'
  const promo = get('promo') === '1'
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const active = [cat, taille, prix].filter(Boolean).length + (dispo ? 1 : 0) + (promo ? 1 : 0)

  const row = (on) => cn('flex w-full min-h-9 items-center justify-between gap-3 px-3 text-left transition-colors duration-micro', on ? 'bg-ink font-medium text-paper' : 'hover:bg-paper-2')

  return (
    <div className="space-y-6">
      <Group title="Catégories">
        <ul className="space-y-0.5">
          <li><button type="button" onClick={() => update({ categorie: '', taille: '' })} className={row(!cat)} aria-pressed={!cat}><span>Tout voir</span><span className="text-sm tabular-nums opacity-70">{total || ''}</span></button></li>
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => update({ categorie: cat === c.id ? '' : c.id, taille: '' })} className={row(cat === c.id)} aria-pressed={cat === c.id}>
                <span>{c.label}</span>
                <span className="text-sm tabular-nums opacity-70">{counts[c.id] ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Taille">
        {sizes.length ? (
          <div className="grid grid-cols-4 gap-1.5">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={taille === s}
                onClick={() => update({ taille: taille === s ? '' : s })}
                className={cn('h-9 border text-sm transition-colors duration-micro', taille === s ? 'border-ink bg-ink text-paper' : 'border-muted hover:bg-paper-2')}
              >
                {s === 'TU' ? 'Unique' : s}
              </button>
            ))}
          </div>
        ) : <p className="text-sm text-muted">Aucune taille pour le moment.</p>}
      </Group>

      <Group title="Prix">
        <ul className="space-y-0.5">
          {PRICE_RANGES.map((r) => (
            <li key={r.id}><Toggle on={prix === r.id} onClick={() => update({ prix: prix === r.id ? '' : r.id })}>{r.label}</Toggle></li>
          ))}
        </ul>
      </Group>

      <Group title="Affiner">
        <ul className="space-y-0.5">
          <li><Toggle on={dispo} onClick={() => update({ dispo: !dispo })}>En stock uniquement</Toggle></li>
          <li><Toggle on={promo} onClick={() => update({ promo: !promo })}><span className="text-accent">En promotion</span></Toggle></li>
        </ul>
      </Group>

      {active > 0 && (
        <button type="button" onClick={() => update({ categorie: '', taille: '', prix: '', dispo: false, promo: false })} className="link text-sm">
          Effacer les filtres ({active})
        </button>
      )}
    </div>
  )
}

function Group({ title, children }) {
  return (
    <fieldset>
      <legend className="mb-3 w-full border-b border-rule-ink pb-2 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  )
}

function Toggle({ on, onClick, children }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="flex min-h-9 w-full items-center gap-3 px-3 text-left hover:bg-paper-2">
      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center border', on ? 'border-ink bg-ink text-paper' : 'border-muted')}>
        {on && <Check size={13} aria-hidden="true" />}
      </span>
      {children}
    </button>
  )
}
