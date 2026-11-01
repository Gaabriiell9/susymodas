'use client'
import { useState } from 'react'

export default function SettingsForm({ initial }) {
  const [s, setS] = useState({ ...initial, freeShippingThreshold: initial.freeShippingThreshold ?? '' })
  const [state, setState] = useState('idle')
  const set = (k) => (e) => { setS((v) => ({ ...v, [k]: e.target.value })); setState('idle') }

  async function save(e) {
    e.preventDefault()
    setState('saving')
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
    setState(res.ok ? 'saved' : 'error')
  }

  return (
    <form onSubmit={save} className="mt-8 max-w-2xl space-y-6">
      <section className="space-y-4 border border-line bg-white p-6">
        <h2 className="text-[12px] uppercase tracking-label">Livraison à domicile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <L t="Frais de livraison (€)"><input type="number" step="0.01" min="0" className="field" value={s.shippingCost} onChange={set('shippingCost')} required /></L>
          <L t="Offerte à partir de (€)"><input type="number" step="0.01" min="0" className="field" value={s.freeShippingThreshold} onChange={set('freeShippingThreshold')} placeholder="Vide = jamais offerte" /></L>
        </div>
        <p className="text-[12px] text-ink-muted">Le retrait en boutique est toujours gratuit.</p>
      </section>

      <section className="space-y-4 border border-line bg-white p-6">
        <h2 className="text-[12px] uppercase tracking-label">Boutique physique</h2>
        <L t="Adresse"><input className="field" value={s.storeAddress} onChange={set('storeAddress')} required /></L>
        <L t="Horaires"><input className="field" value={s.storeHours} onChange={set('storeHours')} /></L>
        <L t="Numéro WhatsApp (avec indicatif, ex : 594694029596)"><input className="field" value={s.whatsapp} onChange={set('whatsapp')} inputMode="numeric" /></L>
      </section>

      <section className="space-y-4 border border-line bg-white p-6">
        <h2 className="text-[12px] uppercase tracking-label">Bandeau d&apos;annonce</h2>
        <L t="Texte affiché tout en haut du site (vide = masqué)"><input className="field" value={s.announcement} onChange={set('announcement')} maxLength={160} /></L>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={state === 'saving'} className="btn-dark">{state === 'saving' ? 'Enregistrement...' : 'Enregistrer'}</button>
        {state === 'saved' && <p className="text-[13px] text-emerald-700">Réglages enregistrés.</p>}
        {state === 'error' && <p className="text-[13px] text-sale">Erreur, réessayez.</p>}
      </div>
    </form>
  )
}

function L({ t, children }) {
  return <label className="block"><span className="field-label">{t}</span>{children}</label>
}
