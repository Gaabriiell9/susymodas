import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password)
            return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })

        if (password.length < 6)
            return NextResponse.json({ error: 'Le mot de passe doit faire au moins 6 caractères.' }, { status: 400 })

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing)
            return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 })

        const hash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: { name, email, password: hash },
        })

        // Supprime les anciens tokens éventuels
        await prisma.verificationToken.deleteMany({ where: { identifier: email } })

        // Génère un code à 6 chiffres valable 15 minutes
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const expires = new Date(Date.now() + 15 * 60 * 1000)

        await prisma.verificationToken.create({
            data: { identifier: email, token: code, expires },
        })

        await sendVerificationEmail({ to: email, name, code })

        return NextResponse.json({ success: true, userId: user.id })
    } catch (err) {
        console.error('[register]', err)
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
    }
}