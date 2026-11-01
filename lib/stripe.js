import Stripe from 'stripe'

let instance = null
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY manquant')
  if (!instance) instance = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
  return instance
}

export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
