import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="shop-container py-32 text-center">
      <p className="label text-ink-muted">Erreur 404</p>
      <h1 className="display mt-3 text-5xl">Page introuvable</h1>
      <p className="mt-4 text-ink-muted">Cette page n&apos;existe pas ou plus.</p>
      <Link href="/" className="btn-dark mt-10">Voir la collection</Link>
    </div>
  )
}
