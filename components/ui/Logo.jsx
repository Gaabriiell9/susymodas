import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function Logo({ className }) {
  return (
    <Link href="/" className={cn('flex items-center no-underline', className)}>
      <Image
        src="/logo-susy.png"
        alt="Susy Modas Evangelicas"
        width={64}
        height={64}
        className="object-contain rounded-full"
        priority
      />
    </Link>
  )
}