import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { issueVerification } from '@/lib/server/verification'
import { isAdminEmail } from '@/lib/auth'
import { emailEnabled } from '@/lib/email'

export async function POST(req) {
  try {
    const { name, email: rawEmail, password } = await req.json()
    const email = rawEmail?.toLowerCase().trim()
    if (!name?.trim() || !email || !password)
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 })
    if (password.length < 8)
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères.' }, { status: 400 })

    if (isAdminEmail(email) && !emailEnabled())
      return NextResponse.json({ error: 'Ce compte existe déjà. Connectez-vous.' }, { status: 409 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing?.emailVerified)
      return NextResponse.json({ error: 'Un compte existe déjà avec cet e-mail.' }, { status: 409 })

    const hash = await bcrypt.hash(password, 12)
    const user = existing
      ? await prisma.user.update({ where: { id: existing.id }, data: { name: name.trim(), password: hash } })
      : await prisma.user.create({ data: { name: name.trim(), email, password: hash } })

    const { autoVerified } = await issueVerification(user)
    return NextResponse.json({ success: true, autoVerified })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
