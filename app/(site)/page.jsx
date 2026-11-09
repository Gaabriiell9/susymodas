import ShopListing from '@/components/shop/ShopListing'

export const dynamic = 'force-dynamic'

export default function HomePage({ searchParams }) {
  return <ShopListing searchParams={searchParams} />
}
