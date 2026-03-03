import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/layout/CartSidebar'
import AnnouncementBar from '@/components/ui/AnnouncementBar'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata = {
  title: 'Susy Modas Evangelicas — Robes Chrétiennes | Kourou, Guyane',
  description: 'Boutique de robes chrétiennes modestes et élégantes à Kourou, Guyane Française.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  )
}
