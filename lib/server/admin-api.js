import { NextResponse } from 'next/server'
import { getAdmin } from '@/lib/auth'

// Enveloppe une route API : refuse tout appel qui ne vient pas du compte administrateur.
export function adminRoute(handler) {
  return async (request, ctx) => {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    try {
      return await handler(request, ctx, admin)
    } catch (e) {
      console.error('[admin api]', e)
      return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
    }
  }
}
