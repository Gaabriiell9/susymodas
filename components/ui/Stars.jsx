import { renderStars, cn } from '@/lib/utils'

export default function Stars({ rating, className }) {
  return (
    <div className={cn('flex gap-0.5', className)}>
      {renderStars(rating).map((filled, i) => (
        <span key={i} className={filled ? 'text-gold text-xs' : 'text-gold-light text-xs'}>
          ★
        </span>
      ))}
    </div>
  )
}
