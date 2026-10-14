/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          'blue-light': '#EEF4FF',
          orange: '#FB923C',
          'orange-light': '#FFF4ED',
          bg: '#F4F7FB',
          card: '#FFFFFF',
        },
        dark: {
          950: '#06090D',
          900: '#0A0E12',
          850: '#0E141B',
          800: '#131B24',
          700: '#1E293B',
          600: '#334155',
        },
        ner: {
          cyan: '#0284C7',
          blue: '#2563EB',
          red: '#EF4444',
          green: '#10B981',
          amber: '#F59E0B',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        brand: ['"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 2px 14px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'soft-elevated': '0 10px 30px rgba(37, 99, 235, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-hazard': 'pulse-hazard 1.5s ease-in-out infinite',
        'flow-dash': 'flow-dash 1s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'pulse-hazard': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        'flow-dash': {
          'to': { strokeDashoffset: '-20' },
        }
      }
    },
  },
  plugins: [],
}
