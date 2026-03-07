'use client'

import { useEffect, useState, useCallback } from 'react'
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

// Convertit une URL image en base64
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
    const margin = 18
    const contentW = W - margin * 2
    let y = 0

    // ── Couleurs
    const GOLD = [201, 169, 110]
    const BROWN = [74, 50, 35]
    const TAUPE = [140, 120, 100]
    const BEIGE = [250, 245, 238]
    const WHITE = [255, 255, 255]
    const GREEN = [34, 197, 94]

    // ── HEADER bande dorée
    doc.setFillColor(...GOLD)
    doc.rect(0, 0, W, 38, 'F')

    // Logo cercle
    doc.setFillColor(...WHITE)
    doc.circle(W / 2, 19, 12, 'F')
    doc.setTextColor(...GOLD)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('SM', W / 2, 20.5, { align: 'center' })

    // Nom boutique
    doc.setTextColor(...WHITE)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Susy Modas', W / 2, 30, { align: 'center' })
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(240, 225, 195)
    doc.text('ÉVANGÉLICAS  ·  KOUROU  ·  GUYANE', W / 2, 35, { align: 'center' })

    y = 48

    // ── TITRE REÇU
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BROWN)
    const title = isRetrait ? 'BON DE RETRAIT EN BOUTIQUE' : 'REÇU DE COMMANDE'
    doc.text(title, W / 2, y, { align: 'center' })

    // Ligne décorative sous titre
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.5)
    const titleW = doc.getTextWidth(title)
    doc.line(W / 2 - titleW / 2, y + 2, W / 2 + titleW / 2, y + 2)

    y += 12

    // ── INFOS COMMANDE (2 colonnes)
    doc.setFillColor(...BEIGE)
    doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...TAUPE)
    doc.text('RÉFÉRENCE', margin + 5, y + 7)
    doc.text('DATE', margin + contentW / 2 + 5, y + 7)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BROWN)
    doc.text(order.reference, margin + 5, y + 15)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(order.createdAt), margin + contentW / 2 + 5, y + 15)

    // Ligne verticale séparatrice
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.3)
    doc.line(margin + contentW / 2, y + 4, margin + contentW / 2, y + 18)

    y += 30

    // ── CLIENT
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...TAUPE)
    doc.text('CLIENT', margin, y)
    y += 5

    doc.setDrawColor(...BEIGE)
    doc.setFillColor(...BEIGE)
    doc.roundedRect(margin, y, contentW, 20, 3, 3, 'F')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BROWN)
    doc.text(`${order.firstName} ${order.lastName}`, margin + 5, y + 8)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TAUPE)
    doc.text(order.email || '', margin + 5, y + 14)
    doc.text(order.phone || '', margin + contentW - 5, y + 14, { align: 'right' })

    y += 28

    // ── MODE RETRAIT / LIVRAISON
    const modeColor = isRetrait ? GOLD : [59, 130, 246]
    doc.setDrawColor(...modeColor)
    doc.setFillColor(...(isRetrait ? [255, 251, 240] : [239, 246, 255]))
    doc.setLineWidth(0.8)
    doc.roundedRect(margin, y, contentW, 16, 3, 3, 'FD')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...modeColor)
    doc.text(isRetrait ? '🏪  Retrait en boutique' : '🚚  Livraison à domicile', margin + 5, y + 7)

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TAUPE)
    doc.text(
        isRetrait ? 'Boutique Susy Modas · Kourou, Guyane · Sur présentation de ce reçu' : (order.address || ''),
        margin + 5, y + 13
    )

    y += 24

    // ── ARTICLES
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...TAUPE)
    doc.text('ARTICLES', margin, y)
    y += 5

    // En-tête tableau
    doc.setFillColor(...BROWN)
    doc.roundedRect(margin, y, contentW, 8, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WHITE)
    doc.text('ARTICLE', margin + 22, y + 5)
    doc.text('TAILLE', margin + contentW * 0.55, y + 5)
    doc.text('QTÉ', margin + contentW * 0.72, y + 5)
    doc.text('PRIX', margin + contentW - 3, y + 5, { align: 'right' })
    y += 10

    // Lignes articles
    for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i]
        const rowH = 18
        const bg = i % 2 === 0 ? WHITE : BEIGE

        doc.setFillColor(...bg)
        doc.rect(margin, y, contentW, rowH, 'F')

        // Image produit
        if (item.image) {
            try {
                const b64 = await imageToBase64(item.image)
                if (b64) {
                    doc.addImage(b64, 'JPEG', margin + 1, y + 1, 14, 16)
                }
            } catch { }
        }

        // Nom produit
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...BROWN)
        doc.text(item.name, margin + 22, y + 7)

        // Taille
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...TAUPE)
        doc.text(item.size || '—', margin + contentW * 0.55, y + 7)

        // Qty
        doc.text(`×${item.quantity}`, margin + contentW * 0.72, y + 7)

        // Prix
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...BROWN)
        doc.text(formatPrice(item.price * item.quantity), margin + contentW - 3, y + 7, { align: 'right' })

        y += rowH
    }

    // Ligne séparatrice
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.4)
    doc.line(margin, y + 2, margin + contentW, y + 2)
    y += 8

    // ── TOTAL
    doc.setFillColor(...BROWN)
    doc.roundedRect(margin, y, contentW, 14, 3, 3, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WHITE)
    doc.text('TOTAL PAYÉ', margin + 5, y + 9)
    doc.setFontSize(13)
    doc.setTextColor(...GOLD)
    doc.text(formatPrice(order.totalAmount), margin + contentW - 5, y + 9.5, { align: 'right' })
    y += 20

    // ── BADGE PAIEMENT CONFIRMÉ
    doc.setFillColor(220, 252, 231)
    doc.roundedRect(margin, y, contentW, 10, 3, 3, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text('✓  Paiement confirmé par Stripe', W / 2, y + 6.5, { align: 'center' })
    y += 16

    // ── MESSAGE RETRAIT
    if (isRetrait) {
        doc.setFillColor(255, 251, 235)
        doc.setDrawColor(...GOLD)
        doc.setLineWidth(0.5)
        doc.roundedRect(margin, y, contentW, 16, 3, 3, 'FD')
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...BROWN)
        doc.text('📍  Présentez ce document en boutique pour retirer votre commande', W / 2, y + 7, { align: 'center' })
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...TAUPE)
        doc.text('Boutique Susy Modas · Kourou, Guyane', W / 2, y + 13, { align: 'center' })
        y += 22
    }

    // ── FOOTER
    doc.setFillColor(...GOLD)
    doc.rect(0, 285, W, 12, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...WHITE)
    doc.text('susymodas.com  ·  Boutique de robes chrétiennes  ·  Kourou, Guyane', W / 2, 292, { align: 'center' })

    doc.save(`recu-${order.reference}.pdf`)
}

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
            .then(data => {
                if (data.error) setError(data.error)
                else setOrder(data.order)
            })
            .catch(() => setError('Erreur de chargement'))
            .finally(() => setLoading(false))
    }, [sessionId])

    const isRetrait = !order?.address || order.address.includes('Retrait')

    async function handleDownload() {
        if (!order) return
        setGenerating(true)
        try {
            await generatePDF(order, isRetrait)
        } catch (e) {
            console.error(e)
            alert('Erreur lors de la génération du PDF.')
        } finally {
            setGenerating(false)
        }
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

                {/* Header succès */}
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

                {/* Aperçu commande */}
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

                    {/* Mode */}
                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4 ${isRetrait ? 'bg-gold/10' : 'bg-blue-50'}`}>
                        {isRetrait ? <Store size={16} className="text-gold" /> : <Truck size={16} className="text-blue-500" />}
                        <p className="font-sans text-xs font-medium text-brown">
                            {isRetrait ? 'Retrait en boutique — Kourou' : order.address}
                        </p>
                    </div>

                    {/* Articles */}
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

                {/* Boutons */}
                <div className="space-y-3">
                    <button onClick={handleDownload} disabled={generating}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold text-white rounded-xl font-sans text-xs uppercase tracking-widest hover:bg-rose-deep transition-colors disabled:opacity-60">
                        {generating
                            ? <><Loader2 size={15} className="animate-spin" /> Génération…</>
                            : <><Download size={15} /> {isRetrait ? 'Télécharger mon bon de retrait' : 'Télécharger mon reçu'}</>
                        }
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