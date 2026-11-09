import ShopListing from '@/components/shop/ShopListing'
import { parseFilters, titleFor } from '@/components/shop/filters'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }) {
  return { title: titleFor(parseFilters(await searchParams)).replace(/[«»]/g, '').trim() }
}

export default async function CollectionPage({ searchParams }) {
  return <ShopListing searchParams={await searchParams} />
}
