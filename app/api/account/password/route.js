import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { tooManyAttempts, recordFailure, clearFailures } from '@/lib/server/rate-limit'

export async function POST(request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  const { current, next } = await request.json()
  if (!next || next.length < 8) return NextResponse.json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères.' }, { status: 400 })
  if (await tooManyAttempts('password', session.user.id, 5))
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, { status: 429 })
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.password && !(await bcrypt.compare(current ?? '', user.password))) {
    await recordFailure('password', session.user.id)
    return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 })
  }
  await clearFailures('password', session.user.id)
  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(next, 12) } })
  return NextResponse.json({ success: true })
}
