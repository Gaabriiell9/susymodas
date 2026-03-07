import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
    try {
        const { email, code } = await req.json()
        if (!email || !code) return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 })

        // Cherche le token valide pour cet email
        const record = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: code,
                expires: { gt: new Date() }, // pas expiré
            },
        })

        if (!record) {
            return NextResponse.json({ error: 'Code invalide ou expiré.' }, { status: 400 })
        }

        // Marque l'email comme vérifié
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        })

        // Supprime le token utilisé
        await prisma.verificationToken.delete({
            where: { identifier_token: { identifier: email, token: code } },
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[verify-email]', err)
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
    }
}