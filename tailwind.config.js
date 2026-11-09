/** @type {import('tailwindcss').Config} */
// Toutes les couleurs et polices passent par les tokens Hallmark (app/tokens.css).
const v = (name) => `var(--${name})`
// couleur avec support des opacités Tailwind (bg-ink/40, etc.)
const c = (name) => `color-mix(in oklab, var(--${name}) calc(<alpha-value> * 100%), transparent)`

module.exports = {
  content: ['./components/**/*.{js,jsx}', './app/**/*.{js,jsx}'],
  corePlugins: { container: false },
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: c('color-paper'), 2: c('color-paper-2'), 3: c('color-paper-3') },
        ink: { DEFAULT: c('color-ink'), 2: c('color-ink-2'), soft: c('color-ink-2'), muted: c('color-muted') },
        muted: c('color-muted'),
        rule: { DEFAULT: c('color-rule'), ink: c('color-rule-ink') },
        accent: { DEFAULT: c('color-accent'), 2: c('color-accent-2'), ink: c('color-accent-ink'), soft: c('color-accent-soft') },
        focus: c('color-focus'),
        error: c('color-error'),
        success: c('color-success'),
        // alias historiques (espace gestion)
        ivory: c('color-paper'),
        sand: { DEFAULT: c('color-paper-2'), dark: c('color-paper-3') },
        line: c('color-rule'),
        sale: c('color-accent'),
        blush: { DEFAULT: c('color-accent-soft'), light: c('color-paper-2') },
      },
      fontFamily: {
        display: v('font-display'),
        serif: v('font-display'),
        sans: v('font-body'),
        body: v('font-body'),
      },
      fontSize: {
        display: v('text-display'),
        'display-s': v('text-display-s'),
        section: v('text-section'),
        title: v('text-title'),
        lead: v('text-lead'),
      },
      spacing: {
        'section-s': v('section-gap-s'),
        section: v('section-gap'),
        'section-l': v('section-gap-l'),
        gutter: v('gutter'),
      },
      maxWidth: { container: v('container') },
      transitionTimingFunction: { out: v('ease-out') },
      transitionDuration: { micro: v('dur-micro'), short: v('dur-short'), long: v('dur-long') },
      zIndex: { sticky: v('z-sticky'), nav: v('z-sticky-nav'), modal: v('z-modal') },
      keyframes: {
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        slideInLeft: { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
      },
      animation: {
        fade: 'fade var(--dur-short) var(--ease-out) both',
        'slide-in': 'slideIn var(--dur-long) var(--ease-out) both',
        'slide-in-left': 'slideInLeft var(--dur-long) var(--ease-out) both',
      },
    },
  },
  plugins: [],
}
