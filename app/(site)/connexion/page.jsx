'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { Eye, EyeOff } from 'lucide-react'

export default function ConnexionPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    const [mode, setMode] = useState('login') // 'login' | 'register'
    const [loading, setLoading] = useState(false)
    const [showPwd, setShowPwd] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({ name: '', email: '', password: '' })

    const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm text-brown outline-none focus:border-gold transition-colors bg-white"

    async function handleSubmit() {
        setError('')
        if (!form.email || !form.password) { setError('Veuillez remplir tous les champs.'); return }
        if (mode === 'register' && !form.name) { setError('Veuillez entrer votre prénom.'); return }

        setLoading(true)
        try {
            if (mode === 'register') {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                })
                const data = await res.json()
                if (!res.ok) { setError(data.error); setLoading(false); return }
            }

            const result = await signIn('credentials', {
                email: form.email, password: form.password, redirect: false,
            })

            if (result?.error) {
                setError('Email ou mot de passe incorrect.')
                setLoading(false)
            } else {
                router.push(callbackUrl)
            }
        } catch {
            setError('Une erreur est survenue.')
            setLoading(false)
        }
    }

    async function handleGoogle() {
        setLoading(true)
        await signIn('google', { callbackUrl })
    }

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Logo />
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Onglets */}
                    <div className="flex rounded-xl bg-beige/50 p-1 mb-6">
                        {[['login', 'Se connecter'], ['register', 'Créer un compte']].map(([key, label]) => (
                            <button key={key} onClick={() => { setMode(key); setError('') }}
                                className={`flex-1 py-2 rounded-lg font-sans text-xs font-medium transition-all ${mode === key ? 'bg-white shadow text-brown' : 'text-taupe hover:text-brown'
                                    }`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        {mode === 'register' && (
                            <div>
                                <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Prénom *</label>
                                <input className={inputClass} placeholder="Marie" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                        )}

                        <div>
                            <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Email *</label>
                            <input type="email" className={inputClass} placeholder="marie@exemple.com" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>

                        <div>
                            <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Mot de passe *</label>
                            <div className="relative">
                                <input type={showPwd ? 'text' : 'password'} className={inputClass + ' pr-10'} placeholder="••••••••" value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                                <button onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-gold">
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="font-sans text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                        <button onClick={handleSubmit} disabled={loading}
                            className="w-full bg-gold text-white py-3 rounded-xl font-sans text-sm font-medium hover:bg-rose-deep transition-colors disabled:opacity-60 mt-1">
                            {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                        </button>
                    </div>

                    {/* Séparateur */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="font-sans text-xs text-taupe">ou</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Google */}
                    <button onClick={handleGoogle} disabled={loading}
                        className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl font-sans text-sm text-brown hover:border-gold hover:bg-beige/30 transition-colors disabled:opacity-60">
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
                        </svg>
                        Continuer avec Google
                    </button>
                </div>

                <p className="text-center font-sans text-xs text-taupe mt-6">
                    En continuant, vous acceptez nos conditions d&apos;utilisation.
                </p>
            </div>
        </div>
    )
}