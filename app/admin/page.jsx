'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { uploadProductImage, deleteProductImage } from '@/lib/supabase'
import Image from 'next/image'

const CATEGORIES = [
  { id: 'eglise', label: 'Église' },
  { id: 'ceremonie', label: 'Cérémonies' },
  { id: 'quotidien', label: 'Quotidien' },
  { id: 'enfant', label: 'Enfants' },
]

const emptyForm = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'eglise', tags: [], sizes: [], colors: [],
  stock: '', active: true, images: [],
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    const res = await fetch('/api/products?active=false')
    const data = await res.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(emptyForm)
    setSelected(null)
    setModal('create')
  }

  function openEdit(product) {
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      originalPrice: product.originalPrice ?? '',
      category: product.category,
      tags: product.tags,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      active: product.active,
      images: product.images ?? [],
    })
    setSelected(product)
    setModal('edit')
  }

  // ── Upload photo ────────────────────────────────────────────────────────────
  async function handleImageUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setUploading(true)
    try {
      const slug = form.name
        ? form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : `product-${Date.now()}`

      const urls = await Promise.all(files.map((f) => uploadProductImage(f, slug)))
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
    } catch (err) {
      alert('Erreur upload : ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  async function removeImage(url) {
    try {
      await deleteProductImage(url)
      setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }))
    } catch {
      setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }))
    }
  }

  async function handleSave() {
    setSaving(true)
    const url = modal === 'edit' ? `/api/products/${selected.id}` : '/api/products'
    const method = modal === 'edit' ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setModal(false)
    setSaving(false)
    fetchProducts()
  }

  async function toggleActive(product) {
    await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !product.active }),
    })
    fetchProducts()
  }

  async function handleDelete(id) {
    if (!confirm('Désactiver ce produit ?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm text-brown outline-none focus:border-gold transition-colors"

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl text-brown">Produits</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-lg font-sans text-sm hover:bg-rose-deep transition-colors">
          <Plus size={16} /> Ajouter un produit
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-400 font-sans text-sm">Chargement…</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                {['Photo', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 font-sans text-xs uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  {/* Photo */}
                  <td className="px-4 py-3">
                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-beige flex items-center justify-center flex-shrink-0">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} width={48} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-xl">👗</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-serif text-sm text-brown">{p.name}</p>
                    {p.tags.length > 0 && <span className="text-[0.6rem] uppercase tracking-wider text-gold">{p.tags.join(', ')}</span>}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-gray-500 capitalize">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className="font-sans text-sm font-medium">{formatPrice(p.price)}</span>
                    {p.originalPrice && <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(p.originalPrice)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-sans text-sm ${p.stock <= 3 ? 'text-red-500 font-medium' : 'text-gray-600'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-sans ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.active ? 'Actif' : 'Masqué'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-gold transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => toggleActive(p)} className="text-gray-400 hover:text-blue-500 transition-colors">{p.active ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                      <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-serif text-xl text-brown mb-6">
              {modal === 'create' ? 'Nouveau produit' : 'Modifier le produit'}
            </h2>

            <div className="space-y-4">

              {/* ── Zone photos ── */}
              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-2">Photos</label>

                {/* Photos existantes */}
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative w-20 h-24 rounded-lg overflow-hidden group">
                        <Image src={url} alt="" fill className="object-cover" />
                        <button
                          onClick={() => removeImage(url)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bouton upload */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 border border-dashed border-gold-light rounded-lg px-4 py-3 text-taupe hover:border-gold hover:text-gold transition-colors font-sans text-sm w-full justify-center"
                >
                  <Upload size={16} />
                  {uploading ? 'Upload en cours…' : 'Ajouter des photos'}
                </button>
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1">Nom *</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1">Description</label>
                <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1">Prix (€) *</label>
                  <input type="number" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1">Prix barré (€)</label>
                  <input type="number" className={inputClass} value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1">Catégorie *</label>
                  <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1">Stock</label>
                  <input type="number" className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1">Tailles (séparées par virgule)</label>
                <input className={inputClass} value={form.sizes.join(', ')} onChange={(e) => setForm({ ...form, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="S, M, L, XL, 2XL" />
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1">Couleurs (séparées par virgule)</label>
                <input className={inputClass} value={form.colors.join(', ')} onChange={(e) => setForm({ ...form, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Rose poudré, Blanc" />
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1">Tags (nouveau, exclusif, promo)</label>
                <input className={inputClass} value={form.tags.join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded border-gray-300" />
                <span className="font-sans text-sm text-gray-600">Produit visible sur le site</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg font-sans text-sm hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-gold text-white py-2.5 rounded-lg font-sans text-sm hover:bg-rose-deep transition-colors disabled:opacity-60">
                {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}