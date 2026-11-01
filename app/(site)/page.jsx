import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Clock, Store, Truck } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import { Reassurance } from '@/components/layout/Footer'
import { homeData } from '@/lib/products'
import { getSettings } from '@/lib/settings'
import { CATEGORIES } from '@/lib/catalog'
import { formatPrice } from '@/lib/utils'

export const revalidate = 60

export default async function HomePage() {
  const [{ newest, featured, counts, covers }, settings] = await Promise.all([homeData(), getSettings()])
  const categories = CATEGORIES.filter((c) => counts[c.id] || !Object.keys(counts).length).slice(0, 6)

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative">
        <div className="grid lg:min-h-[calc(100vh-112px)] lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-sand lg:order-2 lg:aspect-auto">
            <Image src="/hero-robe.jpg" alt="Robe midi jaune à volants, collection Susy Modas" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-[50%_25%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/5 to-transparent lg:hidden" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-ivory lg:hidden">
              <p className="label">Nouvelle collection</p>
              <h1 className="display mt-2 text-[44px] leading-[0.95]">L&apos;élégance<br /><em className="italic">en toute pudeur</em></h1>
              <Link href="/collection?tri=nouveautes" className="btn-light mt-6">Découvrir</Link>
            </div>
          </div>

          <div className="hidden flex-col justify-center bg-sand px-10 py-16 lg:flex xl:px-20">
            <p className="label animate-fade-up text-ink-muted">Nouvelle collection · Kourou</p>
            <h1 className="display mt-6 animate-fade-up text-[clamp(56px,6vw,96px)] leading-[0.92] [animation-delay:80ms]">
              L&apos;élégance<br /><em className="italic">en toute pudeur</em>
            </h1>
            <p className="mt-8 max-w-md animate-fade-up text-[16px] leading-relaxed text-ink-soft [animation-delay:160ms]">
              Robes, jupes et ensembles pensés pour la femme chrétienne : des coupes modestes, des matières douces, et cette touche de raffinement qui fait toute la différence.
            </p>
            <div className="mt-10 flex animate-fade-up gap-3 [animation-delay:240ms]">
              <Link href="/collection?tri=nouveautes" className="btn-dark">Voir les nouveautés</Link>
              <Link href="/collection?categorie=robes" className="btn-outline">Les robes</Link>
            </div>
            <div className="mt-14 flex gap-8 border-t border-ink/10 pt-6 text-[13px] text-ink-soft">
              <span className="flex items-center gap-2"><Store size={16} strokeWidth={1.3} /> Retrait gratuit en boutique</span>
              <span className="flex items-center gap-2"><Truck size={16} strokeWidth={1.3} /> Livraison à domicile</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Catégories ───────────────────────────────────────── */}
      <section className="shop-container pt-16 lg:pt-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="display text-4xl lg:text-5xl">Nos univers</h2>
          <Link href="/collection" className="label link-underline hidden sm:inline-block">Tout voir</Link>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {categories.map((c, i) => (
            <Link key={c.id} href={`/collection?categorie=${c.id}`} className="group relative aspect-[3/4] w-[44vw] shrink-0 snap-start overflow-hidden bg-sand sm:w-auto">
              {covers[c.id] ? (
                <Image src={covers[c.id]} alt={c.label} fill sizes="(max-width: 640px) 44vw, 16vw" className="object-cover transition duration-700 group-hover:scale-105" />
              ) : (
                <div className={`absolute inset-0 ${['bg-blush-light', 'bg-sand-dark', 'bg-[#EFE6DA]', 'bg-blush', 'bg-[#E9E4DC]', 'bg-sand'][i % 6]}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-ivory">
                <p className="font-serif text-2xl font-light">{c.label}</p>
                {counts[c.id] ? <p className="mt-0.5 text-[11px] uppercase tracking-label text-ivory/80">{counts[c.id]} pièces</p> : null}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Nouveautés ───────────────────────────────────────── */}
      <section className="shop-container pt-16 lg:pt-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="label text-ink-muted">Fraîchement arrivées</p>
            <h2 className="display mt-2 text-4xl lg:text-5xl">Nouveautés</h2>
          </div>
          <Link href="/collection?tri=nouveautes" className="label link-underline flex items-center gap-2">Tout voir <ArrowRight size={14} /></Link>
        </div>
        {newest.length ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {newest.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
          </div>
        ) : (
          <div className="border border-dashed border-line px-6 py-20 text-center">
            <p className="display text-3xl">La nouvelle collection arrive très bientôt</p>
            <p className="mt-3 text-[14px] text-ink-muted">En attendant, venez nous rendre visite en boutique à Kourou.</p>
            <Link href="/boutique" className="btn-outline mt-8">Nous trouver</Link>
          </div>
        )}
      </section>

      {/* ─── Boutique physique ────────────────────────────────── */}
      <section className="shop-container pt-16 lg:pt-24">
        <div className="grid overflow-hidden bg-ink text-ivory lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="label text-ivory/60">Click &amp; collect</p>
            <h2 className="display mt-4 text-4xl leading-tight lg:text-[56px]">Commandez en ligne,<br /><em className="italic">retirez en boutique</em></h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/70">
              Réservez vos pièces préférées en quelques clics et venez les essayer et les récupérer gratuitement dans notre boutique de Kourou. Vous préférez rester chez vous ? On vous livre{settings.freeShippingThreshold ? `, offert dès ${formatPrice(settings.freeShippingThreshold)}` : ''}.
            </p>
            <ul className="mt-8 space-y-3 text-[14px] text-ivory/85">
              <li className="flex gap-3"><MapPin size={17} strokeWidth={1.3} className="mt-0.5 shrink-0" /> {settings.storeAddress}</li>
              <li className="flex gap-3"><Clock size={17} strokeWidth={1.3} className="mt-0.5 shrink-0" /> {settings.storeHours}</li>
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/boutique" className="btn-light">Notre boutique</Link>
              <Link href="/collection" className="btn border border-ivory/40 text-ivory hover:bg-ivory hover:text-ink">Faire mon shopping</Link>
            </div>
          </div>
          <div className="relative min-h-[320px] bg-blush-light">
            <Image src="/logo-susy.png" alt="Susy Modas, boutique de mode évangélique à Kourou" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-12 sm:p-20" />
          </div>
        </div>
      </section>

      {/* ─── Sélection ───────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="shop-container pt-16 lg:pt-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="label text-ink-muted">Nos coups de cœur</p>
              <h2 className="display mt-2 text-4xl lg:text-5xl">La sélection de Susy</h2>
            </div>
            <Link href="/collection" className="label link-underline flex items-center gap-2">Tout voir <ArrowRight size={14} /></Link>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {featured.map((p) => (
              <div key={p.id} className="w-[64vw] shrink-0 snap-start sm:w-auto"><ProductCard product={p} /></div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Verset ───────────────────────────────────────────── */}
      <section className="shop-container py-20 text-center lg:py-28">
        <p className="mx-auto max-w-3xl font-serif text-3xl font-light italic leading-snug sm:text-[42px]">
          « Elle est revêtue de force et de gloire, et elle se rit de l&apos;avenir. »
        </p>
        <p className="label mt-6 text-ink-muted">Proverbes 31:25</p>
      </section>

      <Reassurance />
    </>
  )
}
