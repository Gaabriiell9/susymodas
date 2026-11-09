import Link from 'next/link'
import { Store, Truck, ShieldCheck, RotateCcw, MessageCircle } from 'lucide-react'
import { CATEGORIES } from '@/lib/catalog'
import { formatPrice, whatsappLink } from '@/lib/utils'

export default function Footer({ settings }) {
  const perks = [
    { icon: Store, title: 'Retrait gratuit', text: 'En boutique à Kourou' },
    { icon: Truck, title: 'Livraison à domicile', text: settings.freeShippingThreshold ? `Offerte dès ${formatPrice(settings.freeShippingThreshold)}` : formatPrice(settings.shippingCost) },
    { icon: ShieldCheck, title: 'Paiement sécurisé', text: 'Carte, Apple Pay, Google Pay' },
    { icon: RotateCcw, title: 'Échange 14 jours', text: 'En boutique, article non porté' },
  ]
  return (
    <footer className="mt-auto">
      <div className="border-y border-rule bg-paper-2">
        <ul className="shop-container grid grid-cols-2 gap-y-5 py-6 lg:grid-cols-4">
          {perks.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 pr-3">
              <Icon size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <span className="text-sm"><span className="block font-semibold">{title}</span><span className="block text-muted">{text}</span></span>
            </li>
          ))}
        </ul>
      </div>

      <div className="on-ink bg-ink text-paper">
        <div className="shop-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="wordmark text-[1.75rem]">Susy Modas</p>
            <p className="mt-3 text-sm text-paper/70">Mode évangélique, robes et ensembles modestes. Boutique à Kourou, Guyane.</p>
            <a href={whatsappLink(settings.whatsapp, 'Bonjour Susy Modas !')} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 border border-paper/30 px-4 text-sm font-medium hover:bg-paper hover:text-ink">
              <MessageCircle size={16} aria-hidden="true" /> WhatsApp
            </a>
          </div>
          <FooterNav title="Rayons">
            {CATEGORIES.map((c) => <li key={c.id}><Link href={`/?categorie=${c.id}`} className="link-underline">{c.label}</Link></li>)}
            <li><Link href="/?promo=1" className="link-underline">Promotions</Link></li>
          </FooterNav>
          <FooterNav title="Aide">
            <li><Link href="/boutique#livraison" className="link-underline">Livraison et retrait</Link></li>
            <li><Link href="/boutique#echanges" className="link-underline">Échanges</Link></li>
            <li><Link href="/compte" className="link-underline">Mes commandes</Link></li>
            <li><Link href="/favoris" className="link-underline">Mes favoris</Link></li>
          </FooterNav>
          <div>
            <p className="text-sm font-semibold">Notre boutique</p>
            <address className="mt-3 text-sm not-italic text-paper/70">{settings.storeAddress}<br />{settings.storeHours}</address>
            <Link href="/boutique" className="link-underline mt-3 inline-block text-sm">Plan et itinéraire</Link>
          </div>
        </div>
        <div className="border-t border-paper/15">
          <p className="shop-container py-4 text-xs text-paper/50">© {new Date().getFullYear()} Susy Modas Evangelicas, Kourou, Guyane française</p>
        </div>
      </div>
    </footer>
  )
}

function FooterNav({ title, children }) {
  return (
    <nav aria-label={title}>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-paper/70">{children}</ul>
    </nav>
  )
}
