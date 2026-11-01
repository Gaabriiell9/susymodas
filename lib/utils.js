import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount) {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(date, withTime = false) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: 'America/Cayenne',
  }).format(new Date(date))
}

export function whatsappLink(number, message = '') {
  const phone = String(number ?? '').replace(/\D/g, '')
  return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}

export const ORDER_STATUS = {
  PENDING: { label: 'En attente de paiement', tone: 'bg-stone-100 text-stone-600' },
  CONFIRMED: { label: 'Payée, à préparer', tone: 'bg-amber-50 text-amber-700' },
  READY: { label: 'Prête au retrait', tone: 'bg-sky-50 text-sky-700' },
  SHIPPED: { label: 'Expédiée', tone: 'bg-indigo-50 text-indigo-700' },
  DELIVERED: { label: 'Livrée / retirée', tone: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Annulée', tone: 'bg-red-50 text-red-600' },
}

export const DELIVERY_LABEL = {
  PICKUP: 'Retrait en boutique',
  DELIVERY: 'Livraison à domicile',
}
