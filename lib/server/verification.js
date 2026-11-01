import { randomInt } from 'crypto'
import prisma from '@/lib/prisma'
import { sendVerificationEmail, emailEnabled } from '@/lib/email'

// Crée un code à 6 chiffres (15 min) et l'envoie. Sans service e-mail configuré, le compte est validé directement.
export async function issueVerification(user) {
  if (!emailEnabled()) {
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } })
    return { autoVerified: true }
  }
  await prisma.verificationToken.deleteMany({ where: { identifier: user.email } })
  const code = String(randomInt(100000, 1000000))
  await prisma.verificationToken.create({
    data: { identifier: user.email, token: `${user.email}:${code}`, expires: new Date(Date.now() + 15 * 60 * 1000) },
  })
  await sendVerificationEmail({ to: user.email, name: user.name || '', code })
  return { autoVerified: false }
}
