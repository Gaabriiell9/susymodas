import Link from 'next/link'
import { CATEGORIES } from '@/lib/catalog'
import { whatsappLink } from '@/lib/utils'

export default function Footer({ settings }) {
  return (
    <footer className="on-ink bg-ink pb-10 pt-section-s text-paper">
      <div className="shop-container">
        <p className="display text-[clamp(3.5rem,11vw,10rem)] leading-[0.9] text-paper" aria-hidden="true">Susy Modas</p>

        <div className="mt-16 grid gap-10 border-t border-paper/20 pt-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="max-w-sm text-paper/80">
              Robes et ensembles modestes, choisis avec soin pour sublimer chaque femme, à l&apos;église comme au quotidien.
            </p>
            <a href={whatsappLink(settings.whatsapp, 'Bonjour Susy Modas !')} target="_blank" rel="noopener noreferrer" className="btn-light mt-6">
              Écrire sur WhatsApp
            </a>
          </div>

          <nav aria-label="Boutique" className="lg:col-span-3">
            <p className="text-sm font-medium text-paper/60">Boutique</p>
            <ul className="mt-4 space-y-2">
              <li><Link href="/collection?tri=nouveautes" className="link-underline whitespace-nowrap">Nouveautés</Link></li>
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.id}><Link href={`/collection?categorie=${c.id}`} className="link-underline whitespace-nowrap">{c.label}</Link></li>
              ))}
              <li><Link href="/collection?promo=1" className="link-underline whitespace-nowrap">Promotions</Link></li>
            </ul>
          </nav>

          <nav aria-label="Aide" className="lg:col-span-2">
            <p className="text-sm font-medium text-paper/60">Aide</p>
            <ul className="mt-4 space-y-2">
              <li><Link href="/boutique#livraison" className="link-underline whitespace-nowrap">Livraison et retrait</Link></li>
              <li><Link href="/boutique#echanges" className="link-underline whitespace-nowrap">Échanges</Link></li>
              <li><Link href="/compte" className="link-underline whitespace-nowrap">Mon compte</Link></li>
              <li><Link href="/favoris" className="link-underline whitespace-nowrap">Mes favoris</Link></li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="text-sm font-medium text-paper/60">Notre boutique</p>
            <address className="mt-4 not-italic text-paper/80">
              {settings.storeAddress}
              <br />
              {settings.storeHours}
            </address>
            <Link href="/boutique" className="link mt-4 inline-block">Venir nous voir</Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-paper/20 pt-6 text-sm text-paper/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Susy Modas Evangelicas, Kourou, Guyane française</p>
          <p>Paiement sécurisé par carte bancaire, Apple Pay et Google Pay</p>
        </div>
      </div>
    </footer>
  )
}
