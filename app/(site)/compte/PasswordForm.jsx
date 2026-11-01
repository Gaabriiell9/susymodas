'use client'
import { useState } from 'react'

export default function PasswordForm() {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ current: '', next: '' })
  const [msg, setMsg] = useState(null)
  async function submit(e) {
    e.preventDefault()
    const res = await fetch('/api/account/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
    const data = await res.json()
    setMsg(res.ok ? { ok: true, t: 'Mot de passe modifié.' } : { ok: false, t: data.error })
    if (res.ok) setF({ current: '', next: '' })
  }
  if (!open) return <button onClick={() => setOpen(true)} className="text-[13px] text-ink-muted underline underline-offset-4 hover:text-ink">Changer mon mot de passe</button>
  return (
    <form onSubmit={submit} className="grid max-w-xl gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="block"><span className="field-label">Mot de passe actuel</span><input type="password" className="field" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} autoComplete="current-password" /></label>
      <label className="block"><span className="field-label">Nouveau</span><input type="password" className="field" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} minLength={8} autoComplete="new-password" required /></label>
      <button className="btn-dark">Valider</button>
      {msg && <p className={`text-[13px] sm:col-span-3 ${msg.ok ? 'text-emerald-700' : 'text-sale'}`}>{msg.t}</p>}
    </form>
  )
}
