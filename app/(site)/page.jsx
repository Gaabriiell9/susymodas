import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/product/ProductCard'
import { homeData } from '@/lib/products'
import { getSettings } from '@/lib/settings'
import { CATEGORIES } from '@/lib/catalog'
import { formatPrice } from '@/lib/utils'

export const revalidate = 60

export default async function HomePage() {
  const [{ newest, featured, counts }, settings] = await Promise.all([homeData(), getSettings()])
  const categories = CATEGORIES.filter((c) => counts[c.id] || !Object.keys(counts).length)
  const threshold = settings.freeShippingThreshold
  // la sélection : 2 ou 3 colonnes selon le nombre d'articles mis en avant
  const featCols = featured.length % 3 === 0 || featured.length > 4 ? 3 : 2
  const featRow = featured.slice(0, 6)

  return (
    <>
      {/* ─── Hero · Stage ─────────────────────────────────────── */}
      <section className="hero-stage">
        <div className="hero-stage__text flex flex-col justify-center px-gutter py-16 lg:px-0 lg:py-24">
          <h1 className="max-w-[9ch] text-[clamp(3rem,7vw,7rem)] leading-[1]">
            L&apos;élégance
            <br />
            en toute pudeur
          </h1>
          <p className="lead mt-8 max-w-[30ch] text-muted">Robes, jupes et ensembles pensés pour la femme chrétienne.</p>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link href="/collection?tri=nouveautes" className="btn-primary">Voir les nouveautés</Link>
            <Link href="/collection?categorie=robes" className="link">Les robes</Link>
          </div>
        </div>
        <div className="hero-stage__visual photo relative aspect-[4/5] bg-paper-2 lg:aspect-auto">
          <Image
            src="/hero-robe.jpg"
            alt="Robe midi jaune à volants et dentelle blanche, portée avec une ceinture fine"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover object-[50%_28%]"
          />
        </div>
      </section>

      {/* ─── Nouveautés · Grid de quatre ──────────────────────── */}
      <section className="shop-container pt-section">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <h2>Nouveautés</h2>
          <Link href="/collection?tri=nouveautes" className="link">Tout voir</Link>
        </div>
        {newest.length ? (
          <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-16 max-sm:gap-x-4 lg:grid-cols-4">
            {newest.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
          </div>
        ) : (
          <div className="rule-ink mt-16 grid gap-6 py-16 lg:grid-cols-12">
            <p className="display text-[2.5rem] lg:col-span-7">La nouvelle collection arrive très bientôt</p>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="text-muted">En attendant, venez nous rendre visite en boutique à Kourou.</p>
              <Link href="/boutique" className="btn-outline mt-6">Nous trouver</Link>
            </div>
          </div>
        )}
      </section>

      {/* ─── Nos univers · Index réglé ────────────────────────── */}
      <section className="shop-container pt-section-l">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <h2>Nos univers</h2>
          <Link href="/collection" className="link">Toute la collection</Link>
        </div>
        <ul className="rule-ink mt-16">
          {categories.map((c) => (
            <li key={c.id} className="border-b border-rule">
              <Link href={`/collection?categorie=${c.id}`} className="group grid items-baseline gap-x-8 gap-y-1 py-6 transition-colors duration-short hover:bg-paper-2 sm:grid-cols-12">
                <span className="display text-[2.5rem] transition-colors duration-short group-hover:text-accent sm:col-span-5">{c.label}</span>
                <span className="text-muted sm:col-span-5">{c.description}</span>
                <span className="tabular-nums text-ink-2 sm:col-span-2 sm:text-right">
                  {counts[c.id] ? `${counts[c.id]} pièce${counts[c.id] > 1 ? 's' : ''}` : 'Bientôt'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Retrait en boutique · Bande et fiche réglée ──────── */}
      <section className="mt-section-l bg-paper-2 py-section-s">
        <div className="shop-container grid gap-16 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-5">
            <h2 className="max-w-[14ch]">
              Commandez en ligne,
              <br />
              retirez en boutique
            </h2>
            <p className="lead mt-6 text-muted">Essayez et récupérez vos pièces gratuitement dans notre boutique de Kourou.</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/boutique" className="btn-primary">Notre boutique</Link>
              <Link href="/collection" className="link">Faire mon shopping</Link>
            </div>
            <Image src="/logo-susy.png" alt="Logo Susy Modas, mode évangélique" width={160} height={160} className="mt-auto hidden pt-16 lg:block" />
          </div>

          <dl className="rule-ink lg:col-span-7">
            <Row term="Retrait en boutique" value="Gratuit" big />
            <Row
              term="Livraison à domicile"
              value={formatPrice(settings.shippingCost)}
              note={threshold ? `Offerte dès ${formatPrice(threshold)} d'achat` : null}
              big
            />
            <Row term="Paiement" value="Carte bancaire, via Stripe" />
            <Row term="Échanges" value="En boutique sous 14 jours, article non porté" />
            <Row term="Adresse" value={settings.storeAddress} />
            <Row term="Horaires" value={settings.storeHours} />
          </dl>
        </div>
      </section>

      {/* ─── La sélection de Susy · Grid de trois ─────────────── */}
      {featured.length > 0 && (
        <section className="shop-container pt-section">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <h2>La sélection de Susy</h2>
            <Link href="/collection" className="link">Tout voir</Link>
          </div>
          <div className={`mt-16 grid grid-cols-2 gap-x-8 gap-y-16 max-sm:gap-x-4 ${featCols === 3 ? 'lg:grid-cols-3' : 'lg:w-2/3'}`}>
            {featRow.map((p) => (
              <ProductCard key={p.id} product={p} sizes="(max-width: 1024px) 50vw, 33vw" />
            ))}
          </div>
        </section>
      )}

      {/* ─── Verset · Statement ───────────────────────────────── */}
      <section className="shop-container py-section-l">
        <figure className="lg:ml-[calc(100%/12)]">
          <blockquote className="display max-w-[22ch] text-display-s">
            « Elle est revêtue de force et de gloire, et elle se rit de l&apos;avenir. »
          </blockquote>
          <figcaption className="mt-8 text-muted">Proverbes 31:25</figcaption>
        </figure>
      </section>
    </>
  )
}

function Row({ term, value, note, big = false }) {
  return (
    <div className="grid gap-x-8 gap-y-1 border-b border-rule py-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-baseline">
      <dt className="font-medium text-ink-2">{term}</dt>
      <dd>
        <span className={big ? 'display text-[2.5rem] tabular-nums' : ''}>{value}</span>
        {note && <span className="mt-1 block text-sm text-muted">{note}</span>}
      </dd>
    </div>
  )
}
