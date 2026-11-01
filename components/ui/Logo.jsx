import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Logo({ className, light = false, compact = false }) {
  return (
    <Link href="/" aria-label="Susy Modas, accueil" className={cn('inline-flex flex-col items-center leading-none', light ? 'text-ivory' : 'text-ink', className)}>
      <span className={cn('font-serif font-normal tracking-[0.14em] uppercase', compact ? 'text-[22px]' : 'text-[26px] sm:text-[30px]')}>
        Susy Modas
      </span>
      {!compact && (
        <span className={cn('mt-1 text-[9px] uppercase tracking-[0.42em]', light ? 'text-ivory/70' : 'text-ink-muted')}>
          Mode évangélique
        </span>
      )}
    </Link>
  )
}
