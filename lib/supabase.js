import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Upload une image dans le bucket "products"
 * Retourne l'URL publique de l'image
 */
export async function uploadProductImage(file, productSlug) {
    const ext = file.name.split('.').pop()
    const fileName = `${productSlug}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
        .from('products')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (error) throw error

    const { data } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

    return data.publicUrl
}

/**
 * Supprime une image du bucket
 */
export async function deleteProductImage(url) {
    const fileName = url.split('/').pop()
    await supabase.storage.from('products').remove([fileName])
}