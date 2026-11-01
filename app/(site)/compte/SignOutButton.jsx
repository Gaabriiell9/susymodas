'use client'
import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  return <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost">Déconnexion</button>
}
