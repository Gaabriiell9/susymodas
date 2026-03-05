// app/api/auth/route.js
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createToken, COOKIE_NAME } from '@/lib/auth'

export const dynamic = 'force-dynamic'
// ── POST /api/auth  →  Login ──────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const token = await createToken({ adminId: admin.id, email: admin.email, name: admin.name })

    const response = NextResponse.json({ success: true, admin: { id: admin.id, name: admin.name, email: admin.email } })

    // Set cookie HTTP-only sécurisé
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[POST /api/auth]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ── DELETE /api/auth  →  Logout ───────────────────────────────────────────────
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}