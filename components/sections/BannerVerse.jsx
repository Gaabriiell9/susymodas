export default function BannerVerse() {
  return (
    <section className="relative bg-brown py-14 sm:py-20 px-4 sm:px-10 overflow-hidden">
      {/* Grand guillemet décoratif */}
      <span className="absolute left-10 top-0 font-serif text-[20rem] text-gold/5 leading-none select-none pointer-events-none">
        "
      </span>

      <div className="relative z-10 mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-10">

        {/* Verset */}
        <div className="max-w-xl">
          <blockquote
            className="font-serif italic font-light text-gold-light leading-relaxed"
            style={{ fontSize: 'clamp(1.5rem,2.5vw,2.4rem)' }}
          >
            « Elle est revêtue de force et de dignité, et elle se rit de l'avenir. »
          </blockquote>
          <cite className="block mt-4 font-sans text-[0.72rem] tracking-[0.22em] uppercase text-gold not-italic">
            — Proverbes 31:25
          </cite>
        </div>

        {/* Carte promo */}
        <div className="flex-shrink-0 border border-gold/30 rounded-xl p-8 text-center bg-white/5">
          <p className="font-sans text-[0.65rem] tracking-[0.22em] uppercase text-gold mb-2">Offre spéciale</p>
          <p className="font-serif font-light text-white leading-none" style={{ fontSize: '4rem' }}>
            −20<span className="text-3xl">%</span>
          </p>
          <p className="font-sans text-xs text-white/50 mt-2">Sur votre première commande</p>
          <div className="mt-4 border border-dashed border-gold/40 rounded-md px-4 py-2 font-sans text-sm tracking-[0.2em] text-gold-light">
            SUSY2025
          </div>
        </div>

      </div>
    </section>
  )
}