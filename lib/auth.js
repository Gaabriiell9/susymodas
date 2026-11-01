// Authentification : NextAuth (Google + e-mail/mot de passe) et droits administrateur.
// Un seul compte a les droits admin : celui dont l'e-mail est ADMIN_EMAIL.
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'fariasgomes973@icloud.com').toLowerCase().trim()

export function isAdminEmail(email) {
  return !!email && email.toLowerCase().trim() === ADMIN_EMAIL
}

// Donne (ou retire) le rôle admin selon l'e-mail. Appelé à chaque connexion.
async function syncRole(user) {
  const wanted = isAdminEmail(user.email) ? 'ADMIN' : 'CUSTOMER'
  if (user.role !== wanted) {
    await prisma.user.update({ where: { id: user.id }, data: { role: wanted } })
  }
  return wanted
}

const providers = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Mot de passe', type: 'password' },
    },
    async authorize(credentials) {
      const email = credentials?.email?.toLowerCase().trim()
      if (!email || !credentials?.password) return null
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user?.password) return null
      const valid = await bcrypt.compare(credentials.password, user.password)
      if (!valid) return null
      if (!user.emailVerified) throw new Error('EMAIL_NOT_VERIFIED')
      return user
    },
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: '/connexion', error: '/connexion' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
        token.role = dbUser ? await syncRole(dbUser) : 'CUSTOMER'
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role ?? 'CUSTOMER'
      }
      return session
    },
  },
}

export async function getSession() {
  return getServerSession(authOptions)
}

// Vérifie en base que l'utilisateur connecté est bien l'admin (ne se fie pas qu'au jeton)
export async function getAdmin() {
  const session = await getSession()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.role !== 'ADMIN' || !isAdminEmail(user.email)) return null
  return user
}
