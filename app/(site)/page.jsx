import ShopListing from '@/components/shop/ShopListing'

export const dynamic = 'force-dynamic'

export default async function HomePage({ searchParams }) {
  return <ShopListing searchParams={await searchParams} />
}
