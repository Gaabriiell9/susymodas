import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { serializeProduct } from '@/lib/catalog'
import ProductForm from '@/components/gestion/ProductForm'

export default async function EditProductPage({ params }) {
  const id = parseInt(params.id, 10)
  const product = Number.isFinite(id) ? await prisma.product.findUnique({ where: { id } }) : null
  if (!product) notFound()
  return <ProductForm product={serializeProduct(product)} />
}
