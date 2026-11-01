import prisma from '@/lib/prisma'
import { deriveStock } from '@/lib/catalog'
import { getSettings } from '@/lib/settings'
import { sendOrderConfirmation, sendAdminNewOrder } from '@/lib/email'
import { ADMIN_EMAIL } from '@/lib/auth'

// Marque la commande payée et décrémente le stock UNE SEULE FOIS (idempotent : webhook + page succès).
export async function markOrderPaid(orderId) {
  const result = await prisma.$transaction(async (tx) => {
    // Verrou logique : seule la première exécution passe stockDecremented de false à true
    const claimed = await tx.order.updateMany({
      where: { id: orderId, stockDecremented: false },
      data: { stockDecremented: true, status: 'CONFIRMED', paidAt: new Date() },
    })
    if (claimed.count === 0) return null

    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } })
    for (const item of order.items) {
      if (!item.productId) continue
      const product = await tx.product.findUnique({ where: { id: item.productId } })
      if (!product) continue
      const ss = { ...(product.sizeStock ?? {}) }
      const key = item.size && ss[item.size] !== undefined ? item.size : Object.keys(ss).length === 1 ? Object.keys(ss)[0] : null
      if (key) ss[key] = Math.max(0, (ss[key] ?? 0) - item.quantity)
      const derived = deriveStock(ss)
      await tx.product.update({
        where: { id: product.id },
        data: { sizeStock: derived.sizeStock, stock: derived.stock },
      })
    }
    return order
  })

  if (result) {
    const settings = await getSettings()
    await sendOrderConfirmation(result, settings)
    await sendAdminNewOrder(result, ADMIN_EMAIL)
  }
  return result
}
