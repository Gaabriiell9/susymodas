// lib/generateReceipt.js
// Générateur PDF partagé — utilisé sur /commande/succes et /compte/commandes

export async function imageToBase64(url) {
    try {
        const res = await fetch(url)
        const blob = await res.blob()
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
        })
    } catch { return null }
}

function formatPrice(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

/**
 * Génère et télécharge un reçu PDF A5.
 * @param {object} order  - { reference, createdAt, firstName, lastName, email, phone, address, totalAmount, items[] }
 * @param {boolean} isRetrait
 */
export async function generateReceipt(order, isRetrait) {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a5' })

    const W = 148
    const M = 14
    const CW = W - M * 2
    let y = 0

    const GOLD = [185, 148, 88]
    const BROWN = [58, 37, 22]
    const TAUPE = [130, 110, 95]
    const BEIGE = [248, 243, 236]
    const WHITE = [255, 255, 255]
    const LGRAY = [245, 243, 240]

    // ── HEADER
    doc.setFillColor(...GOLD)
    doc.rect(0, 0, W, 22, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...WHITE)
    doc.text('Susy Modas', W / 2, 11, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(240, 220, 180)
    doc.text('EVANGELICAS  \u00B7  KOUROU  \u00B7  GUYANE', W / 2, 17, { align: 'center' })

    y = 28

    // ── TITRE
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...BROWN)
    doc.text(isRetrait ? 'BON DE RETRAIT' : 'RECU DE COMMANDE', W / 2, y, { align: 'center' })
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.5)
    doc.line(W / 2 - 24, y + 2.5, W / 2 + 24, y + 2.5)

    y += 9

    // ── RÉFÉRENCE + DATE
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...BROWN)
    doc.text(order.reference, M, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...TAUPE)
    doc.text(formatDate(order.createdAt), W - M, y, { align: 'right' })
    doc.setDrawColor(220, 213, 203)
    doc.setLineWidth(0.2)
    doc.line(M, y + 3, W - M, y + 3)

    y += 9

    // ── CLIENT
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...BROWN)
    doc.text(`${order.firstName} ${order.lastName}`, M, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...TAUPE)
    doc.text(order.email || '', M, y + 5)
    doc.text(order.phone || '', W - M, y + 5, { align: 'right' })
    doc.setDrawColor(220, 213, 203)
    doc.setLineWidth(0.2)
    doc.line(M, y + 9, W - M, y + 9)

    y += 15

    // ── MODE
    doc.setFillColor(...BEIGE)
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.4)
    doc.roundedRect(M, y, CW, 11, 1.5, 1.5, 'FD')
    doc.setFillColor(...GOLD)
    doc.roundedRect(M, y, 2.5, 11, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...GOLD)
    doc.text(isRetrait ? 'Retrait en boutique  -  Kourou, Guyane' : 'Livraison a domicile', M + 6, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...TAUPE)
    doc.text(isRetrait ? 'Sur presentation de ce recu' : (order.address || ''), M + 6, y + 9)

    y += 17

    // ── TABLEAU ARTICLES
    doc.setFillColor(...BROWN)
    doc.rect(M, y, CW, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(...WHITE)
    const cNom = M + 17
    const cTail = M + CW * 0.60
    const cQte = M + CW * 0.74
    const cPrix = M + CW - 1
    doc.text('ARTICLE', cNom, y + 4.8)
    doc.text('TAILLE', cTail, y + 4.8)
    doc.text('QTE', cQte, y + 4.8)
    doc.text('PRIX', cPrix, y + 4.8, { align: 'right' })
    y += 7

    for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i]
        const rowH = 16
        doc.setFillColor(...(i % 2 === 0 ? WHITE : LGRAY))
        doc.rect(M, y, CW, rowH, 'F')
        doc.setDrawColor(228, 220, 210)
        doc.setLineWidth(0.15)
        doc.line(M, y + rowH, M + CW, y + rowH)

        // Image — compatible objet { images: [] } ou { image: '' }
        const imgUrl = item.image || item.product?.images?.[0] || null
        if (imgUrl) {
            try {
                const b64 = await imageToBase64(imgUrl)
                if (b64) doc.addImage(b64, 'JPEG', M + 1, y + 1, 13, 14)
            } catch { }
        }

        const name = item.name || item.product?.name || 'Article'
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(...BROWN)
        doc.text(doc.splitTextToSize(name, 55)[0], cNom, y + 7)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...TAUPE)
        doc.text(item.size || '-', cTail, y + 7)
        doc.text(`x${item.quantity}`, cQte, y + 7)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(...BROWN)
        doc.text(formatPrice(item.price * item.quantity), cPrix, y + 7, { align: 'right' })

        y += rowH
    }

    y += 5

    // ── TOTAL
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.3)
    doc.line(M, y, W - M, y)
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...TAUPE)
    doc.text('TOTAL PAYE', M, y)
    doc.setFontSize(11)
    doc.setTextColor(...BROWN)
    doc.text(formatPrice(order.totalAmount), W - M, y, { align: 'right' })
    y += 8

    // ── MESSAGE RETRAIT
    if (isRetrait) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(...TAUPE)
        doc.text('Presentez ce document a la boutique Susy Modas pour retirer votre commande.', W / 2, y, { align: 'center' })
        y += 5
    }

    // ── FOOTER
    const footerY = 207
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.3)
    doc.line(M, footerY - 3, W - M, footerY - 3)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...TAUPE)
    doc.text('susymodas.com  \u00B7  Kourou, Guyane  \u00B7  Paiement securise par Stripe', W / 2, footerY + 2, { align: 'center' })

    doc.save(`recu-${order.reference}.pdf`)
}