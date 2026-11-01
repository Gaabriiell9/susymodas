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
  PENDING: { label: 'En attente de paiement', tone: 'bg-paper-2 text-muted' },
  CONFIRMED: { label: 'Payée, à préparer', tone: 'bg-accent text-accent-ink' },
  READY: { label: 'Prête au retrait', tone: 'bg-accent-soft text-ink' },
  SHIPPED: { label: 'Expédiée', tone: 'bg-accent-soft text-ink' },
  DELIVERED: { label: 'Livrée ou retirée', tone: 'bg-paper-3 text-ink' },
  CANCELLED: { label: 'Annulée', tone: 'bg-paper-2 text-error' },
}

export const DELIVERY_LABEL = {
  PICKUP: 'Retrait en boutique',
  DELIVERY: 'Livraison à domicile',
}
