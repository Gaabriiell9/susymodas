import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import PWARegister from '@/components/PWARegister'

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
  manifest: '/manifest.json',
  themeColor: '#C9A96E',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Susy Modas',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C9A96E" />
        <link rel="apple-touch-icon" href="/logo-susy.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Susy Modas" />
      </head>
      <body>
        <Providers>
          <PWARegister />
          {children}
        </Providers>
      </body>
    </html>
  )
}