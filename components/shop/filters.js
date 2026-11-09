// Filtres de la vitrine, lus depuis l'URL (?categorie=robes&taille=M&prix=50-100&dispo=1&promo=1&tri=prix-asc&q=...)
import { CATEGORIES } from '@/lib/catalog'

export const PRICE_RANGES = [
  { id: '0-50', label: 'Moins de 50 €', min: 0, max: 50 },
  { id: '50-100', label: 'De 50 à 100 €', min: 50, max: 100 },
  { id: '100-plus', label: 'Plus de 100 €', min: 100, max: null },
]

export const SORTS = [
  { id: 'selection', label: 'Pertinence' },
  { id: 'nouveautes', label: 'Nouveautés' },
  { id: 'prix-asc', label: 'Prix croissant' },
  { id: 'prix-desc', label: 'Prix décroissant' },
]

export function parseFilters(sp = {}) {
  const pick = (k) => (typeof sp[k] === 'string' ? sp[k] : '')
  const categorie = CATEGORIES.some((c) => c.id === pick('categorie')) ? pick('categorie') : ''
  const prix = PRICE_RANGES.some((r) => r.id === pick('prix')) ? pick('prix') : ''
  const tri = SORTS.some((s) => s.id === pick('tri')) ? pick('tri') : 'selection'
  return {
    categorie,
    taille: pick('taille').slice(0, 6),
    prix,
    tri,
    dispo: pick('dispo') === '1',
    promo: pick('promo') === '1',
    q: pick('q').slice(0, 60),
  }
}

export function titleFor(f) {
  if (f.q) return `Résultats pour « ${f.q} »`
  if (f.promo) return 'Promotions'
  const cat = CATEGORIES.find((c) => c.id === f.categorie)
  if (cat) return cat.label
  if (f.tri === 'nouveautes') return 'Nouveautés'
  return 'Toute la boutique'
}
