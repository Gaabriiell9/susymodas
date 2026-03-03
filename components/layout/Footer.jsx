import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { whatsappLink } from '@/lib/utils'
import { Instagram, Facebook, MessageCircle } from 'lucide-react'

const COLLECTIONS = ['Robes de Mariage', "Robes d'Église", 'Tenues de Cérémonie', 'Baptêmes', 'Enfants & Jeunes Filles', 'Nouveautés']
const INFO        = ['Notre Histoire', 'Guide des Tailles', 'Livraison & Retours', 'Sur Commande', 'FAQ', 'Avis Clients']

export default function Footer() {
  return (
    <footer id="contact" className="bg-brown text-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 pt-12 sm:pt-16 pb-6 sm:pb-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/10">

          {/* Marque */}
          <div>
            <Logo light className="mb-5" />
            <p className="font-sans text-sm leading-relaxed mb-6">
              Boutique de robes chrétiennes élégantes à Kourou, Guyane Française. Pour la femme qui porte sa foi avec grâce.
            </p>
            <div className="flex gap-2.5">
              {[
                { icon: <Instagram size={15} />, label: 'Instagram', href: '#' },
                { icon: <Facebook  size={15} />, label: 'Facebook',  href: '#' },
                { icon: <MessageCircle size={15} />, label: 'WhatsApp', href: whatsappLink('Bonjour !') },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-gold hover:border-gold transition-all">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-serif text-lg text-white mb-5">Collections</h4>
            <ul className="space-y-2.5">
              {COLLECTIONS.map((c) => (
                <li key={c}>
                  <Link href="#" className="font-sans text-sm hover:text-gold transition-colors">{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Boutique */}
          <div>
            <h4 className="font-serif text-lg text-white mb-5">Boutique</h4>
            <ul className="space-y-2.5">
              {INFO.map((c) => (
                <li key={c}>
                  <Link href="#" className="font-sans text-sm hover:text-gold transition-colors">{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg text-white mb-5">Nous Trouver</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li className="flex gap-3 items-start">
                <span className="text-gold mt-0.5">📍</span>
                <span>Kourou, Guyane Française 97310<br /><span className="text-white/40 text-xs">Boutique sur rendez-vous</span></span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-gold mt-0.5">💬</span>
                <span>+594 XX XX XX XX<br /><span className="text-white/40 text-xs">Lun–Sam · 8h–18h</span></span>
              </li>
              <li className="flex gap-3"><span className="text-gold">📧</span><span>susymodas@email.com</span></li>
              <li className="flex gap-3"><span className="text-gold">📸</span><span>@susymodasevangelicas</span></li>
            </ul>

            <a href={whatsappLink('Bonjour, je voudrais passer une commande !')}
              target="_blank" rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-sm
                bg-[#25D366] text-white font-sans text-xs tracking-[0.12em] uppercase
                font-medium hover:bg-[#1fba57] transition-colors">
              <MessageCircle size={14} />
              Commander via WhatsApp
            </a>
          </div>
        </div>

        {/* Bas de page */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-3 font-sans text-[0.7rem] text-white/35">
          <span>© 2025 Susy Modas Evangelicas · Kourou, Guyane Française</span>
          <span>
            <Link href="#" className="text-gold hover:text-gold-light transition-colors">Confidentialité</Link>
            {' · '}
            <Link href="#" className="text-gold hover:text-gold-light transition-colors">Mentions Légales</Link>
            {' · '}Conçu avec ✦ et foi
          </span>
        </div>
      </div>
    </footer>
  )
}