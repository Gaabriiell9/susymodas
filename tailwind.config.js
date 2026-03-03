/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream:    '#FAF7F2',
        blush:    '#F0D9D3',
        rose: {
          DEFAULT: '#D4A5A0',
          deep:    '#B8837C',
        },
        gold: {
          light:   '#E8D5B0',
          pale:    '#F5EDD8',
          DEFAULT: '#C9A96E',
        },
        beige:  '#EDE4D6',
        taupe:  '#9E8E80',
        brown: {
          light:   '#7A6858',
          DEFAULT: '#5C4A42',
          dark:    '#2C2118',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-up':   'fadeInUp 0.6s ease both',
        'fade-left': 'fadeInLeft 0.6s ease both',
        float:       'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
