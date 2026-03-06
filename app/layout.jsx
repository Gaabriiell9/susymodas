import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import Providers from './providers'

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}