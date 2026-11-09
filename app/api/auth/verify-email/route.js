import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { tooManyAttempts, recordFailure, clearFailures } from '@/lib/server/rate-limit'

export async function POST(req) {
  try {
    const { email: rawEmail, code } = await req.json()
    const email = rawEmail?.toLowerCase().trim()
    if (!email || !code) return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 })

    if (await tooManyAttempts('verify', email, 5)) {
      await prisma.verificationToken.deleteMany({ where: { identifier: email } })
      return NextResponse.json({ error: 'Trop de tentatives. Demandez un nouveau code dans 15 minutes.' }, { status: 429 })
    }

    const token = `${email}:${String(code).trim()}`
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email, token, expires: { gt: new Date() } },
    })
    if (!record) {
      await recordFailure('verify', email)
      return NextResponse.json({ error: 'Code invalide ou expiré.' }, { status: 400 })
    }

    await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } })
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    await clearFailures('verify', email)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[verify-email]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
