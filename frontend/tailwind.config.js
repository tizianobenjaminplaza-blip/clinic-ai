/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Carbon green-tinted surfaces
        carbon: {
          950: '#070A09',
          900: '#0B0F0D',
          850: '#0F1512',
          800: '#141B17',
          700: '#1D2620',
        },
        // Emerald — the single living accent
        emerald: {
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        // Cool platinum detail
        platinum: {
          100: '#F2F5F4',
          200: '#D9E3DE',
          300: '#B6C4BD',
          400: '#8A9A93',
          500: '#5E6B65',
        },
        // Ivory text ramp
        ivory: {
          100: '#E8EDEA',
          200: '#D2DAD6',
          300: '#AEB8B3',
          400: '#838E89',
          500: '#5A625E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.4), 0 4px 18px rgba(0,0,0,0.3)',
        lift: '0 24px 60px -16px rgba(0,0,0,0.7)',
        glow: '0 0 0 1px rgba(16,185,129,0.20), 0 16px 48px -12px rgba(16,185,129,0.25)',
        card: '0 6px 28px -8px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'emerald-gradient': 'linear-gradient(135deg, #6EE7B7 0%, #10B981 50%, #047857 100%)',
        'emerald-soft': 'linear-gradient(135deg, rgba(52,211,153,0.14) 0%, rgba(5,150,105,0.10) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.7' },
        },
        'emerald-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'pulse-glow': 'pulse-glow 6s ease-in-out infinite',
        'emerald-shift': 'emerald-shift 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
