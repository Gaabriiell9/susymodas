import { cache } from 'react'
import prisma from '@/lib/prisma'

export const DEFAULT_SETTINGS = {
  shippingCost: 8,
  freeShippingThreshold: 150,
  storeAddress: 'Kourou, Guyane française',
  storeHours: 'Du mardi au samedi, 9h-12h30 et 15h-19h',
  whatsapp: '594694029596',
  announcement: 'Retrait gratuit en boutique à Kourou, paiement 100 % sécurisé',
}

// Lit les réglages de la boutique (une ligne id=1), avec repli sur les valeurs par défaut
export const getSettings = cache(async () => {
  try {
    const s = await prisma.storeSettings.findUnique({ where: { id: 1 } })
    if (!s) return DEFAULT_SETTINGS
    return {
      shippingCost: s.shippingCost,
      freeShippingThreshold: s.freeShippingThreshold,
      storeAddress: s.storeAddress,
      storeHours: s.storeHours,
      whatsapp: s.whatsapp,
      announcement: s.announcement,
    }
  } catch (e) {
    console.error('[settings]', e.message)
    return DEFAULT_SETTINGS
  }
})

export function shippingFor(method, subtotal, settings) {
  if (method !== 'DELIVERY') return 0
  const threshold = settings.freeShippingThreshold
  if (threshold && subtotal >= threshold) return 0
  return settings.shippingCost
}
