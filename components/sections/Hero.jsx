'use client'

import Image from 'next/image'
import Button from '@/components/ui/Button'
import { whatsappLink } from '@/lib/utils'

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-cream via-blush/60 to-gold-pale">

      {/* Motif de fond */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A96E' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")` }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 sm:py-16">

        {/* Texte principal */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/70 border border-gold-light rounded-full px-4 py-1.5 mb-6">
            <span className="text-gold text-xs">✦</span>
            <span className="font-sans text-[0.68rem] tracking-[0.2em] uppercase text-gold font-medium">
              Nouvelle Collection 2025
            </span>
          </div>

          <h1 className="font-serif font-light leading-[1.08] text-brown mb-5" style={{ fontSize: 'clamp(3rem,5.5vw,5.5rem)' }}>
            L&apos;Élégance<br />
            au Service de<br />
            <em className="text-gold" style={{ fontStyle: 'italic' }}>la Foi</em>
          </h1>

          <p className="font-sans text-brown-light leading-relaxed max-w-md mb-8 text-[0.95rem]">
            Des robes chrétiennes conçues pour la femme moderne qui honore Dieu à travers sa mise — modestes, raffinées et sublimes pour chaque occasion sacrée.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => document.getElementById('nouveautes')?.scrollIntoView({ behavior: 'smooth' })}>
              Découvrir la Collection
            </Button>
            <a
              href={whatsappLink('Bonjour, je voudrais des informations sur vos robes.')}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-sm border border-gold text-gold font-sans text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold hover:text-white transition-all duration-200"
            >
              Nous Contacter
            </a>
          </div>

          <div className="mt-10 pt-6 border-t border-gold-light flex gap-4 items-start">
            <div className="w-0.5 h-10 bg-gold rounded-full flex-shrink-0 mt-1" />
            <div>
              <p className="font-serif italic text-taupe leading-relaxed">
                « Que votre ornement soit, non cette parure extérieure... mais l&apos;homme caché dans le cœur. »
              </p>
              <span className="font-sans text-[0.68rem] tracking-[0.18em] uppercase text-gold mt-1 block">
                1 Pierre 3:3-4
              </span>
            </div>
          </div>
        </div>

        {/* Photo hero */}
        <div className="hidden lg:flex justify-center items-center">
          <div className="relative">
            {/* Cadre arrondi avec la vraie photo */}
            <div className="w-[400px] h-[520px] rounded-[200px_200px_180px_180px] overflow-hidden shadow-2xl relative">
              <Image
                src="/hero-robe.jpg"
                alt="Robe Susy Modas"
                fill
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Tags flottants */}
            <div className="absolute -left-4 bottom-16 bg-white border border-gold-light rounded-xl px-4 py-3 shadow-lg">
              <strong className="block font-serif text-brown">Kourou, Guyane</strong>
              <span className="font-sans text-[0.68rem] text-taupe">Boutique & commandes</span>
            </div>
            <div className="absolute -right-4 top-20 bg-white border border-gold-light rounded-xl px-4 py-3 shadow-lg">
              <strong className="block font-serif text-brown">+100 modèles</strong>
              <span className="font-sans text-[0.68rem] text-taupe">Tailles S à 5XL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}