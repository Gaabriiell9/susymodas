import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-3xl tracking-[0.12em] uppercase">Susy Modas</p>
      <h1 className="mt-8 font-serif text-5xl font-light">Page introuvable</h1>
      <Link href="/" className="btn-dark mt-10">Retour à l&apos;accueil</Link>
    </div>
  )
}
