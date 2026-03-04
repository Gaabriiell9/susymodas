// app/api/orders/[id]/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
export async function GET(_, { params }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id: parseInt(params.id) },
    include: { items: { include: { product: true } } },
  })
  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  return NextResponse.json({ order })
}

// ── PATCH /api/orders/:id ─────────────────────────────────────────────────────
// Met à jour le statut d'une commande
export async function PATCH(request, { params }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { status } = await request.json()
  const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id: parseInt(params.id) },
    data:  { status },
  })
  return NextResponse.json({ order })
}
