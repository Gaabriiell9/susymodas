import { Star } from 'lucide-react'

export default function Stars({ rating = 5, max = 5 }) {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(max)].map((_, i) => (
                <Star
                    key={i}
                    size={12}
                    className={i < rating ? 'fill-gold text-gold' : 'text-gray-200 fill-gray-200'}
                />
            ))}
        </div>
    )
}