import { cn } from '@/lib/utils'

const styles = {
  nouveau:  'bg-gold text-white',
  promo:    'bg-rose-deep text-white',
  exclusif: 'bg-brown text-white',
  solde:    'bg-amber-600 text-white',
}

export default function Badge({ label, className }) {
  const key = label?.toLowerCase()
  return (
    <span
      className={cn(
        'absolute top-3 left-3 z-10 rounded-full px-3 py-1',
        'text-[0.6rem] font-medium tracking-[0.1em] uppercase font-sans',
        styles[key] ?? 'bg-brown text-white',
        className
      )}
    >
      {label}
    </span>
  )
}
