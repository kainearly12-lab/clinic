/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f3efe9',
          300: '#ebe5db',
          400: '#ddd4c6',
        },
        charcoal: {
          800: '#2a2723',
          900: '#1c1a17',
          950: '#131210',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e6ede7',
          200: '#cdd9d1',
          300: '#a9bcb0',
          400: '#7e9789',
          500: '#5d7a6b',
          600: '#486055',
          700: '#3a4d45',
        },
        champagne: {
          100: '#f7f1e6',
          200: '#ece0cc',
          300: '#dcc9a8',
          400: '#c9ad84',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '1320px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28,26,23,0.04), 0 8px 30px rgba(28,26,23,0.06)',
        lift: '0 2px 4px rgba(28,26,23,0.04), 0 18px 50px rgba(28,26,23,0.10)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
