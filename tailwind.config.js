/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./components/**/*.{js,jsx}', './app/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1C1917', soft: '#44403C', muted: '#78716C' },
        ivory: '#FBF8F4',
        sand: { DEFAULT: '#F3EDE6', dark: '#E7DED3' },
        line: '#E9E2D9',
        blush: { DEFAULT: '#E9CFCB', light: '#F6E9E6', deep: '#B9827C' },
        gold: { DEFAULT: '#B08D57', light: '#D9C3A0' },
        sale: '#A8322D',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { label: '0.18em' },
      maxWidth: { shop: '1440px' },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        slideInLeft: { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-up': 'fadeUp .7s cubic-bezier(.2,.7,.2,1) both',
        'slide-in': 'slideIn .35s cubic-bezier(.2,.7,.2,1) both',
        'slide-in-left': 'slideInLeft .35s cubic-bezier(.2,.7,.2,1) both',
        fade: 'fade .25s ease both',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
}
