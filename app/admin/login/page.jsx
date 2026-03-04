'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm border border-gold-light">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <svg width="56" height="56" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="21" stroke="#C9A96E" strokeWidth="1.2" />
              <rect x="20.5" y="10" width="3" height="18" rx="1.5" fill="#C9A96E" />
              <rect x="14" y="15" width="16" height="3" rx="1.5" fill="#C9A96E" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-brown">Susy Modas</h1>
          <p className="font-sans text-xs tracking-widest uppercase text-taupe mt-1">Panneau Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gold-light rounded-lg px-4 py-2.5 font-sans text-sm text-brown outline-none focus:border-gold transition-colors"
              placeholder="admin@susymodas.fr"
              required
            />
          </div>

          <div>
            <label className="block font-sans text-xs uppercase tracking-wider text-taupe mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gold-light rounded-lg px-4 py-2.5 font-sans text-sm text-brown outline-none focus:border-gold transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-rose-deep font-sans bg-rose-deep/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-white font-sans text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-rose-deep transition-colors disabled:opacity-60"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
