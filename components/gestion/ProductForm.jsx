'use client'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ImagePlus, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { CATEGORIES, sortSizes } from '@/lib/catalog'
import { cn, formatPrice } from '@/lib/utils'

const PRESETS = [
  { label: 'Femme', sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
  { label: 'Taille unique', sizes: ['TU'] },
  { label: 'Enfant', sizes: ['2A', '4A', '6A', '8A', '10A', '12A'] },
]

// Réduit les photos avant envoi (les photos de téléphone font souvent plus de 5 Mo)
async function compress(file, max = 1800, quality = 0.86) {
  if (!file.type.startsWith('image/')) return file
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', quality))
  if (!blob) return file
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
}

export default function ProductForm({ product }) {
  const router = useRouter()
  const isEdit = !!product
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? 'robes',
    price: product?.price ?? '',
    originalPrice: product?.originalPrice ?? '',
    description: product?.description ?? '',
    colors: product?.colors?.join(', ') ?? '',
    tags: product?.tags?.join(', ') ?? '',
    featured: product?.featured ?? false,
    active: product?.active ?? true,
  })
  const [images, setImages] = useState(product?.images ?? [])
  const [stock, setStock] = useState(() => product?.sizeStock && Object.keys(product.sizeStock).length ? { ...product.sizeStock } : { S: 0, M: 0, L: 0, XL: 0 })
  const [newSize, setNewSize] = useState('')
  const [uploading, setUploading] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const sizes = sortSizes(Object.keys(stock))
  const total = Object.values(stock).reduce((a, b) => a + (parseInt(b, 10) || 0), 0)

  async function onFiles(e) {
    const files = [...(e.target.files ?? [])].slice(0, 10 - images.length)
    e.target.value = ''
    if (!files.length) return
    setError('')
    setUploading(files.length)
    for (const f of files) {
      try {
        const body = new FormData()
        body.append('files', await compress(f))
        const res = await fetch('/api/admin/upload', { method: 'POST', body })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setImages((list) => [...list, ...data.urls])
      } catch (err) {
        setError(`Photo « ${f.name} » : ${err.message || 'envoi impossible'}`)
      }
      setUploading((n) => n - 1)
    }
  }

  const move = (i, dir) => setImages((list) => {
    const next = [...list]
    const j = i + dir
    if (j < 0 || j >= next.length) return list
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  })

  function applyPreset(list) {
    setStock(Object.fromEntries(list.map((s) => [s, stock[s] ?? 0])))
  }

  function addSize() {
    const s = newSize.trim().toUpperCase()
    if (s && stock[s] === undefined) setStock((st) => ({ ...st, [s]: 0 }))
    setNewSize('')
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    if (uploading) { setError('Attendez la fin de l\'envoi des photos.'); return }
    setSaving(true)
    const payload = {
      ...form,
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      images,
      sizeStock: stock,
    }
    const res = await fetch(isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Enregistrement impossible.'); return }
    router.push('/gestion/articles')
    router.refresh()
  }

  const discount = form.originalPrice && form.price && Number(form.originalPrice) > Number(form.price)
    ? Math.round((1 - form.price / form.originalPrice) * 100) : 0

  return (
    <form onSubmit={save}>
      <Link href="/gestion/articles" className="inline-flex items-center gap-2 text-[12px] uppercase tracking-label text-ink-muted hover:text-ink"><ArrowLeft size={14} /> Articles</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-4xl font-light">{isEdit ? 'Modifier l\'article' : 'Nouvel article'}</h1>
        <div className="flex gap-2">
          {isEdit && product.active && <a href={`/produit/${product.slug}`} target="_blank" rel="noreferrer" className="btn-ghost bg-white">Voir sur le site</a>}
          <button type="submit" disabled={saving || uploading > 0} className="btn-dark">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>

      {error && <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-sale">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Photos" hint="La première photo est l'image principale. La deuxième s'affiche au survol.">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((src, i) => (
                <div key={src} className="group relative aspect-[3/4] overflow-hidden bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-1.5 top-1.5 bg-ink px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ivory">Principale</span>}
                  <button type="button" onClick={() => setImages((l) => l.filter((x) => x !== src))} className="absolute right-1.5 top-1.5 bg-white/90 p-1" aria-label="Retirer la photo"><X size={14} /></button>
                  <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="bg-white/90 p-1 disabled:opacity-0" aria-label="Avancer"><ChevronLeft size={14} /></button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="bg-white/90 p-1 disabled:opacity-0" aria-label="Reculer"><ChevronRight size={14} /></button>
                  </div>
                </div>
              ))}
              {Array.from({ length: uploading }).map((_, i) => (
                <div key={`up-${i}`} className="flex aspect-[3/4] items-center justify-center bg-sand"><Loader2 size={20} className="animate-spin text-ink-muted" /></div>
              ))}
              {images.length + uploading < 10 && (
                <button type="button" onClick={() => fileRef.current?.click()} className="flex aspect-[3/4] flex-col items-center justify-center gap-2 border border-dashed border-ink-muted/50 text-ink-muted transition hover:border-ink hover:text-ink">
                  <ImagePlus size={22} strokeWidth={1.3} />
                  <span className="text-[11px] uppercase tracking-wider">Ajouter</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
          </Card>

          <Card title="Informations">
            <div className="space-y-4">
              <Label text="Nom de l'article"><input className="field" value={form.name} onChange={set('name')} placeholder="Ex : Robe Lumière du Matin" required /></Label>
              <Label text="Description"><textarea className="field h-36 py-3" value={form.description} onChange={set('description')} placeholder="Coupe, matière, longueur, conseils de taille..." /></Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Label text="Coloris (séparés par des virgules)"><input className="field" value={form.colors} onChange={set('colors')} placeholder="Rose poudré, Blanc" /></Label>
                <Label text="Mots-clés (facultatif)"><input className="field" value={form.tags} onChange={set('tags')} placeholder="mariage, lin, été" /></Label>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Visibilité">
            <Toggle checked={form.active} onChange={set('active')} label="Visible sur la boutique" hint="Décochez pour masquer l'article sans le supprimer." />
            <Toggle checked={form.featured} onChange={set('featured')} label="Mettre en avant" hint="Apparaît dans « La sélection de Susy » sur l'accueil." />
          </Card>

          <Card title="Prix et catégorie">
            <div className="space-y-4">
              <Label text="Catégorie">
                <select className="field" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Label text="Prix de vente (€)"><input type="number" step="0.01" min="0" className="field" value={form.price} onChange={set('price')} required /></Label>
                <Label text="Prix barré (€)"><input type="number" step="0.01" min="0" className="field" value={form.originalPrice} onChange={set('originalPrice')} placeholder="Promo" /></Label>
              </div>
              {discount > 0 && <p className="text-[13px] text-sale">Promotion de -{discount}% : affiché {formatPrice(form.price)} au lieu de {formatPrice(form.originalPrice)}</p>}
            </div>
          </Card>

          <Card title="Tailles et stock" hint={`${total} pièce(s) au total`}>
            <div className="mb-4 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => applyPreset(p.sizes)} className="border border-line px-3 py-1.5 text-[12px] hover:border-ink">{p.label}</button>
              ))}
            </div>
            <div className="space-y-2">
              {sizes.map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-20 text-[14px]">{s === 'TU' ? 'Unique' : s}</span>
                  <input
                    type="number" min="0" inputMode="numeric" value={stock[s]}
                    onChange={(e) => setStock((st) => ({ ...st, [s]: e.target.value }))}
                    className={cn('field h-10 flex-1', !(parseInt(stock[s], 10) > 0) && 'text-ink-muted')}
                  />
                  <button type="button" onClick={() => setStock((st) => { const n = { ...st }; delete n[s]; return n })} className="p-2 text-ink-muted hover:text-sale" aria-label={`Retirer ${s}`}><X size={15} /></button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={newSize} onChange={(e) => setNewSize(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize() } }} placeholder="Autre taille (ex : 38)" className="field h-10 flex-1" />
              <button type="button" onClick={addSize} className="btn-ghost h-10 bg-white px-4">Ajouter</button>
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}

function Card({ title, hint, children }) {
  return (
    <section className="border border-line bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[12px] uppercase tracking-label">{title}</h2>
        {hint && <p className="text-right text-[12px] text-ink-muted">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function Label({ text, children }) {
  return <label className="block"><span className="field-label">{text}</span>{children}</label>
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-2">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-line transition peer-checked:bg-ink after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
      <span><span className="block text-[14px]">{label}</span>{hint && <span className="block text-[12px] text-ink-muted">{hint}</span>}</span>
    </label>
  )
}
