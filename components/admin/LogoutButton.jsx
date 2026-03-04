'use client'

import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-sans text-xs"
    >
      <LogOut size={14} />
      Déconnexion
    </button>
  )
}
