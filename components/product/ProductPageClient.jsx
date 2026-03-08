'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Heart, ChevronLeft } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, cn } from '@/lib/utils'
import Stars from '@/components/ui/Stars'

export default function ProductPageClient({ product }) {
    const router = useRouter()
    const { addItem, items, openCart } = useCart()

    // sizeStock: { XL: 1, S: 0, M: 2, ... }
    // sizes: tailles encore disponibles (stock > 0)
    const sizeStock = product.sizeStock ?? {}
    const availableSizes = product.sizes ?? []

    // Toutes les tailles connues = clés de sizeStock (même épuisées)
    // Si sizeStock est vide (ancien produit), fallback sur sizes
    const allSizes = Object.keys(sizeStock).length > 0
        ? Object.keys(sizeStock)
        : availableSizes

    const firstAvailable = availableSizes[0] ?? null
    const [selectedSize, setSelectedSize] = useState(firstAvailable)
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [wished, setWished] = useState(false)
    const [added, setAdded] = useState(false)

    const isSold = product.stock === 0

    // Stock dispo pour une taille donnée
    function getMaxStock(size) {
        if (!size) return product.stock ?? 0
        if (sizeStock[size] !== undefined) return sizeStock[size]
        if (!availableSizes.length) return product.stock ?? 0
        return Math.floor(product.stock / availableSizes.length) || 1
    }

    function getCartQty(size) {
        return items.find(i => i.id === product.id && i.size === size)?.qty ?? 0
    }

    function isSizeUnavailable(size) {
        // Épuisée si sizeStock existe et vaut 0, ou si absente des tailles dispo
        if (sizeStock[size] !== undefined) return sizeStock[size] <= 0
        return !availableSizes.includes(size)
    }

    function handleAdd() {
        if (!selectedSize || isSizeUnavailable(selectedSize)) return
        const maxStock = getMaxStock(selectedSize)
        const cartQty = getCartQty(selectedSize)
        if (cartQty >= maxStock) return
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            size: selectedSize,
            color: selectedColor,
            images: product.images,
            maxStock,
        })
        setAdded(true)
        openCart()
        setTimeout(() => setAdded(false), 2000)
    }

    const maxStock = getMaxStock(selectedSize)
    const cartQty = getCartQty(selectedSize)
    const isAtMax = selectedSize ? cartQty >= maxStock : false
    const sizeUnavailable = selectedSize ? isSizeUnavailable(selectedSize) : false
    const cannotAdd = isSold || isAtMax || sizeUnavailable
    const hasImages = product.images?.length > 0

    return (
        <div className="min-h-screen bg-cream">

            <div className="px-4 sm:px-10 pt-4 sm:pt-8">
                <button onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-taupe hover:text-gold transition-colors font-sans text-xs uppercase tracking-wider">
                    <ChevronLeft size={14} /> Retour
                </button>
            </div>

            <div className="mx-auto max-w-7xl px-0 sm:px-10 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16">

                    {/* ── PHOTOS ── */}
                    <div>
                        <div className="relative w-full aspect-square sm:aspect-[3/4] sm:rounded-2xl overflow-hidden bg-beige flex items-center justify-center">
                            {hasImages ? (
                                <Image src={product.images[selectedImage]} alt={product.name} fill
                                    className={cn('object-cover', isSold && 'grayscale opacity-70')} priority />
                            ) : (
                                <span className="text-8xl opacity-30 select-none">👗</span>
                            )}

                            {isSold ? (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <span className="bg-white text-brown font-sans text-sm font-bold uppercase tracking-widest px-6 py-2.5 rounded-full shadow">
                                        Vendu
                                    </span>
                                </div>
                            ) : product.tags?.[0] && (
                                <span className="absolute top-3 left-3 bg-gold text-white text-[0.6rem] uppercase tracking-wider px-3 py-1 rounded-full font-sans font-medium">
                                    {product.tags[0]}
                                </span>
                            )}

                            <button onClick={() => setWished(v => !v)}
                                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center z-10">
                                <Heart size={15} className={wished ? 'fill-rose-deep text-rose-deep' : 'text-brown-light'} />
                            </button>
                        </div>

                        {hasImages && product.images.length > 1 && (
                            <div className="flex gap-2 px-4 sm:px-0 mt-3 overflow-x-auto pb-1">
                                {product.images.map((url, i) => (
                                    <button key={i} onClick={() => setSelectedImage(i)}
                                        className={cn('relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                                            selectedImage === i ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
                                        )}>
                                        <Image src={url} alt="" fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── INFOS ── */}
                    <div className="px-4 sm:px-0 pt-5 sm:pt-0 flex flex-col">
                        <p className="font-sans text-[0.65rem] tracking-[0.15em] uppercase text-gold mb-1">{product.category}</p>
                        <h1 className={cn('font-serif text-2xl sm:text-4xl font-light leading-tight mb-2', isSold ? 'text-gray-400' : 'text-brown')}>
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-2 mb-4">
                            <Stars rating={5} />
                            <span className="font-sans text-xs text-taupe">(avis clients)</span>
                        </div>

                        <div className="flex items-baseline gap-3 mb-5">
                            <span className={cn('font-serif text-2xl sm:text-3xl font-semibold', isSold ? 'text-gray-400 line-through' : 'text-brown')}>
                                {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && !isSold && (
                                <span className="font-sans text-base text-taupe line-through">{formatPrice(product.originalPrice)}</span>
                            )}
                        </div>

                        {product.description && (
                            <p className="font-sans text-brown-light leading-relaxed text-sm mb-5 pb-5 border-b border-beige">
                                {product.description}
                            </p>
                        )}

                        {/* Couleurs */}
                        {product.colors?.length > 0 && (
                            <div className="mb-4">
                                <p className="font-sans text-xs uppercase tracking-wider text-taupe mb-2">
                                    Couleur — <span className="text-brown font-medium">{selectedColor}</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map(color => (
                                        <button key={color} onClick={() => setSelectedColor(color)}
                                            className={cn('px-4 py-2 rounded-full border font-sans text-xs transition-all',
                                                selectedColor === color ? 'border-gold bg-gold text-white' : 'border-gold-light text-taupe hover:border-gold'
                                            )}>
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tailles */}
                        {allSizes.length > 0 && (
                            <div className="mb-6">
                                <p className="font-sans text-xs uppercase tracking-wider text-taupe mb-2">
                                    Taille {selectedSize && !isSizeUnavailable(selectedSize) && (
                                        <span>— <span className="text-brown font-medium">{selectedSize}</span></span>
                                    )}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {allSizes.map(size => {
                                        const unavailable = isSizeUnavailable(size)
                                        const sizeCartQty = getCartQty(size)
                                        const sizeMax = getMaxStock(size)
                                        const sizeAtMax = !unavailable && sizeCartQty >= sizeMax
                                        const isSelected = selectedSize === size

                                        return (
                                            <button key={size}
                                                onClick={() => { if (!unavailable) setSelectedSize(size) }}
                                                disabled={unavailable}
                                                title={unavailable ? 'Taille épuisée' : `${sizeMax} unité${sizeMax > 1 ? 's' : ''} dispo`}
                                                className={cn(
                                                    'relative w-12 h-10 rounded-lg border font-sans text-xs font-medium transition-all',
                                                    unavailable
                                                        ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'border-gold bg-gold text-white'
                                                            : 'border-gold-light text-taupe hover:border-gold',
                                                    sizeAtMax && !isSelected && 'opacity-50'
                                                )}>
                                                {size}
                                                {/* Trait diagonal épuisée */}
                                                {unavailable && (
                                                    <svg className="absolute inset-0 w-full h-full rounded-lg overflow-hidden" viewBox="0 0 48 40" preserveAspectRatio="none">
                                                        <line x1="4" y1="36" x2="44" y2="4" stroke="#d1d5db" strokeWidth="1.5" />
                                                    </svg>
                                                )}
                                                {sizeAtMax && !unavailable && (
                                                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 rounded-full" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>

                                {selectedSize && (
                                    <p className="font-sans text-[0.65rem] text-taupe mt-2">
                                        {isSizeUnavailable(selectedSize)
                                            ? <span className="text-gray-400 italic">Cette taille est épuisée</span>
                                            : isAtMax
                                                ? <span className="text-amber-500 font-medium">⚠️ Stock max atteint pour cette taille</span>
                                                : <span>{maxStock - cartQty} unité{maxStock - cartQty > 1 ? 's' : ''} disponible{maxStock - cartQty > 1 ? 's' : ''}</span>
                                        }
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Bouton */}
                        {isSold ? (
                            <div className="w-full flex items-center justify-center py-4 rounded-xl bg-gray-100 font-sans text-xs uppercase tracking-widest text-gray-400 mb-4">
                                Vendu — Plus de stock disponible
                            </div>
                        ) : (
                            <button onClick={handleAdd} disabled={cannotAdd}
                                className={cn(
                                    'w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-sans text-xs uppercase tracking-widest transition-colors mb-4',
                                    added ? 'bg-green-600' :
                                        sizeUnavailable ? 'bg-gray-300 cursor-not-allowed' :
                                            isAtMax ? 'bg-gray-300 cursor-not-allowed' :
                                                'bg-gold hover:bg-rose-deep'
                                )}>
                                <ShoppingBag size={16} />
                                {added
                                    ? '✓ Ajouté au panier !'
                                    : sizeUnavailable
                                        ? 'Taille épuisée'
                                        : isAtMax
                                            ? 'Stock max atteint'
                                            : 'Ajouter au panier'}
                            </button>
                        )}

                        {/* Infos boutique */}
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { icon: '📦', label: 'Livraison Guyane' },
                                { icon: '🏪', label: 'Retrait boutique' },
                                { icon: '✂', label: 'Retouches possibles' },
                                { icon: '🔒', label: 'Paiement sécurisé' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2 bg-beige/50 rounded-lg px-3 py-2">
                                    <span className="text-sm">{item.icon}</span>
                                    <span className="font-sans text-[0.6rem] text-brown-light uppercase tracking-wide">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}