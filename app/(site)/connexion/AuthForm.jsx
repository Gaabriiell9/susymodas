'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AuthForm({ google }) {
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/compte'
  const [mode, setMode] = useState(params.get('mode') === 'inscription' ? 'register' : 'login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [code, setCode] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(params.get('error') ? 'Connexion impossible, réessayez.' : '')
  const [info, setInfo] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function login() {
    const res = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    if (res?.error === 'EMAIL_NOT_VERIFIED') {
      await fetch('/api/auth/resend-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) })
      setMode('verify'); setInfo('Votre e-mail n\'est pas encore confirmé. Nous venons de vous renvoyer un code.')
      return
    }
    if (res?.error) { setError('E-mail ou mot de passe incorrect.'); return }
    window.location.href = callbackUrl
  }

  async function submit(e) {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      if (mode === 'login') await login()
      else if (mode === 'register') {
        const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const data = await res.json()
        if (!res.ok) setError(data.error)
        else if (data.autoVerified) await login()
        else { setMode('verify'); setInfo(`Un code à 6 chiffres a été envoyé à ${form.email}.`) }
      } else {
        const res = await fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, code }) })
        const data = await res.json()
        if (!res.ok) setError(data.error)
        else await login()
      }
    } catch {
      setError('Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const tab = (active) => cn('min-h-12 flex-1 border-b-2 font-medium transition-colors duration-short', active ? 'border-accent text-ink' : 'border-rule text-muted hover:border-ink hover:text-ink')

  return (
    <div className="grid w-full gap-12 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-5">
        <h1 className="text-display-s">{mode === 'verify' ? 'Confirmez votre e-mail' : mode === 'register' ? 'Créer un compte' : 'Bon retour'}</h1>
        <p className="lead mt-6 text-muted">
          {mode === 'verify' ? info : 'Suivez vos commandes et retrouvez vos favoris sur tous vos appareils.'}
        </p>
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
      {mode !== 'verify' && (
        <div className="flex" role="tablist" aria-label="Connexion ou inscription">
          <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => { setMode('login'); setError('') }} className={tab(mode === 'login')}>Connexion</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => { setMode('register'); setError('') }} className={tab(mode === 'register')}>Inscription</button>
        </div>
      )}

      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === 'verify' ? (
          <input
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" autoComplete="one-time-code" placeholder="000000" required
            className="field h-16 text-center font-serif text-3xl"
          />
        ) : (
          <>
            {mode === 'register' && (
              <label className="block"><span className="field-label">Prénom</span><input className="field" value={form.name} onChange={set('name')} autoComplete="given-name" required /></label>
            )}
            <label className="block"><span className="field-label">E-mail</span><input type="email" className="field" value={form.email} onChange={set('email')} autoComplete="email" required /></label>
            <label className="block">
              <span className="field-label">Mot de passe</span>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="field pr-12" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 8 : undefined} required />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute inset-y-0 right-0 px-4 text-ink-muted" aria-label="Afficher le mot de passe">
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {mode === 'register' && <span className="mt-1.5 block text-sm text-ink-muted">8 caractères minimum.</span>}
            </label>
          </>
        )}

        {error && <p className="bg-accent-soft px-3 py-2.5 text-sm text-accent">{error}</p>}

        <button type="submit" disabled={loading} className="btn-dark w-full">
          {loading ? 'Un instant…' : mode === 'login' ? 'Se connecter' : mode === 'register' ? 'Créer mon compte' : 'Valider'}
        </button>

        {mode === 'verify' && (
          <button type="button" onClick={() => fetch('/api/auth/resend-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) }).then(() => setInfo('Nouveau code envoyé.'))} className="w-full text-center text-sm text-ink-muted underline underline-offset-4">
            Renvoyer le code
          </button>
        )}
      </form>

      {google && mode !== 'verify' && (
        <>
          <div className="my-8 flex items-center gap-4 text-sm text-ink-muted"><span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" /></div>
          <button onClick={() => signIn('google', { callbackUrl })} className="btn-outline w-full">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853"/><path d="M3.96 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33z" fill="#FBBC05"/><path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continuer avec Google
          </button>
        </>
      )}
      </div>
    </div>
  )
}
