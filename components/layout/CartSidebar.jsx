'use client'

import { useEffect } from 'react'
import { X, Minus, Plus, Trash2, MessageCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, whatsappLink } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function CartSidebar() {
  const { isOpen, items, total, closeCart, updateQty, removeItem } = useCart()

  // Bloque le scroll de la page quand le panier est ouvert
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const orderMessage = `Bonjour Susy Modas 👗\n\nJe souhaite commander :\n${
    items.map((i) => `• ${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n')
  }\n\nTotal : ${formatPrice(total)}\n\nMerci !`

  return (
    <>
      {/* Fond obscurci */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-brown-dark/40 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden
        />
      )}

      {/* Panneau panier */}
      <aside
        role="dialog"
        aria-label="Panier"
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white flex flex-col
          shadow-2xl transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-beige">
          <h2 className="font-serif text-xl text-brown">Mon Panier</h2>
          <button onClick={closeCart} className="text-taupe hover:text-brown transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-taupe">
              <span className="text-5xl">🛍️</span>
              <p className="font-serif text-lg italic">Votre panier est vide</p>
              <Button onClick={closeCart} variant="outline" size="sm">
                Continuer mes achats
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <CartItem key={item.id} item={item} onQtyChange={updateQty} onRemove={removeItem} />
            ))
          )}
        </div>

        {/* Pied de panier */}
        {items.length > 0 && (
          <div className="border-t border-beige px-6 py-5 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="font-sans text-sm text-brown-light uppercase tracking-wider">Total</span>
              <span className="font-serif text-2xl text-brown font-semibold">{formatPrice(total)}</span>
            </div>

            <Button fullWidth size="lg">
              Passer commande
            </Button>

            <a
              href={whatsappLink(orderMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-sm
                bg-[#25D366] text-white font-sans text-xs tracking-[0.12em] uppercase
                font-medium hover:bg-[#1fba57] transition-colors"
            >
              <MessageCircle size={16} />
              Commander via WhatsApp
            </a>

            <p className="text-center text-[0.65rem] text-taupe">
              Livraison en Guyane Française · Paiement sécurisé
            </p>
          </div>
        )}
      </aside>
    </>
  )
}

// ── Composant article ────────────────────────────────────────────────────────
function CartItem({ item, onQtyChange, onRemove }) {
  return (
    <div className="flex gap-4 py-3 border-b border-beige/60 last:border-0">
      <div className="w-16 h-20 rounded-lg bg-cream flex-shrink-0 flex items-center justify-center text-2xl">
        👗
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-serif text-sm text-brown truncate">{item.name}</p>
        {item.size && (
          <p className="font-sans text-[0.65rem] text-taupe mt-0.5">Taille {item.size}</p>
        )}
        <p className="font-sans text-sm font-medium text-gold mt-1">{formatPrice(item.price)}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQtyChange(item.id, item.qty - 1)}
              className="w-6 h-6 rounded bg-beige flex items-center justify-center hover:bg-gold-light transition-colors"
              aria-label="Diminuer"
            >
              <Minus size={12} />
            </button>
            <span className="font-sans text-sm w-4 text-center">{item.qty}</span>
            <button
              onClick={() => onQtyChange(item.id, item.qty + 1)}
              className="w-6 h-6 rounded bg-beige flex items-center justify-center hover:bg-gold-light transition-colors"
              aria-label="Augmenter"
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="text-taupe hover:text-rose-deep transition-colors"
            aria-label="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
