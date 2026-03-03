import SectionHeader from '@/components/ui/SectionHeader'

const VALUES = [
  { icon: '✝',  title: 'Valeurs Chrétiennes', desc: "Chaque pièce reflète la modestie, la sobriété et l'élégance biblique. Notre mode honore Dieu en toute circonstance." },
  { icon: '👗', title: 'Coupes Flatteuses',    desc: 'Modèles pensés pour sublimer toutes les silhouettes du S au 5XL. La pudeur n\'a jamais été aussi belle.' },
  { icon: '🌟', title: 'Qualité Premium',      desc: 'Tissus nobles, finitions soignées, broderies délicates. Nos robes sont conçues pour durer.' },
  { icon: '📦', title: 'Livraison Guyane',     desc: 'Basée à Kourou, nous livrons dans toute la Guyane Française. Boutique physique sur rendez-vous.' },
  { icon: '💬', title: 'Service Personnalisé', desc: 'Commandez via WhatsApp, Instagram ou en boutique. Notre équipe vous conseille chaleureusement.' },
  { icon: '✂',  title: 'Sur Commande',         desc: 'Pour une occasion spéciale, nous proposons retouches et ajustements personnalisés sur demande.' },
]

export default function Values() {
  return (
    <section id="valeurs" className="py-14 sm:py-24 bg-beige">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <SectionHeader
          label="Notre Engagement"
          title='Pourquoi Choisir <em class="text-gold" style="font-style:italic">Susy Modas</em>'
          className="mb-16"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="bg-white border border-gold-light rounded-2xl p-10 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-pale to-blush flex items-center justify-center text-2xl mx-auto mb-5">
                {v.icon}
              </div>
              <h3 className="font-serif text-xl text-brown mb-3">{v.title}</h3>
              <p className="font-sans text-sm text-brown-light leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}