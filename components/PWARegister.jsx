'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Download, Share } from 'lucide-react'

export default function PWAInstallBanner() {
    const [show, setShow] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState(null)

    useEffect(() => {
        const dismissed = localStorage.getItem('pwa_dismissed')
        if (dismissed) return
        if (window.matchMedia('(display-mode: standalone)').matches) return

        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
        setIsIOS(ios)

        if (ios) {
            setTimeout(() => setShow(true), 3000)
            return
        }

        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setTimeout(() => setShow(true), 3000)
        }
        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    function dismiss() {
        setShow(false)
        localStorage.setItem('pwa_dismissed', '1')
    }

    async function installAndroid() {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') setShow(false)
        setDeferredPrompt(null)
    }

    if (!show) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl border border-gold-light p-4 flex gap-3 items-start">
                <div className="relative w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
                    <Image src="/logo-susy.png" alt="Susy Modas" fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-brown font-medium">Installer Susy Modas</p>

                    {isIOS ? (
                        <p className="font-sans text-xs text-taupe mt-1 leading-relaxed">
                            Appuyez sur <Share size={11} className="inline" /> puis <strong>Sur l&apos;écran d&apos;accueil</strong> pour installer l&apos;app.
                        </p>
                    ) : (
                        <p className="font-sans text-xs text-taupe mt-1 leading-relaxed">
                            Ajoutez l&apos;app sur votre téléphone pour un accès rapide.
                        </p>
                    )}

                    {!isIOS && deferredPrompt && (
                        <button onClick={installAndroid}
                            className="mt-2 flex items-center gap-1.5 bg-gold text-white font-sans text-xs px-3 py-1.5 rounded-lg hover:bg-rose-deep transition-colors">
                            <Download size={12} />
                            Installer
                        </button>
                    )}
                </div>

                <button onClick={dismiss} className="text-taupe hover:text-brown flex-shrink-0">
                    <X size={16} />
                </button>
            </div>
        </div>
    )
}