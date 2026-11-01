'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Star, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import ProductImage from '@/components/ui/ProductImage'
import { CATEGORIES, categoryLabel } from '@/lib/catalog'
import { cn, formatPrice } from '@/lib/utils'

export default function ProductsTable({ initial }) {
  const router = useRouter()
  const [products, setProducts] = useState(initial)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [filter, setFilter] = useState('')

  const shown = useMemo(() => products.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false
    if (cat && p.category !== cat) return false
    if (filter === 'hidden' && p.active) return false
    if (filter === 'out' && p.stock > 0) return false
    if (filter === 'low' && !(p.stock > 0 && p.stock <= 2)) return false
    return true
  }), [products, q, cat, filter])

  async function quick(p, changes) {
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, ...changes } : x)))
    const res = await fetch(`/api/admin/products/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quick: true, ...changes }) })
    if (!res.ok) { alert('La modification a échoué.'); router.refresh() }
  }

  async function remove(p) {
    if (!confirm(`Supprimer définitivement « ${p.name} » ? L'historique des ventes est conservé.`)) return
    const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' })
    if (res.ok) setProducts((list) => list.filter((x) => x.id !== p.id))
    else alert('La suppression a échoué.')
  }

  return (
    <div className="mt-8 border border-line bg-paper">
      <div className="flex flex-wrap gap-3 border-b border-line p-4">
        <label className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un article" className="field h-10 pl-9" />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="field h-10 w-auto">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field h-10 w-auto">
          <option value="">Tous</option>
          <option value="low">Stock faible</option>
          <option value="out">Épuisés</option>
          <option value="hidden">Masqués</option>
        </select>
      </div>

      {shown.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="text-[14px] text-ink-muted">{products.length ? 'Aucun article ne correspond.' : 'Aucun article pour le moment.'}</p>
          {!products.length && <Link href="/gestion/articles/nouveau" className="btn-dark mt-6">Ajouter mon premier article</Link>}
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((p) => (
            <li key={p.id} className={cn('flex items-center gap-4 px-4 py-3', !p.active && 'opacity-60')}>
              <Link href={`/gestion/articles/${p.id}`} className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden bg-sand">
                <ProductImage src={p.images[0]} alt={p.name} sizes="48px" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/gestion/articles/${p.id}`} className="block truncate text-[14px] hover:underline">{p.name}</Link>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {categoryLabel(p.category)} · {formatPrice(p.price)}{p.originalPrice ? <span className="ml-1 line-through">{formatPrice(p.originalPrice)}</span> : null}
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-muted">
                  {p.sizes.map((s) => `${s}: ${p.sizeStock[s] ?? 0}`).join(' · ')}
                </p>
              </div>
              <span className={cn('hidden w-24 text-right text-sm sm:block', p.stock === 0 ? 'text-sale' : p.stock <= 2 ? 'text-accent' : 'text-ink-soft')}>
                {p.stock === 0 ? 'Épuisé' : `${p.stock} en stock`}
              </span>
              <div className="flex shrink-0 items-center">
                <IconBtn title={p.featured ? 'Retirer de la sélection' : 'Mettre en avant'} onClick={() => quick(p, { featured: !p.featured })}>
                  <Star size={16} className={cn(p.featured && 'fill-gold text-gold')} />
                </IconBtn>
                <IconBtn title={p.active ? 'Masquer du site' : 'Afficher sur le site'} onClick={() => quick(p, { active: !p.active })}>
                  {p.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </IconBtn>
                <Link href={`/gestion/articles/${p.id}`} title="Modifier" className="p-2 text-ink-soft hover:text-ink"><Pencil size={16} /></Link>
                <IconBtn title="Supprimer" onClick={() => remove(p)}><Trash2 size={16} /></IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function IconBtn({ children, ...props }) {
  return <button type="button" className="p-2 text-ink-soft hover:text-ink" {...props}>{children}</button>
}
