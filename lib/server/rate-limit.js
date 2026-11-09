// Limitation des tentatives, stockée en base (fonctionne même en serverless) sans changer le schéma :
// chaque échec est une ligne VerificationToken « limit:<type>:<clé> » qui expire seule.
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'

const WINDOW_MS = 15 * 60 * 1000

export async function tooManyAttempts(type, key, max) {
  const n = await prisma.verificationToken.count({
    where: { identifier: `limit:${type}:${key}`, expires: { gt: new Date() } },
  })
  return n >= max
}

export async function recordFailure(type, key) {
  await prisma.verificationToken.create({
    data: { identifier: `limit:${type}:${key}`, token: `limit:${randomUUID()}`, expires: new Date(Date.now() + WINDOW_MS) },
  })
  // ménage des anciennes tentatives expirées
  await prisma.verificationToken.deleteMany({ where: { identifier: { startsWith: 'limit:' }, expires: { lt: new Date() } } }).catch(() => {})
}

export async function clearFailures(type, key) {
  await prisma.verificationToken.deleteMany({ where: { identifier: `limit:${type}:${key}` } })
}
