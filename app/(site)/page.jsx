import Hero from '@/components/sections/Hero'
import ProductGrid from '@/components/sections/ProductGrid'
import BannerVerse from '@/components/sections/BannerVerse'
import Newsletter from '@/components/sections/Newsletter'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductGrid />
      <BannerVerse />
      <Newsletter />
    </>
  )
}