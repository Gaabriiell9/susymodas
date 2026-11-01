import Link from 'next/link'
import { cn } from '@/lib/utils'

// Mot-symbole : Libre Caslon, casse normale, sans espacement
export default function Logo({ className, size = 'md' }) {
  return (
    <Link
      href="/"
      aria-label="Susy Modas, accueil"
      className={cn('display whitespace-nowrap text-ink', size === 'lg' ? 'text-[2rem]' : 'text-[1.75rem] sm:text-[2rem]', className)}
    >
      Susy Modas
    </Link>
  )
}
