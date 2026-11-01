import { getSettings } from '@/lib/settings'
import SettingsForm from '@/components/gestion/SettingsForm'

export default async function ReglagesPage() {
  const settings = await getSettings()
  return (
    <>
      <h1 className="font-serif text-4xl font-light">Réglages</h1>
      <p className="mt-1 text-[13px] text-ink-muted">Informations affichées sur le site et frais de livraison.</p>
      <SettingsForm initial={settings} />
    </>
  )
}
