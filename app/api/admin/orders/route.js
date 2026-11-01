import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminRoute } from '@/lib/server/admin-api'

export const dynamic = 'force-dynamic'

export const GET = adminRoute(async (request) => {
  const status = new URL(request.url).searchParams.get('status')
  const orders = await prisma.order.findMany({
    where: status ? { status } : { status: { not: 'PENDING' } },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json({ orders })
})
