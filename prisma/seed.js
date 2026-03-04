// prisma/seed.js
// Lance : node prisma/seed.js

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // ── Admin par défaut ───────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('SusyAdmin2025!', 12)
    await prisma.admin.upsert({
        where: { email: 'admin@susymodas.fr' },
        update: {},
        create: {
            email: 'admin@susymodas.fr',
            password: hashedPassword,
            name: 'Susy Admin',
        },
    })
    console.log('✅ Admin créé — email: admin@susymodas.fr / mdp: SusyAdmin2025!')

    // ── Produits ───────────────────────────────────────────────────────────────
    const products = [
        {
            slug: 'robe-lumiere-du-matin',
            name: 'Robe Lumière du Matin',
            description: 'Modeste et gracieuse, parfaite pour le culte hebdomadaire. Tissu léger et confortable.',
            price: 89,
            category: 'eglise',
            tags: [],
            images: [],
            sizes: ['S', 'M', 'L', 'XL', '2XL'],
            colors: ['Rose poudré', 'Blanc'],
            stock: 15,
        },
        {
            slug: 'robe-etoile-doree',
            name: 'Robe Étoile Dorée',
            description: 'Élégante pour baptêmes, conférences et galas. Ceinture dorée et coupe empire sublimante.',
            price: 120,
            originalPrice: 150,
            category: 'ceremonie',
            tags: ['nouveau'],
            images: [],
            sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
            colors: ['Beige doré', 'Champagne'],
            stock: 8,
        },
        {
            slug: 'robe-paix-interieure',
            name: 'Robe Paix Intérieure',
            description: 'Robe midi confortable et modeste pour le quotidien. Coupe A-line flatteuse en toutes tailles.',
            price: 72,
            category: 'quotidien',
            tags: [],
            images: [],
            sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
            colors: ['Beige naturel', 'Taupe'],
            stock: 25,
        },
        {
            slug: 'robe-rose-de-saron',
            name: 'Robe Rose de Saron',
            description: "La robe polyvalente par excellence. Passe de l'église à une sortie élégante sans effort.",
            price: 95,
            category: 'eglise',
            tags: [],
            images: [],
            sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
            colors: ['Rose poudré', 'Mauve doux'],
            stock: 12,
        },
        {
            slug: 'robe-couronnee-de-gloire',
            name: 'Robe Couronnée de Gloire',
            description: 'Tenue de prestige pour conférences et galas. Empire waist, dentelle fine sur les manches.',
            price: 135,
            category: 'ceremonie',
            tags: ['exclusif'],
            images: [],
            sizes: ['S', 'M', 'L', 'XL', '2XL'],
            colors: ['Champagne', 'Or pâle'],
            stock: 5,
        },
        {
            slug: 'robe-petite-benediction',
            name: 'Robe Petite Bénédiction',
            description: 'Robe pour petites filles avec nœud satin. Douce, pudique et adorable pour les cérémonies.',
            price: 55,
            category: 'enfant',
            tags: [],
            images: [],
            sizes: ['2 ans', '4 ans', '6 ans', '8 ans', '10 ans', '12 ans'],
            colors: ['Blanc', 'Rose pâle'],
            stock: 20,
        },
    ]

    for (const product of products) {
        await prisma.product.upsert({
            where: { slug: product.slug },
            update: product,
            create: product,
        })
    }
    console.log(`✅ ${products.length} produits créés`)

    console.log('🎉 Seed terminé !')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())