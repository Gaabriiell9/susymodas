'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Download, Store, Truck, Loader2 } from 'lucide-react'

function formatPrice(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

async function imageToBase64(url) {
    try {
        const res = await fetch(url)
        const blob = await res.blob()
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
        })
    } catch {
        return null
    }
}

async function generatePDF(order, isRetrait) {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    const W = 210
    const M = 16          // margin gauche/droite
    const CW = W - M * 2  // content width = 178mm
    let y = 0

    // Palette
    const GOLD = [185, 148, 88]
    const BROWN = [62, 39, 24]
    const TAUPE = [130, 110, 95]
    const BEIGE = [248, 243, 236]
    const WHITE = [255, 255, 255]
    const LGRAY = [245, 245, 245]

    // ─────────────────────────────────────────
    // HEADER
    // ─────────────────────────────────────────
    doc.setFillColor(...GOLD)
    doc.rect(0, 0, W, 32, 'F')

    // Nom boutique centré
    doc.setTextColor(...WHITE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('Susy Modas', W / 2, 14, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(240, 220, 180)
    doc.text('EVANGELICAS  \u00B7  KOUROU  \u00B7  GUYANE', W / 2, 21, { align: 'center' })

    // Ligne de séparation fine sous le header
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.3)
    doc.line(0, 32, W, 32)

    y = 42

    // ─────────────────────────────────────────
    // TITRE DU DOCUMENT
    // ─────────────────────────────────────────
    const title = isRetrait ? 'BON DE RETRAIT EN BOUTIQUE' : 'RECU DE COMMANDE'
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...BROWN)
    doc.text(title, W / 2, y, { align: 'center' })

    // Trait décoratif doré sous le titre
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.8)
    doc.line(W / 2 - 38, y + 3, W / 2 + 38, y + 3)

    y += 13

    // ─────────────────────────────────────────
    // RÉFÉRENCE + DATE
    // ─────────────────────────────────────────
    doc.setFillColor(...BEIGE)
    doc.roundedRect(M, y, CW, 20, 2, 2, 'F')

    // Col gauche — Référence
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...TAUPE)
    doc.text('REFERENCE', M + 6, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...BROWN)
    doc.text(order.reference, M + 6, y + 15)

    // Séparateur vertical
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.3)
    doc.line(M + CW / 2, y + 4, M + CW / 2, y + 16)

    // Col droite — Date
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...TAUPE)
    doc.text('DATE', M + CW / 2 + 6, y + 6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...BROWN)
    doc.text(formatDate(order.createdAt), M + CW / 2 + 6, y + 15)

    y += 27

    // ─────────────────────────────────────────
    // CLIENT
    // ─────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...TAUPE)
    doc.text('CLIENT', M, y)
    y += 4

    doc.setFillColor(...BEIGE)
    doc.roundedRect(M, y, CW, 21, 2, 2, 'F')

    // Accent doré à gauche
    doc.setFillColor(...GOLD)
    doc.roundedRect(M, y, 3, 21, 1, 1, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...BROWN)
    doc.text(`${order.firstName} ${order.lastName}`, M + 8, y + 8)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...TAUPE)
    doc.text(order.email || '', M + 8, y + 15)
    doc.text(order.phone || '', M + CW - 4, y + 15, { align: 'right' })

    y += 28

    // ─────────────────────────────────────────
    // MODE (retrait / livraison) — sans emoji
    // ─────────────────────────────────────────
    doc.setFillColor(isRetrait ? 255 : 239, isRetrait ? 251 : 246, isRetrait ? 235 : 255)
    doc.setDrawColor(...(isRetrait ? GOLD : [147, 197, 253]))
    doc.setLineWidth(0.6)
    doc.roundedRect(M, y, CW, 16, 2, 2, 'FD')

    // Icone carré coloré (remplacement emoji)
    doc.setFillColor(...(isRetrait ? GOLD : [59, 130, 246]))
    doc.roundedRect(M + 5, y + 4, 8, 8, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(...WHITE)
    doc.text(isRetrait ? 'BTQ' : 'LIV', M + 9, y + 9.5, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...(isRetrait ? GOLD : [37, 99, 235]))
    doc.text(isRetrait ? 'Retrait en boutique' : 'Livraison a domicile', M + 17, y + 8)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...TAUPE)
    doc.text(
        isRetrait ? 'Boutique Susy Modas - Kourou, Guyane - Sur presentation de ce recu' : (order.address || ''),
        M + 17, y + 13.5
    )

    y += 22

    // ─────────────────────────────────────────
    // TABLEAU ARTICLES
    // ─────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...TAUPE)
    doc.text('ARTICLES', M, y)
    y += 4

    // En-tête tableau
    doc.setFillColor(...BROWN)
    doc.rect(M, y, CW, 9, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...WHITE)

    const colImg = M + 1
    const colNom = M + 20
    const colTaille = M + CW * 0.56
    const colQte = M + CW * 0.70
    const colPrix = M + CW - 3

    doc.text('ARTICLE', colNom, y + 6)
    doc.text('TAILLE', colTaille, y + 6)
    doc.text('QTE', colQte, y + 6)
    doc.text('PRIX', colPrix, y + 6, { align: 'right' })
    y += 9

    // Lignes articles
    for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i]
        const rowH = 20
        const isEven = i % 2 === 0

        // Fond alternance
        doc.setFillColor(...(isEven ? WHITE : LGRAY))
        doc.rect(M, y, CW, rowH, 'F')

        // Trait séparateur bas
        doc.setDrawColor(230, 225, 218)
        doc.setLineWidth(0.2)
        doc.line(M, y + rowH, M + CW, y + rowH)

        // Image produit
        if (item.image) {
            try {
                const b64 = await imageToBase64(item.image)
                if (b64) doc.addImage(b64, 'JPEG', colImg + 1, y + 1.5, 15, 17)
            } catch { }
        }

        // Nom produit
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(...BROWN)
        const nomTrim = doc.splitTextToSize(item.name, 70)[0]
        doc.text(nomTrim, colNom, y + 9)

        // Taille
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...TAUPE)
        doc.text(item.size || '-', colTaille, y + 9)

        // Quantité
        doc.text(`x${item.quantity}`, colQte, y + 9)

        // Prix
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(...BROWN)
        doc.text(formatPrice(item.price * item.quantity), colPrix, y + 9, { align: 'right' })

        y += rowH
    }

    y += 4

    // ─────────────────────────────────────────
    // TOTAL
    // ─────────────────────────────────────────
    doc.setFillColor(...BROWN)
    doc.roundedRect(M, y, CW, 15, 2, 2, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...WHITE)
    doc.text('TOTAL PAYE', M + 6, y + 9.5)

    doc.setFontSize(14)
    doc.setTextColor(...GOLD)
    doc.text(formatPrice(order.totalAmount), M + CW - 4, y + 10, { align: 'right' })

    y += 20

    // ─────────────────────────────────────────
    // BADGE PAIEMENT CONFIRMÉ — sans emoji
    // ─────────────────────────────────────────
    doc.setFillColor(220, 252, 231)
    doc.roundedRect(M, y, CW, 11, 2, 2, 'F')

    // Coche dessinée manuellement
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(1.2)
    doc.line(M + 8, y + 6, M + 10.5, y + 8.5)
    doc.line(M + 10.5, y + 8.5, M + 15, y + 3.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(22, 163, 74)
    doc.text('Paiement confirme par Stripe', M + 19, y + 7.5)

    y += 16

    // ─────────────────────────────────────────
    // MESSAGE RETRAIT EN BOUTIQUE
    // ─────────────────────────────────────────
    if (isRetrait) {
        doc.setFillColor(255, 251, 235)
        doc.setDrawColor(...GOLD)
        doc.setLineWidth(0.5)
        doc.roundedRect(M, y, CW, 18, 2, 2, 'FD')

        // Pin dessiné manuellement
        doc.setFillColor(...GOLD)
        doc.circle(M + 9, y + 7, 3, 'F')
        doc.setFillColor(255, 251, 235)
        doc.circle(M + 9, y + 7, 1.2, 'F')
        doc.setFillColor(...GOLD)
        doc.triangle(M + 7.2, y + 9.5, M + 10.8, y + 9.5, M + 9, y + 13, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(...BROWN)
        doc.text('Presentez ce document en boutique pour retirer votre commande', M + 16, y + 8)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...TAUPE)
        doc.text('Boutique Susy Modas  -  Kourou, Guyane', M + 16, y + 14)

        y += 22
    }

    // ─────────────────────────────────────────
    // FOOTER
    // ─────────────────────────────────────────
    doc.setFillColor(...GOLD)
    doc.rect(0, 284, W, 13, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...WHITE)
    doc.text('susymodas.com  \u00B7  Boutique de robes chretiennes  \u00B7  Kourou, Guyane', W / 2, 291.5, { align: 'center' })

    doc.save(`recu-${order.reference}.pdf`)
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PAGE
// ─────────────────────────────────────────────────────────────
function SuccesContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!sessionId) { setLoading(false); return }
        fetch(`/api/orders/by-session?session_id=${sessionId}`)
            .then(r => r.json())
            .then(data => { if (data.error) setError(data.error); else setOrder(data.order) })
            .catch(() => setError('Erreur'))
            .finally(() => setLoading(false))
    }, [sessionId])

    const isRetrait = !order?.address || order.address.includes('Retrait')

    async function handleDownload() {
        if (!order) return
        setGenerating(true)
        try { await generatePDF(order, isRetrait) }
        catch (e) { console.error(e); alert('Erreur lors de la génération du PDF.') }
        finally { setGenerating(false) }
    }

    if (loading) return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-gold" />
        </div>
    )

    if (error || !order) return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-5xl mb-4">✅</div>
                <h1 className="font-serif text-3xl text-brown mb-4">Commande confirmée !</h1>
                <p className="font-sans text-brown-light text-sm leading-relaxed mb-8">
                    Merci pour votre commande. Vous recevrez une confirmation par email.
                </p>
                <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-gold text-white font-sans text-xs uppercase tracking-widest rounded-lg hover:bg-rose-deep transition-colors">
                    Retour à la boutique
                </Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-cream py-8 px-4">
            <div className="max-w-lg mx-auto">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h1 className="font-serif text-3xl text-brown mb-2">Commande confirmée !</h1>
                    <p className="font-sans text-brown-light text-sm">
                        {isRetrait
                            ? 'Téléchargez votre bon de retrait et présentez-le en boutique.'
                            : 'Nous vous contacterons pour organiser la livraison.'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-sans text-[0.6rem] uppercase tracking-wider text-taupe">Référence</p>
                            <p className="font-serif text-lg text-brown font-semibold">{order.reference}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-sans text-[0.6rem] uppercase tracking-wider text-taupe">Total payé</p>
                            <p className="font-serif text-xl text-brown font-semibold">{formatPrice(order.totalAmount)}</p>
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4 ${isRetrait ? 'bg-gold/10' : 'bg-blue-50'}`}>
                        {isRetrait ? <Store size={16} className="text-gold" /> : <Truck size={16} className="text-blue-500" />}
                        <p className="font-sans text-xs font-medium text-brown">
                            {isRetrait ? 'Retrait en boutique — Kourou' : order.address}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                {item.image && (
                                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-beige flex-shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover object-top" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-serif text-sm text-brown">{item.name}</p>
                                    {item.size && <p className="font-sans text-xs text-taupe">Taille {item.size}</p>}
                                </div>
                                <p className="font-sans text-sm font-medium text-brown">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={handleDownload} disabled={generating}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold text-white rounded-xl font-sans text-xs uppercase tracking-widest hover:bg-rose-deep transition-colors disabled:opacity-60">
                        {generating
                            ? <><Loader2 size={15} className="animate-spin" /> Génération…</>
                            : <><Download size={15} /> {isRetrait ? 'Télécharger mon bon de retrait' : 'Télécharger mon reçu'}</>}
                    </button>
                    <Link href="/"
                        className="w-full flex items-center justify-center py-3 border border-gray-200 text-brown rounded-xl font-sans text-xs uppercase tracking-widest hover:border-gold transition-colors">
                        Retour à la boutique
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default function SuccesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-gold" />
            </div>
        }>
            <SuccesContent />
        </Suspense>
    )
}