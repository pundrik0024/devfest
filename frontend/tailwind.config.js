/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#1A6B2A',
          50:  '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#2E7D32',
          700: '#1A6B2A',
          800: '#1B5E20',
          900: '#003300',
        },
        // Top bar
        topbar: '#166534',
        // Accents
        amber:  { DEFAULT: '#F59E0B', dark: '#D97706', light: '#FEF3C7' },
        orange: { DEFAULT: '#EA580C', light: '#FFF7ED' },
        // Status
        optimal:  '#16A34A',
        caution:  '#D97706',
        danger:   '#DC2626',
        spray:    '#2563EB',
        // Surface
        surface: '#F9FAFB',
        card:    '#FFFFFF',
        border:  '#E5E7EB',
        // Text
        'text-primary': '#111827',
        'text-muted':   '#6B7280',
        'text-light':   '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.65rem',
      },
      borderRadius: {
        card:   '12px',
        button: '8px',
        chip:   '9999px',
      },
      boxShadow: {
        card:   '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.12)',
        nav:    '0 1px 0 0 #E5E7EB',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      minHeight: {
        screen: '100dvh',
      },
      maxWidth: {
        container: '1440px',
      },
    },
  },
  plugins: [],
}
