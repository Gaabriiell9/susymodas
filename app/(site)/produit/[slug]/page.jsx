import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProductPageClient from '@/components/product/ProductPageClient'

export async function generateMetadata({ params }) {
    const product = await prisma.product.findUnique({ where: { slug: params.slug } })
    if (!product) return { title: 'Produit introuvable' }
    return { title: `${product.name} — Susy Modas`, description: product.description }
}

export default async function ProductPage({ params }) {
    const product = await prisma.product.findUnique({
        where: { slug: params.slug, active: true },
    })
    if (!product) notFound()
    return <ProductPageClient product={product} />
}