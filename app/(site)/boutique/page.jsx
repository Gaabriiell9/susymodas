import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, MessageCircle, Store, Truck, RotateCcw } from 'lucide-react'
import { getSettings } from '@/lib/settings'
import { formatPrice, whatsappLink } from '@/lib/utils'

export const metadata = { title: 'Notre boutique à Kourou', description: 'Adresse, horaires, retrait gratuit et livraison à domicile.' }
export const revalidate = 60

export default async function BoutiquePage() {
  const s = await getSettings()
  const map = `https://www.google.com/maps?q=${encodeURIComponent(s.storeAddress)}&output=embed`
  return (
    <>
      <section className="grid lg:grid-cols-2">
        <div className="relative aspect-[4/3] bg-blush-light lg:aspect-auto lg:min-h-[560px]">
          <Image src="/logo-susy.png" alt="Susy Modas" fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-contain p-14 sm:p-24" />
        </div>
        <div className="flex flex-col justify-center bg-sand px-6 py-14 sm:px-12 lg:px-20">
          <p className="label text-ink-muted">Venez nous voir</p>
          <h1 className="display mt-4 text-5xl lg:text-6xl">Notre boutique<br /><em className="italic">à Kourou</em></h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Essayez nos modèles, profitez de nos conseils et retirez vos commandes en ligne gratuitement. Nous serons ravies de vous accueillir.
          </p>
          <ul className="mt-8 space-y-4 text-[15px]">
            <li className="flex gap-3"><MapPin size={19} strokeWidth={1.3} className="mt-0.5 shrink-0" /> {s.storeAddress}</li>
            <li className="flex gap-3"><Clock size={19} strokeWidth={1.3} className="mt-0.5 shrink-0" /> {s.storeHours}</li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={whatsappLink(s.whatsapp, 'Bonjour Susy Modas !')} target="_blank" rel="noopener noreferrer" className="btn-dark"><MessageCircle size={15} /> WhatsApp</a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.storeAddress)}`} target="_blank" rel="noopener noreferrer" className="btn-outline">Itinéraire</a>
          </div>
        </div>
      </section>

      <section className="shop-container grid gap-12 py-20 lg:grid-cols-3">
        <div id="livraison" className="scroll-mt-28">
          <Store size={24} strokeWidth={1.2} />
          <h2 className="display mt-4 text-3xl">Retrait en boutique</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">Gratuit. Choisissez « Retrait en boutique » au moment de commander : nous préparons votre commande et vous prévenons dès qu&apos;elle est prête.</p>
        </div>
        <div>
          <Truck size={24} strokeWidth={1.2} />
          <h2 className="display mt-4 text-3xl">Livraison à domicile</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            {formatPrice(s.shippingCost)} en Guyane{s.freeShippingThreshold ? `, offerte dès ${formatPrice(s.freeShippingThreshold)} d'achat` : ''}. Nous vous contactons pour convenir du créneau.
          </p>
        </div>
        <div id="echanges" className="scroll-mt-28">
          <RotateCcw size={24} strokeWidth={1.2} />
          <h2 className="display mt-4 text-3xl">Échanges</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">La taille ne convient pas ? Échange en boutique sous 14 jours, article non porté avec ses étiquettes. Contactez-nous sur WhatsApp pour toute question.</p>
        </div>
      </section>

      <section className="shop-container pb-20">
        <div className="aspect-[16/9] w-full overflow-hidden border border-line bg-sand sm:aspect-[21/9]">
          <iframe title="Plan d'accès à la boutique" src={map} className="h-full w-full grayscale" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <div className="mt-10 text-center"><Link href="/collection" className="btn-dark">Découvrir la collection</Link></div>
      </section>
    </>
  )
}
