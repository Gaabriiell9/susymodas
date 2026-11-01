import { NextResponse } from 'next/server'
import { adminRoute } from '@/lib/server/admin-api'
import { uploadImage } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export const POST = adminRoute(async (request) => {
  const form = await request.formData()
  const files = form.getAll('files').filter((f) => typeof f === 'object' && f.size > 0).slice(0, 10)
  if (!files.length) return NextResponse.json({ error: 'Aucune image reçue' }, { status: 400 })
  const urls = []
  for (const file of files) urls.push(await uploadImage(file))
  return NextResponse.json({ urls })
})
