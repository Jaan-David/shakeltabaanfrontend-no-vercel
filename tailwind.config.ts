import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./Pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // ========================================
        // BLUE & WHITE THEME - ShakElTaaban Frontend
        // ========================================
        
        // PRIMARY COLORS (Blue)
        primary: {
          DEFAULT: '#2563EB',   // blue-600
          hover: '#1D4ED8',     // blue-700
          active: '#1E40AF',    // blue-800
          muted: '#93C5FD',     // blue-300
        },
        
        // SURFACE COLORS (White & Backgrounds)
        surface: '#FFFFFF',
        background: '#FFFFFF',
        card: '#FFFFFF',
        border: '#E5E7EB',      // gray-200
        
        // TEXT COLORS
        text: {
          primary: '#0F172A',   // slate-900
          secondary: '#475569', // slate-600
          muted: '#94A3B8',     // slate-400
          inverse: '#FFFFFF',   // white (for blue backgrounds)
        },
        
        // LEGACY SUPPORT (maps to new theme)
        brand: '#2563EB',
        'brand-2': '#1D4ED8',
        'brand-3': '#1E40AF',
        accent: '#2563EB',
        'surface-2': '#FFFFFF',
        'surface-3': '#F8FAFC',
        ring: '#2563EB',
        'text-1': '#0F172A',
        'text-2': '#475569',
        'text-3': '#94A3B8',
        'text-invert': '#FFFFFF',
        
        // EXTENDED BLUE PALETTE (for advanced use)
        'primary-50': '#EFF6FF',
        'primary-100': '#DBEAFE',
        'primary-200': '#BFDBFE',
        'primary-300': '#93C5FD',
        'primary-400': '#60A5FA',
        'primary-500': '#2563EB',
        'primary-600': '#1D4ED8',
        'primary-700': '#1E40AF',
        'primary-800': '#1E3A8A',
        'primary-900': '#172554',
        
        // SECONDARY (for variations)
        secondary: '#1E40AF',
        'secondary-50': '#EFF6FF',
        'secondary-100': '#DBEAFE',
        'secondary-200': '#BFDBFE',
        'secondary-300': '#93C5FD',
        'secondary-400': '#60A5FA',
        'secondary-500': '#1E40AF',
        'secondary-600': '#1E3A8A',
        'secondary-700': '#172554',
        'secondary-800': '#0F1D3F',
        'secondary-900': '#0A1730',
        
        // ACCENT (minimal use)
        'accent-50': '#E0F2FE',
        'accent-100': '#BAE6FD',
        'accent-200': '#7DD3FC',
        'accent-300': '#38BDF8',
        'accent-400': '#0EA5E9',
        'accent-500': '#2563EB',
        'accent-600': '#0284C7',
        'accent-700': '#0369A1',
        'accent-800': '#075985',
        'accent-900': '#0C4A6E',

        // Success Colors
        success: '#10b981',
        'success-50': '#ecfdf5',
        'success-100': '#d1fae5',
        'success-200': '#a7f3d0',
        'success-300': '#6ee7b7',
        'success-400': '#34d399',
        'success-500': '#10b981',
        'success-600': '#059669',
        'success-700': '#047857',
        'success-800': '#065f46',
        'success-900': '#064e3b',

        // Warning Colors
        warning: '#f59e0b',
        'warning-50': '#fffbeb',
        'warning-100': '#fef3c7',
        'warning-200': '#fde68a',
        'warning-300': '#fcd34d',
        'warning-400': '#fbbf24',
        'warning-500': '#f59e0b',
        'warning-600': '#d97706',
        'warning-700': '#b45309',
        'warning-800': '#92400e',
        'warning-900': '#78350f',

        // Error Colors
        error: '#ef4444',
        'error-50': '#fef2f2',
        'error-100': '#fee2e2',
        'error-200': '#fecaca',
        'error-300': '#fca5a5',
        'error-400': '#f87171',
        'error-500': '#ef4444',
        'error-600': '#dc2626',
        'error-700': '#b91c1c',
        'error-800': '#991b1b',
        'error-900': '#7f1d1d',

        // Neutral Colors (Gray scale)
        gray: '#F8FAFC',
        'gray-50': '#F8FAFC',
        'gray-100': '#F1F5F9',
        'gray-200': '#E2E8F0',
        'gray-300': '#CBD5E1',
        'gray-400': '#94A3B8',
        'gray-500': '#64748B',
        'gray-600': '#475569',
        'gray-700': '#334155',
        'gray-800': '#1E293B',
        'gray-900': '#0F172A',

        // Special Colors
        glass: 'rgba(255, 255, 255, 0.85)',
        'glass-light': 'rgba(255, 255, 255, 0.9)',
        'glass-dark': 'rgba(37, 99, 235, 0.1)',

        // Legacy support
        light: '#FFFFFF',
        gold: '#FACC15',
        onPrimary: '#FFFFFF',

        // Mapped Background Colors
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#FFFFFF',
        'bg-tertiary': '#F8FAFC',
        'bg-card': '#FFFFFF',
        'bg-glass': 'rgba(255, 255, 255, 0.85)',
        
        // Mapped Text Colors
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#94A3B8',
      },
      boxShadow: {
        // Luxury soft shadows
        soft: '0 4px 12px rgba(10, 30, 51, 0.12)',
        'soft-md': '0 8px 20px rgba(10, 30, 51, 0.16)',
        elevated: '0 12px 32px rgba(10, 30, 51, 0.18)',
        'elevated-lg': '0 20px 56px rgba(10, 30, 51, 0.22)',
        glow: '0 0 22px rgba(95, 168, 230, 0.25)',
        'glow-accent': '0 0 18px rgba(201, 162, 63, 0.22)',
      },
      borderRadius: {
        card: '16px',
        panel: '20px',
        pill: '999px',
        'sm-card': '12px',
      },
      fontFamily: {
        beiruti: ['Beiruti', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-2': ['3rem', { lineHeight: '1.15', fontWeight: '700' }],
        headline: ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        title: ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.8', fontWeight: '400' }],
        caption: ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
      },
      spacing: {
        'section': '4rem',
        'section-lg': '6rem',
        'gutter': '1.25rem',
      },
      opacity: {
        'glass': '0.95',
      },
      backdropBlur: {
        'glass': '8px',
      },
    },
  },
  plugins: [],
};

export default config;