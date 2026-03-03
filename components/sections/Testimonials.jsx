import SectionHeader from '@/components/ui/SectionHeader'
import Stars from '@/components/ui/Stars'

const TESTIMONIALS = [
  {
    text: "J&apos;ai commandé ma robe de mariage ici et c&apos;était parfait. Susy a su exactement ce que je voulais — modeste, élégante et qui valorise ma silhouette. Je me suis sentie vraiment belle devant Dieu.",
    name: 'Marie-Christelle B.',
    location: 'Kourou, Guyane',
    avatar: '👰',
    rating: 5,
  },
  {
    text: "Enfin une boutique qui comprend nos valeurs ! Les robes sont magnifiques, les tissus de qualité et le service tellement chaleureux. Je recommande à toutes mes sœurs de l&apos;Église.",
    name: 'Joëlle M.',
    location: 'Cayenne, Guyane',
    avatar: '🙏',
    rating: 5,
  },
  {
    text: "Pour le baptême de ma fille, nous avions besoin de robes assorties pour toute la famille. Susy a tout géré avec professionnalisme. Résultat sublime, livraison rapide. Bénie cette boutique !",
    name: 'Féliciane D.',
    location: 'Saint-Laurent, Guyane',
    avatar: '👩‍👧',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <SectionHeader
          label="Témoignages"
          title='Elles ont &lt;em class=&quot;text-gold&quot; style=&quot;font-style:italic&quot;&gt;Choisi Susy Modas&lt;/em&gt;'
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="relative bg-white border border-gold-light rounded-2xl p-8">
              {/* Guillemet décoratif */}
              <span className="absolute top-2 left-6 font-serif text-6xl text-gold-light leading-none select-none">
                &quot;
              </span>

              <p className="font-serif italic text-brown-light leading-relaxed mt-6 mb-6">
                {t.text}
              </p>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blush to-gold-pale flex items-center justify-center text-xl flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-sans font-semibold text-sm text-brown">{t.name}</p>
                  <p className="font-sans text-xs text-taupe">{t.location}</p>
                  <Stars rating={t.rating} className="mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}