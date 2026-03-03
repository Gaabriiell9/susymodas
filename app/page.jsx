import Hero from '@/components/sections/Hero'
import Categories from '@/components/sections/Categories'
import ProductGrid from '@/components/sections/ProductGrid'
import BannerVerse from '@/components/sections/BannerVerse'
import Newsletter from '@/components/sections/Newsletter'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <ProductGrid />
      <BannerVerse />
      <Newsletter />
    </>
  )
}