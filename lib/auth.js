// lib/auth.js
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'change-me-in-production')
const COOKIE_NAME = 'susy_admin_token'

// ── Créer un token JWT ────────────────────────────────────────────────────────
export async function createToken(payload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(SECRET)
}

// ── Vérifier un token JWT ─────────────────────────────────────────────────────
export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, SECRET)
        return payload
    } catch {
        return null
    }
}

// ── Lire le token depuis les cookies ─────────────────────────────────────────
export async function getAdminFromCookies() {
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
}

// ── Nom du cookie ─────────────────────────────────────────────────────────────
export { COOKIE_NAME }