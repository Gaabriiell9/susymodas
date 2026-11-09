import Link from 'next/link'
import Image from 'next/image'
import { getSettings } from '@/lib/settings'
import { formatPrice, whatsappLink } from '@/lib/utils'

export const metadata = { title: 'Notre boutique à Kourou', description: 'Adresse, horaires, retrait gratuit et livraison à domicile.' }
export const revalidate = 60

export default async function BoutiquePage() {
  const s = await getSettings()
  const map = `https://www.google.com/maps?q=${encodeURIComponent(s.storeAddress)}&output=embed`
  return (
    <>
      <section className="shop-container grid items-center gap-10 py-10 lg:grid-cols-12 lg:py-14">
        <div className="lg:col-span-6">
          <h1>Notre boutique à Kourou</h1>
          <p className="mt-3 text-lg text-muted">Essayez nos modèles et retirez vos commandes gratuitement.</p>
          <dl className="rule-ink mt-10">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6 border-b border-rule py-4">
              <dt className="font-medium text-ink-2">Adresse</dt>
              <dd><address className="not-italic">{s.storeAddress}</address></dd>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6 border-b border-rule py-4">
              <dt className="font-medium text-ink-2">Horaires</dt>
              <dd>{s.storeHours}</dd>
            </div>
          </dl>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a href={whatsappLink(s.whatsapp, 'Bonjour Susy Modas !')} target="_blank" rel="noopener noreferrer" className="btn-primary">Écrire sur WhatsApp</a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.storeAddress)}`} target="_blank" rel="noopener noreferrer" className="link">Itinéraire</a>
          </div>
        </div>
        <div className="flex justify-center bg-paper-2 p-10 lg:col-span-5 lg:col-start-8">
          <Image src="/logo-susy.png" alt="Logo Susy Modas, mode évangélique" width={420} height={420} priority className="h-auto w-full max-w-[300px]" />
        </div>
      </section>

      <section className="shop-container pt-6">
        <h2>Livraison, retrait et échanges</h2>
        <dl className="rule-ink mt-6">
          <div id="livraison" className="grid scroll-mt-28 gap-x-8 gap-y-2 border-b border-rule py-6 lg:grid-cols-12">
            <dt className="text-xl font-semibold lg:col-span-5">Retrait en boutique</dt>
            <dd className="text-ink-2 lg:col-span-6 lg:col-start-7">Gratuit. Choisissez « Retrait en boutique » au moment de commander : nous préparons votre commande et vous prévenons dès qu&apos;elle est prête.</dd>
          </div>
          <div className="grid gap-x-8 gap-y-2 border-b border-rule py-6 lg:grid-cols-12">
            <dt className="text-xl font-semibold lg:col-span-5">Livraison à domicile</dt>
            <dd className="text-ink-2 lg:col-span-6 lg:col-start-7">
              {formatPrice(s.shippingCost)} en Guyane{s.freeShippingThreshold ? `, offerte dès ${formatPrice(s.freeShippingThreshold)} d'achat` : ''}. Nous vous contactons pour convenir du créneau.
            </dd>
          </div>
          <div id="echanges" className="grid scroll-mt-28 gap-x-8 gap-y-2 border-b border-rule py-6 lg:grid-cols-12">
            <dt className="text-xl font-semibold lg:col-span-5">Échanges</dt>
            <dd className="text-ink-2 lg:col-span-6 lg:col-start-7">La taille ne convient pas ? Échange en boutique sous 14 jours, article non porté avec ses étiquettes.</dd>
          </div>
        </dl>
      </section>

      <section className="shop-container py-12">
        <div className="photo aspect-[16/9] w-full overflow-hidden bg-paper-2 sm:aspect-[21/9]">
          <iframe title="Plan d'accès à la boutique" src={map} className="h-full w-full grayscale" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
          <p className="text-xl font-semibold">À très vite en boutique</p>
          <Link href="/" className="btn-primary">Découvrir la collection</Link>
        </div>
      </section>
    </>
  )
}
