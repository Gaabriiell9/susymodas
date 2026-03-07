'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { Eye, EyeOff, Mail } from 'lucide-react'

function ConnexionForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    const modeParam = searchParams.get('mode')
    const [mode, setMode] = useState(modeParam === 'register' ? 'register' : 'login')

    const [loading, setLoading] = useState(false)
    const [showPwd, setShowPwd] = useState(false)
    const [showConfirmPwd, setShowConfirmPwd] = useState(false)
    const [error, setError] = useState('')
    const [verifyCode, setVerifyCode] = useState('')
    const [verifyError, setVerifyError] = useState('')
    const [resendCooldown, setResendCooldown] = useState(0)
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

    const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm text-brown outline-none focus:border-gold transition-all duration-200 bg-white placeholder:text-gray-300"

    // Force du mot de passe
    function getPasswordStrength(pwd) {
        if (!pwd) return null
        if (pwd.length < 6) return { label: 'Trop court', color: 'bg-red-400', width: 'w-1/4' }
        if (pwd.length < 8) return { label: 'Faible', color: 'bg-orange-400', width: 'w-2/4' }
        if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Moyen', color: 'bg-yellow-400', width: 'w-3/4' }
        return { label: 'Fort', color: 'bg-green-400', width: 'w-full' }
    }

    const strength = mode === 'register' ? getPasswordStrength(form.password) : null
    const passwordsMatch = form.confirmPassword === '' ? null : form.password === form.confirmPassword

    function startCooldown() {
        setResendCooldown(30)
        const interval = setInterval(() => {
            setResendCooldown(v => {
                if (v <= 1) { clearInterval(interval); return 0 }
                return v - 1
            })
        }, 1000)
    }

    async function handleSubmit() {
        setError('')
        if (!form.email || !form.password) { setError('Veuillez remplir tous les champs.'); return }
        if (mode === 'register') {
            if (!form.name) { setError('Veuillez entrer votre prénom.'); return }
            if (form.password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return }
            if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return }
        }
        setLoading(true)
        try {
            if (mode === 'register') {
                const res = await fetch('/api/auth/register', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
                })
                const data = await res.json()
                if (!res.ok) { setError(data.error); setLoading(false); return }
                setLoading(false)
                startCooldown()
                setMode('verify')
                return
            }
            const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
            if (result?.error) { setError('Email ou mot de passe incorrect.'); setLoading(false) }
            else router.push(callbackUrl)
        } catch {
            setError('Une erreur est survenue.')
            setLoading(false)
        }
    }

    async function handleVerify() {
        setVerifyError('')
        if (!verifyCode || verifyCode.length < 4) { setVerifyError('Veuillez entrer le code reçu.'); return }
        setLoading(true)
        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, code: verifyCode }),
            })
            const data = await res.json()
            if (!res.ok) { setVerifyError(data.error || 'Code incorrect.'); setLoading(false); return }
            const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
            if (result?.error) { setVerifyError('Vérification réussie, mais connexion échouée. Réessayez.'); setLoading(false) }
            else router.push(callbackUrl)
        } catch {
            setVerifyError('Une erreur est survenue.')
            setLoading(false)
        }
    }

    async function handleResend() {
        if (resendCooldown > 0) return
        startCooldown()
        await fetch('/api/auth/resend-verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email }),
        })
    }

    async function handleGoogle() {
        setLoading(true)
        await signIn('google', { callbackUrl })
    }

    // ── VERIFY STEP ───────────────────────────────────────────────
    if (mode === 'verify') {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-8"><Logo /></div>
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex justify-center mb-5">
                            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                                <Mail size={26} className="text-gold" />
                            </div>
                        </div>
                        <h2 className="font-serif text-xl text-center text-brown mb-2">Vérifiez votre email</h2>
                        <p className="font-sans text-xs text-center text-taupe mb-6 leading-relaxed">
                            Un code de vérification a été envoyé à<br />
                            <span className="font-medium text-brown">{form.email}</span>
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">
                                    Code de vérification *
                                </label>
                                <input
                                    className={inputClass + ' tracking-[0.3em] text-center text-base font-medium'}
                                    placeholder="_ _ _ _ _ _"
                                    value={verifyCode}
                                    maxLength={6}
                                    onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, '')); setVerifyError('') }}
                                    onKeyDown={e => e.key === 'Enter' && handleVerify()}
                                    autoFocus
                                />
                            </div>
                            {verifyError && (
                                <p className="font-sans text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{verifyError}</p>
                            )}
                            <button onClick={handleVerify} disabled={loading}
                                className="w-full bg-gold text-white py-3 rounded-xl font-sans text-sm font-medium hover:bg-rose-deep transition-colors disabled:opacity-60">
                                {loading ? 'Vérification…' : 'Confirmer mon compte'}
                            </button>
                        </div>
                        <div className="mt-5 text-center space-y-2">
                            <p className="font-sans text-xs text-taupe">
                                Vous n&apos;avez pas reçu le code ?{' '}
                                <button onClick={handleResend} disabled={resendCooldown > 0}
                                    className="text-gold font-medium hover:underline disabled:opacity-50 disabled:no-underline">
                                    {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer'}
                                </button>
                            </p>
                            <button onClick={() => { setMode('register'); setVerifyCode(''); setVerifyError('') }}
                                className="font-sans text-xs text-taupe hover:text-brown transition-colors">
                                ← Modifier mes informations
                            </button>
                        </div>
                    </div>
                    <p className="text-center font-sans text-xs text-taupe mt-6">
                        En continuant, vous acceptez nos conditions d&apos;utilisation.
                    </p>
                </div>
            </div>
        )
    }

    // ── LOGIN / REGISTER STEP ─────────────────────────────────────
    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8"><Logo /></div>
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex rounded-xl bg-beige/50 p-1 mb-6">
                        {[['login', 'Se connecter'], ['register', 'Créer un compte']].map(([key, label]) => (
                            <button key={key} onClick={() => { setMode(key); setError('') }}
                                className={`flex-1 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 ${mode === key ? 'bg-white shadow text-brown' : 'text-taupe hover:text-brown'}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        {/* Prénom */}
                        {mode === 'register' && (
                            <div>
                                <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Prénom *</label>
                                <input className={inputClass} placeholder="Votre prénom" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Email *</label>
                            <input type="email" className={inputClass} placeholder="Adresse email" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Mot de passe *</label>
                            <div className="relative">
                                <input type={showPwd ? 'text' : 'password'} className={inputClass + ' pr-10'}
                                    placeholder="Mot de passe" value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleSubmit()} />
                                <button onClick={() => setShowPwd(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-gold transition-colors">
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {/* Barre de force du mot de passe */}
                            {mode === 'register' && form.password && strength && (
                                <div className="mt-2">
                                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                                    </div>
                                    <p className={`font-sans text-[0.6rem] mt-1 ${strength.label === 'Fort' ? 'text-green-500' :
                                            strength.label === 'Moyen' ? 'text-yellow-500' :
                                                strength.label === 'Faible' ? 'text-orange-500' : 'text-red-500'
                                        }`}>
                                        Force : {strength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirmation mot de passe — register only */}
                        {mode === 'register' && (
                            <div>
                                <label className="block font-sans text-[0.65rem] uppercase tracking-wider text-taupe mb-1">Confirmer le mot de passe *</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPwd ? 'text' : 'password'}
                                        className={inputClass + ' pr-10 ' + (
                                            passwordsMatch === null ? '' :
                                                passwordsMatch ? 'border-green-400 focus:border-green-400' : 'border-red-300 focus:border-red-400'
                                        )}
                                        placeholder="Répétez votre mot de passe"
                                        value={form.confirmPassword}
                                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                    />
                                    <button onClick={() => setShowConfirmPwd(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-gold transition-colors">
                                        {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {/* Feedback correspondance */}
                                {passwordsMatch === false && (
                                    <p className="font-sans text-[0.6rem] text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                                )}
                                {passwordsMatch === true && (
                                    <p className="font-sans text-[0.6rem] text-green-500 mt-1">✓ Les mots de passe correspondent.</p>
                                )}
                            </div>
                        )}

                        {error && <p className="font-sans text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                        <button onClick={handleSubmit} disabled={loading}
                            className="w-full bg-gold text-white py-3 rounded-xl font-sans text-sm font-medium hover:bg-rose-deep transition-colors disabled:opacity-60 mt-1">
                            {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Continuer →'}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="font-sans text-xs text-taupe">ou</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

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

export default function ConnexionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <p className="font-serif text-taupe">Chargement…</p>
            </div>
        }>
            <ConnexionForm />
        </Suspense>
    )
}