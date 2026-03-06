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
    const { addItem } = useCart()
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? null)
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [wished, setWished] = useState(false)
    const [added, setAdded] = useState(false)

    function handleAdd() {
        addItem({ id: product.id, name: product.name, price: product.price, size: selectedSize, color: selectedColor, images: product.images })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    const hasImages = product.images?.length > 0

    return (
        <div className="min-h-screen bg-cream">

            {/* Retour */}
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
                                <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" priority />
                            ) : (
                                <span className="text-8xl opacity-30 select-none">👗</span>
                            )}

                            {product.tags?.[0] && (
                                <span className="absolute top-3 left-3 bg-gold text-white text-[0.6rem] uppercase tracking-wider px-3 py-1 rounded-full font-sans font-medium">
                                    {product.tags[0]}
                                </span>
                            )}

                            <button onClick={() => setWished(v => !v)}
                                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center">
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
                        <h1 className="font-serif text-2xl sm:text-4xl text-brown font-light leading-tight mb-2">{product.name}</h1>

                        <div className="flex items-center gap-2 mb-4">
                            <Stars rating={5} />
                            <span className="font-sans text-xs text-taupe">(avis clients)</span>
                        </div>

                        <div className="flex items-baseline gap-3 mb-5">
                            <span className="font-serif text-2xl sm:text-3xl text-brown font-semibold">{formatPrice(product.price)}</span>
                            {product.originalPrice && (
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
                        {product.sizes?.length > 0 && (
                            <div className="mb-6">
                                <p className="font-sans text-xs uppercase tracking-wider text-taupe mb-2">
                                    Taille — <span className="text-brown font-medium">{selectedSize}</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map(size => (
                                        <button key={size} onClick={() => setSelectedSize(size)}
                                            className={cn('w-12 h-10 rounded-lg border font-sans text-xs font-medium transition-all',
                                                selectedSize === size ? 'border-gold bg-gold text-white' : 'border-gold-light text-taupe hover:border-gold'
                                            )}>
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bouton */}
                        <button onClick={handleAdd}
                            className={cn('w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-sans text-xs uppercase tracking-widest transition-colors mb-4',
                                added ? 'bg-green-600' : 'bg-gold hover:bg-rose-deep'
                            )}>
                            <ShoppingBag size={16} />
                            {added ? '✓ Ajouté au panier !' : 'Ajouter au panier'}
                        </button>

                        {/* Infos */}
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