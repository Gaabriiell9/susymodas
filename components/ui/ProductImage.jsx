import Image from 'next/image'
import { cn } from '@/lib/utils'

// Image produit avec repli élégant quand aucune photo n'est encore ajoutée
export default function ProductImage({ src, alt, className, sizes = '(max-width: 768px) 50vw, 25vw', priority = false }) {
  if (!src) {
    return (
      <div className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br from-sand to-blush-light', className)}>
        <span className="font-serif text-lg italic text-ink-muted/60">Susy Modas</span>
      </div>
    )
  }
  return <Image src={src} alt={alt || ''} fill sizes={sizes} priority={priority} className={cn('object-cover', className)} />
}
