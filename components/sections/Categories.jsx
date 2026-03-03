import SectionHeader from '@/components/ui/SectionHeader'
import { cn } from '@/lib/utils'

const CATS = [
  { label: 'Culte & Église',      desc: 'Modestie et grâce au quotidien',           bg: 'from-blush to-rose/30',       emoji: '⛪', span: true },
  { label: 'Cérémonies',          desc: 'Baptêmes, conférences & galas',             bg: 'from-gold-pale to-beige',     emoji: '✨' },
  { label: 'Tenues Quotidiennes', desc: 'Élégance modeste au jour le jour',          bg: 'from-beige to-gold-light/40', emoji: '🌸' },
  { label: 'Enfants & Jeunes',    desc: 'Douceur et pudeur dès le plus jeune âge',  bg: 'from-gold-pale to-blush',     emoji: '👧' },
]

export default function Categories() {
  return (
    <section id="collections" className="py-14 sm:py-24 mx-auto max-w-7xl px-4 sm:px-10">
      <SectionHeader
        label="Collections"
        title='Habillée pour <em class="text-gold" style="font-style:italic">Chaque Occasion</em>'
        className="mb-14"
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 auto-rows-[180px] sm:auto-rows-[220px] md:grid-cols-4">
        {CATS.map((cat) => (
          <div
            key={cat.label}
            className={cn(
              'relative rounded-2xl overflow-hidden cursor-pointer group transition-transform duration-400 hover:-translate-y-2',
              cat.span && 'col-span-2 row-span-2'
            )}
          >
            {/* Fond dégradé */}
            <div className={cn('absolute inset-0 bg-gradient-to-br', cat.bg)} />
            {/* Overlay sombre en bas */}
            <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/60 via-transparent to-transparent" />

            {/* Emoji illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('select-none opacity-30 group-hover:opacity-45 transition-opacity', cat.span ? 'text-9xl' : 'text-7xl')}>
                {cat.emoji}
              </span>
            </div>

            {/* Texte */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h3 className={cn('font-serif font-normal leading-tight', cat.span ? 'text-2xl' : 'text-lg')}>
                {cat.label}
              </h3>
              <p className="font-sans text-xs text-white/75 mt-1">{cat.desc}</p>
            </div>

            {/* Flèche */}
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-sm transition-colors group-hover:bg-gold group-hover:border-gold">
              →
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}