import '@fontsource/cormorant-garamond/300.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/300-italic.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/jost/300.css'
import '@fontsource/jost/400.css'
import '@fontsource/jost/500.css'
import './globals.css'
import Providers from './providers'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://susymodas.com'),
  title: { default: 'Susy Modas | Mode évangélique à Kourou', template: '%s | Susy Modas' },
  description: 'Robes, jupes et ensembles modestes et élégants. Boutique à Kourou (Guyane), retrait gratuit ou livraison à domicile, paiement sécurisé.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/logo-susy.png' },
  openGraph: { type: 'website', locale: 'fr_FR', siteName: 'Susy Modas', images: ['/hero-robe.jpg'] },
}

export const viewport = { themeColor: '#FBF8F4' }

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
