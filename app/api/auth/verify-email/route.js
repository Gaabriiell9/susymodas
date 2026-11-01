import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const { email: rawEmail, code } = await req.json()
    const email = rawEmail?.toLowerCase().trim()
    if (!email || !code) return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 })

    const token = `${email}:${String(code).trim()}`
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email, token, expires: { gt: new Date() } },
    })
    if (!record) return NextResponse.json({ error: 'Code invalide ou expiré.' }, { status: 400 })

    await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } })
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[verify-email]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
