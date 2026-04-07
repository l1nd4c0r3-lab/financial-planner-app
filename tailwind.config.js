/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1E2D4F',
          50: '#F0F2F7',
          100: '#D8DDE8',
          200: '#B1BBD1',
          300: '#8A99BA',
          400: '#6377A3',
          500: '#3C558C',
          600: '#1E2D4F',
          700: '#1A2540',
          800: '#161E34',
          900: '#121728',
        },
        gold: {
          DEFAULT: '#C8A96E',
          light: '#DBC49A',
          dark: '#A68C4E',
        },
        teal: {
          DEFAULT: '#2A9D8F',
          light: '#5BC4B6',
          dark: '#1E7A6E',
        },
        rose: {
          DEFAULT: '#C0576B',
          light: '#D98A9E',
          dark: '#9C3D4F',
        },
        cream: '#FAF8F5',
        'mid-gray': '#D8D3CC',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(30, 45, 79, 0.08)',
        'card-hover': '0 4px 16px rgba(30, 45, 79, 0.12)',
        'inner-soft': 'inset 0 1px 3px rgba(30, 45, 79, 0.06)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'fill-up': 'fillUp 0.6s ease-out',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fillUp: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
