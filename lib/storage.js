// Upload des photos produits dans Supabase Storage (côté serveur uniquement).
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'products'

function client() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant')
  return createClient(url, key, { auth: { persistSession: false } })
}

const ALLOWED = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }

export async function uploadImage(file) {
  const ext = ALLOWED[file.type]
  if (!ext) throw new Error('Format non accepté (JPG, PNG, WEBP, AVIF)')
  if (file.size > 8 * 1024 * 1024) throw new Error('Image trop lourde (8 Mo max)')

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const supabase = client()
  const bytes = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage.from(BUCKET).upload(name, bytes, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl
}

export async function deleteImages(urls = []) {
  const names = urls
    .filter((u) => typeof u === 'string' && u.includes(`/storage/v1/object/public/${BUCKET}/`))
    .map((u) => u.split(`/${BUCKET}/`).pop())
  if (!names.length) return
  try {
    await client().storage.from(BUCKET).remove(names)
  } catch (e) {
    console.error('[storage] suppression', e.message)
  }
}
