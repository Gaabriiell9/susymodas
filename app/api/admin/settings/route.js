import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminRoute } from '@/lib/server/admin-api'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export const PUT = adminRoute(async (request) => {
  const b = await request.json()
  const num = (v, d) => (Number.isFinite(parseFloat(v)) && parseFloat(v) >= 0 ? Math.round(parseFloat(v) * 100) / 100 : d)
  const data = {
    shippingCost: num(b.shippingCost, 8),
    freeShippingThreshold: b.freeShippingThreshold === '' || b.freeShippingThreshold === null ? null : num(b.freeShippingThreshold, null),
    storeAddress: String(b.storeAddress ?? '').trim().slice(0, 200) || 'Kourou, Guyane française',
    storeHours: String(b.storeHours ?? '').trim().slice(0, 200),
    whatsapp: String(b.whatsapp ?? '').replace(/\D/g, '').slice(0, 15),
    announcement: String(b.announcement ?? '').trim().slice(0, 160),
  }
  const settings = await prisma.storeSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } })
  revalidatePath('/', 'layout')
  return NextResponse.json({ settings })
})
