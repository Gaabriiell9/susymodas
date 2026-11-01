import Image from 'next/image'
import { cn } from '@/lib/utils'

// Image produit ; sans photo, le nom de l'article composé en Caslon (jamais un cadre vide)
export default function ProductImage({ src, alt, className, sizes = '(max-width: 768px) 50vw, 25vw', priority = false }) {
  if (!src) {
    return (
      <span className={cn('display absolute inset-0 flex items-center justify-center bg-paper-2 p-2 text-center text-ink-2', className)} aria-hidden="true">
        {alt ? alt.slice(0, 1) : 'S'}
      </span>
    )
  }
  return <Image src={src} alt={alt || ''} fill sizes={sizes} priority={priority} className={cn('object-cover', className)} />
}
