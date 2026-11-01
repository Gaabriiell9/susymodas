import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  const { current, next } = await request.json()
  if (!next || next.length < 8) return NextResponse.json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères.' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.password && !(await bcrypt.compare(current ?? '', user.password)))
    return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 })
  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(next, 12) } })
  return NextResponse.json({ success: true })
}
