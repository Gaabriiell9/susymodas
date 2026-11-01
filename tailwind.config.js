/** @type {import('tailwindcss').Config} */
// Toutes les couleurs et polices passent par les tokens Hallmark (app/tokens.css).
const v = (name) => `var(--${name})`

module.exports = {
  content: ['./components/**/*.{js,jsx}', './app/**/*.{js,jsx}'],
  corePlugins: { container: false },
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: v('color-paper'), 2: v('color-paper-2'), 3: v('color-paper-3') },
        ink: { DEFAULT: v('color-ink'), 2: v('color-ink-2'), soft: v('color-ink-2'), muted: v('color-muted') },
        muted: v('color-muted'),
        rule: { DEFAULT: v('color-rule'), ink: v('color-rule-ink') },
        accent: { DEFAULT: v('color-accent'), 2: v('color-accent-2'), ink: v('color-accent-ink'), soft: v('color-accent-soft') },
        focus: v('color-focus'),
        error: v('color-error'),
        success: v('color-success'),
        // alias historiques (espace gestion)
        ivory: v('color-paper'),
        sand: { DEFAULT: v('color-paper-2'), dark: v('color-paper-3') },
        line: v('color-rule'),
        sale: v('color-accent'),
        blush: { DEFAULT: v('color-accent-soft'), light: v('color-paper-2') },
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
