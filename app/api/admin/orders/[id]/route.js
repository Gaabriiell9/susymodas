import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminRoute } from '@/lib/server/admin-api'

export const dynamic = 'force-dynamic'

const STATUSES = ['CONFIRMED', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export const PATCH = adminRoute(async (request, { params }) => {
  const { status } = await request.json()
  if (!STATUSES.includes(status)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  const order = await prisma.order.update({ where: { id: parseInt((await params).id, 10) }, data: { status } })
  return NextResponse.json({ order })
})
