import Link from 'next/link'
import { Plus } from 'lucide-react'
import prisma from '@/lib/prisma'
import { serializeProduct } from '@/lib/catalog'
import ProductsTable from '@/components/gestion/ProductsTable'

export default async function ArticlesPage() {
  const products = (await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })).map(serializeProduct)
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[2.5rem]">Articles</h1>
          <p className="mt-1 text-sm text-ink-muted">{products.length} article(s) au catalogue</p>
        </div>
        <Link href="/gestion/articles/nouveau" className="btn-dark"><Plus size={15} /> Nouvel article</Link>
      </div>
      <ProductsTable initial={products} />
    </>
  )
}
