import { getSettings } from '@/lib/settings'
import SettingsForm from '@/components/gestion/SettingsForm'

export default async function ReglagesPage() {
  const settings = await getSettings()
  return (
    <>
      <h1 className="display text-[2.5rem]">Réglages</h1>
      <p className="mt-1 text-sm text-ink-muted">Informations affichées sur le site et frais de livraison.</p>
      <SettingsForm initial={settings} />
    </>
  )
}
