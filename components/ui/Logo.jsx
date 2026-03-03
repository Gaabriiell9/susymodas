import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Logo({ className, light = false }) {
  return (
    <Link href="/" className={cn('flex items-center gap-3.5 no-underline', className)}>
      {/* Icône croix dans un cercle */}
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
        <circle cx="22" cy="22" r="21" stroke="#C9A96E" strokeWidth="1" />
        <rect x="20.5" y="10" width="3"  height="18" rx="1.5" fill="#C9A96E" />
        <rect x="14"   y="15" width="16" height="3"  rx="1.5" fill="#C9A96E" />
        <circle cx="22" cy="33" r="1.5" fill="#C9A96E" opacity="0.5" />
      </svg>

      <div className="flex flex-col leading-none">
        <span className={cn('font-serif text-[1.35rem] font-semibold tracking-[0.02em]', light ? 'text-white' : 'text-brown')}>
          Susy Modas
        </span>
        <span className="font-sans text-[0.6rem] tracking-[0.28em] uppercase text-gold font-medium mt-0.5">
          Evangelicas · Kourou
        </span>
      </div>
    </Link>
  )
}
