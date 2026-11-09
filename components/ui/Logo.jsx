import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Logo({ className }) {
  return (
    <Link href="/" aria-label="Susy Modas, accueil de la boutique" className={cn('wordmark text-[1.625rem] text-ink sm:text-[1.875rem]', className)}>
      Susy Modas
    </Link>
  )
}
