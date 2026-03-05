import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function Logo({ className, light = false }) {
  return (
    <Link href="/" className={cn('flex items-center gap-3 no-underline', className)}>
      <Image
        src="/logo-susy.png"
        alt="Susy Modas"
        width={56}
        height={56}
        className="object-contain rounded-full flex-shrink-0"
        priority
      />
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