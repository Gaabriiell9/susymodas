'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

// Met à jour les filtres dans l'URL sans remonter en haut de page
export function useFilterUrl() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const get = (k) => params.get(k) || ''
  function update(changes) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(changes)) {
      if (v === '' || v === null || v === false || v === undefined) next.delete(k)
      else next.set(k, v === true ? '1' : v)
    }
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }
  return { get, update, params }
}
