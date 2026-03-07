import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req) {
    try {
        const { email } = await req.json()
        if (!email) return NextResponse.json({ error: 'Email manquant.' }, { status: 400 })

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })
        if (user.emailVerified) return NextResponse.json({ error: 'Email déjà vérifié.' }, { status: 400 })

        // Supprime les anciens tokens pour cet email
        await prisma.verificationToken.deleteMany({ where: { identifier: email } })

        // Génère un nouveau code à 6 chiffres
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        await prisma.verificationToken.create({
            data: { identifier: email, token: code, expires },
        })

        await sendVerificationEmail({ to: email, name: user.name || '', code })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[resend-verify]', err)
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
    }
}