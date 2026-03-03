'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | success | error

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setStatus('error')
      return
    }
    // TODO : connecter à Mailchimp / Brevo / etc.
    setStatus('success')
    setEmail('')
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <section className="bg-gradient-to-br from-gold-pale to-blush py-20 px-5 text-center">
      <div className="mx-auto max-w-lg">
        <p className="text-3xl mb-4" aria-hidden>✉</p>
        <h2 className="font-serif font-light text-brown text-3xl mb-3">
          Rejoignez Notre Communauté
        </h2>
        <p className="font-sans text-sm text-brown-light leading-relaxed mb-8">
          Recevez en avant-première nos nouvelles collections, offres exclusives et inspirations pour votre garde-robe chrétienne.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex overflow-hidden border border-gold rounded-sm bg-white max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse e-mail…"
              className="flex-1 px-5 py-3.5 font-sans text-sm text-brown bg-transparent outline-none placeholder:text-taupe"
              aria-label="Adresse e-mail"
            />
            <Button type="submit" size="md" className="rounded-none flex-shrink-0">
              S&apos;inscrire
            </Button>
          </div>

          {status === 'success' && (
            <p className="mt-3 font-sans text-xs text-green-700">
              ✝ Merci ! Vous êtes inscrite à notre newsletter.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-3 font-sans text-xs text-rose-deep">
              Veuillez entrer une adresse e-mail valide.
            </p>
          )}
        </form>

        <p className="mt-5 font-sans text-[0.65rem] text-taupe">
          ✝ En vous inscrivant, vous rejoignez une communauté de femmes qui honorent Dieu par leur élégance.
        </p>
      </div>
    </section>
  )
}