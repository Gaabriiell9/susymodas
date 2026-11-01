import Link from 'next/link'
import { MapPin, Clock, MessageCircle, ShieldCheck, Store, Truck, RotateCcw } from 'lucide-react'
import { CATEGORIES } from '@/lib/catalog'
import { whatsappLink } from '@/lib/utils'

export function Reassurance() {
  const items = [
    { icon: Store, title: 'Retrait gratuit', text: 'Dans notre boutique à Kourou' },
    { icon: Truck, title: 'Livraison à domicile', text: 'Partout en Guyane' },
    { icon: ShieldCheck, title: 'Paiement sécurisé', text: 'Carte bancaire via Stripe' },
    { icon: RotateCcw, title: 'Échange en boutique', text: 'Sous 14 jours, article non porté' },
  ]
  return (
    <section className="border-y border-line bg-white">
      <div className="shop-container grid grid-cols-2 gap-y-8 py-10 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col items-center px-2 text-center">
            <Icon size={22} strokeWidth={1.2} />
            <p className="label mt-3">{title}</p>
            <p className="mt-1 text-[13px] text-ink-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Footer({ settings }) {
  return (
    <footer className="bg-ink text-ivory">
      <div className="shop-container grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <p className="font-serif text-3xl tracking-[0.12em] uppercase">Susy Modas</p>
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-ivory/60">
            Robes et ensembles modestes, choisis avec soin pour sublimer chaque femme, à l&apos;église comme au quotidien.
          </p>
          <a href={whatsappLink(settings.whatsapp, 'Bonjour Susy Modas !')} target="_blank" rel="noopener noreferrer" className="btn mt-6 border border-ivory/30 text-ivory hover:bg-ivory hover:text-ink">
            <MessageCircle size={15} /> Nous écrire sur WhatsApp
          </a>
        </div>

        <div>
          <p className="label mb-5 text-ivory/50">Boutique</p>
          <ul className="space-y-2.5 text-[14px] text-ivory/80">
            <li><Link href="/collection?tri=nouveautes" className="hover:text-ivory">Nouveautés</Link></li>
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.id}><Link href={`/collection?categorie=${c.id}`} className="hover:text-ivory">{c.label}</Link></li>
            ))}
            <li><Link href="/collection?promo=1" className="hover:text-ivory">Promotions</Link></li>
          </ul>
        </div>

        <div>
          <p className="label mb-5 text-ivory/50">Aide</p>
          <ul className="space-y-2.5 text-[14px] text-ivory/80">
            <li><Link href="/boutique#livraison" className="hover:text-ivory">Livraison et retrait</Link></li>
            <li><Link href="/boutique#echanges" className="hover:text-ivory">Échanges</Link></li>
            <li><Link href="/compte" className="hover:text-ivory">Mon compte</Link></li>
            <li><Link href="/favoris" className="hover:text-ivory">Mes favoris</Link></li>
          </ul>
        </div>

        <div>
          <p className="label mb-5 text-ivory/50">Notre boutique</p>
          <ul className="space-y-3 text-[14px] text-ivory/80">
            <li className="flex gap-3"><MapPin size={16} strokeWidth={1.3} className="mt-0.5 shrink-0" /> {settings.storeAddress}</li>
            <li className="flex gap-3"><Clock size={16} strokeWidth={1.3} className="mt-0.5 shrink-0" /> {settings.storeHours}</li>
          </ul>
          <Link href="/boutique" className="label mt-5 inline-block border-b border-ivory/40 pb-1">Venir nous voir</Link>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="shop-container flex flex-col items-center justify-between gap-2 py-6 text-[12px] text-ivory/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Susy Modas Evangelicas · Kourou, Guyane française</p>
          <p>Paiement sécurisé · Visa · Mastercard · Apple Pay · Google Pay</p>
        </div>
      </div>
    </footer>
  )
}
