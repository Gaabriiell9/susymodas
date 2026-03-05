import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/layout/CartSidebar'

export default function SiteLayout({ children }) {
    return (
        <WishlistProvider>
            <CartProvider>
                <Header />
                <main>{children}</main>
                <Footer />
                <CartSidebar />
            </CartProvider>
        </WishlistProvider>
    )
}