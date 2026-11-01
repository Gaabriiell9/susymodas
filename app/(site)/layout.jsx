import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/layout/CartDrawer'
import { getSettings } from '@/lib/settings'

export const revalidate = 60

export default async function SiteLayout({ children }) {
  const settings = await getSettings()
  return (
    <WishlistProvider>
      <CartProvider settings={settings}>
        <Header announcement={settings.announcement} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer settings={settings} />
        <CartDrawer />
      </CartProvider>
    </WishlistProvider>
  )
}
