export default function BannerVerse() {
  return (
    <section className="relative bg-brown py-14 sm:py-20 px-4 sm:px-10 overflow-hidden">
      {/* Grand guillemet décoratif */}
      <span className="absolute left-10 top-0 font-serif text-[20rem] text-gold/5 leading-none select-none pointer-events-none">
        &quot;
      </span>

      <div className="relative z-10 mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Verset */}
        <div className="max-w-xl">
          <blockquote
            className="font-serif italic font-light text-gold-light leading-relaxed"
            style={{ fontSize: 'clamp(1.5rem,2.5vw,2.4rem)' }}
          >
            « Elle est revêtue de force et de dignité, et elle se rit de l&apos;avenir. »
          </blockquote>
          <cite className="block mt-4 font-sans text-[0.72rem] tracking-[0.22em] uppercase text-gold not-italic">
            — Proverbes 31:25
          </cite>
        </div>

        {/* Carte annonce ouverture */}
        <div className="flex-shrink-0 border border-gold/30 rounded-xl p-8 text-center bg-white/5 max-w-xs">
          <p className="font-sans text-[0.65rem] tracking-[0.22em] uppercase text-gold mb-3">
            🎉 Ouverture du site
          </p>
          <p className="font-serif font-light text-white text-lg leading-snug mb-1">
            Pour fêter notre lancement,
          </p>
          <p className="font-serif font-light text-white leading-none mb-3" style={{ fontSize: '3.5rem' }}>
            −10<span className="text-2xl">%</span>
          </p>
          <p className="font-sans text-xs text-white/50 mb-4">
            sur votre première commande
          </p>
          <div className="border border-dashed border-gold/40 rounded-md px-4 py-2 font-sans text-sm tracking-[0.2em] text-gold-light">
            SUSY2026
          </div>
          <p className="font-sans text-[0.6rem] text-white/30 mt-3">
            Code à saisir lors du paiement
          </p>
        </div>
      </div>
    </section>
  )
}