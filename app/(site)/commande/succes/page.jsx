import Link from 'next/link'

export default function SuccesPage() {
    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-6"></div>
                <h1 className="font-serif text-3xl text-brown mb-4">
                    Commande confirmée !
                </h1>
                <p className="font-sans text-brown-light text-sm leading-relaxed mb-8">
                    Merci pour votre commande. Vous recevrez une confirmation par email très prochainement. Nous vous contacterons sur WhatsApp pour organiser la livraison.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-8 py-3 bg-gold text-white font-sans text-xs uppercase tracking-widest rounded-lg hover:bg-rose-deep transition-colors"
                >
                    Retour à la boutique
                </Link>
            </div>
        </div>
    )
}