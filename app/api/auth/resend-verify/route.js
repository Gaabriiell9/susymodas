import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { issueVerification } from '@/lib/server/verification'
import { tooManyAttempts, recordFailure } from '@/lib/server/rate-limit'

export async function POST(req) {
  try {
    const { email: rawEmail } = await req.json()
    const email = rawEmail?.toLowerCase().trim()
    const user = email ? await prisma.user.findUnique({ where: { email } }) : null
    // Réponse identique que le compte existe ou non (pas de fuite d'information)
    if (user && !user.emailVerified && !(await tooManyAttempts('resend', email, 5))) {
      await recordFailure('resend', email)
      await issueVerification(user)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[resend-verify]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
