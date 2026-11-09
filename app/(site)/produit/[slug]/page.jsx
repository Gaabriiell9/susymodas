import { notFound } from 'next/navigation'
import ProductPageClient from '@/components/product/ProductPageClient'
import ProductCard from '@/components/product/ProductCard'
import { getProductBySlug, getRelated } from '@/lib/products'
import { getSettings } from '@/lib/settings'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const product = await getProductBySlug((await params).slug)
  if (!product) return { title: 'Article introuvable' }
  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `${product.name}, disponible chez Susy Modas à Kourou.`,
    openGraph: { images: product.images.slice(0, 1) },
  }
}

export default async function ProductPage({ params }) {
  const product = await getProductBySlug((await params).slug)
  if (!product) notFound()
  const [related, settings] = await Promise.all([getRelated(product), getSettings()])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductPageClient product={product} settings={settings} />
      {related.length > 0 && (
        <section className="shop-container border-t border-rule pb-28 pt-10 lg:pb-16">
          <h2>Vous aimerez aussi</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </>
  )
}
