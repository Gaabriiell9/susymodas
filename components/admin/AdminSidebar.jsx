'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Package, LayoutDashboard, Menu, X } from 'lucide-react'
import LogoutButton from './LogoutButton'

const ICONS = { LayoutDashboard, Package, ShoppingBag }

export default function AdminSidebar({ nav, admin }) {
    const [open, setOpen] = useState(false)

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-white/10">
                <p className="font-serif text-lg text-white">Susy Modas</p>
                <p className="font-sans text-[0.6rem] tracking-widest uppercase text-gold mt-0.5">Admin</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {nav.map(({ href, label, icon }) => {
                    const Icon = ICONS[icon]
                    return (
                        <Link key={href} href={href} onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all font-sans text-sm">
                            <Icon size={16} />
                            {label}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-white/10">
                {admin && <p className="font-sans text-xs text-white/40 mb-3 truncate">{admin.email}</p>}
                <LogoutButton />
            </div>
        </>
    )

    return (
        <>
            {/* Bouton burger mobile */}
            <button onClick={() => setOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-brown rounded-lg flex items-center justify-center text-white shadow-lg">
                <Menu size={20} />
            </button>

            {/* Overlay mobile */}
            {open && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
            )}

            {/* Sidebar mobile (drawer) */}
            <aside className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-brown flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
                    <X size={20} />
                </button>
                <SidebarContent />
            </aside>

            {/* Sidebar desktop (fixe) */}
            <aside className="hidden md:flex w-60 bg-brown min-h-screen flex-col fixed top-0 left-0 bottom-0 z-40">
                <SidebarContent />
            </aside>
        </>
    )
}