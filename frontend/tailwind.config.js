/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '360px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        // Authoritative Design Tokens
        brand: {
          slate: '#1E293B',       // Primary Slate Base
          'slate-dark': '#0F172A',
          amber: '#D48817',       // Harvest Amber Accent / CTA
          'amber-dark': '#B8720F',
          'amber-light': '#FDF6EC',
          'amber-50': '#FFFBEB',
          green: '#166534',       // Forest Green / Purity
          'green-dark': '#14532D',
          'green-light': '#F0FDF4',
        },
        surface: {
          bg: '#F8F9FF',          // Master Background
          canvas: '#FFFFFF',      // White Surface
          subtle: '#F8FAFC',      // Soft Slate Tint
          muted: '#F1F5F9',
          border: '#E2E8F0',      // Structural Outlines
          'border-dark': '#CBD5E1',
        },
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          muted: '#94A3B8',
          inverted: '#FFFFFF',
        },
        functional: {
          success: '#15803D',
          'success-light': '#DCFCE7',
          'success-border': '#BBF7D0',
          warning: '#D97706',
          'warning-light': '#FEF3C7',
          'warning-border': '#FDE68A',
          error: '#DC2626',
          'error-light': '#FEF2F2',
          'error-border': '#FECACA',
          info: '#2563EB',
          'info-light': '#EFF6FF',
          'info-border': '#BFDBFE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Tamil', 'system-ui', '-apple-system', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'Inter', 'sans-serif'],
      },
      spacing: {
        'space-xs': '0.25rem', // 4px
        'space-sm': '0.5rem',  // 8px
        'space-md': '1rem',    // 16px
        'space-lg': '1.5rem',  // 24px
        'space-xl': '2rem',    // 32px
        'space-2xl': '3rem',   // 48px
        'space-3xl': '4rem',   // 64px
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        card: '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        elevated: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
        modal: '0 20px 32px -8px rgba(30, 41, 59, 0.22)',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },
      maxWidth: {
        'page': '1440px',
      },
    },
  },
  plugins: [],
}
