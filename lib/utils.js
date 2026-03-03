import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Fusionne les classes Tailwind proprement (résout les conflits).
 * Exemple : cn('px-4', isActive && 'bg-gold', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un prix en euros.
 * formatPrice(145) → "145 €"
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Génère un lien WhatsApp avec message pré-rempli.
 */
export function whatsappLink(message = '') {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '594XXXXXXX'
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

/**
 * Retourne un tableau de booléens pour afficher les étoiles.
 * renderStars(4) → [true, true, true, true, false]
 */
export function renderStars(rating) {
  return Array.from({ length: 5 }, (_, i) => i < rating)
}
