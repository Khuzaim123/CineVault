/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07080F',
        surface: '#0F1120',
        gold: {
          DEFAULT: '#E8B84B',
          glow: 'rgba(232, 184, 75, 0.15)',
        },
        crimson: '#C0392B',
        text: {
          primary: '#F0EDE8',
          muted: '#6B6875',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'ken-burns': 'kenBurns 20s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        'md': '12px',
      },
      scale: {
        '104': '1.04',
      },
    },
  },
  plugins: [],
}
