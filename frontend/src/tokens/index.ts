/**
 * SSK Natural Gold — Authoritative Design Tokens
 * Derived from the approved Google Stitch Design System (P1–P16A)
 */

export const COLORS = {
  // Brand Anchors
  primarySlate: '#1E293B',
  primarySlateDark: '#0F172A',
  harvestAmber: '#D48817',
  harvestAmberDark: '#B8720F',
  harvestAmberLight: '#FDF6EC',
  forestGreen: '#166534',
  forestGreenDark: '#14532D',
  forestGreenLight: '#F0FDF4',

  // Surfaces & Borders
  background: '#F8F9FF',
  white: '#FFFFFF',
  surfaceSubtle: '#F8FAFC',
  border: '#E2E8F0',
  borderDark: '#CBD5E1',

  // Typography
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Functional Semantics
  success: '#15803D',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  info: '#2563EB',
  infoLight: '#EFF6FF',
} as const;

export const BREAKPOINTS = {
  xs: 360,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const SHADOWS = {
  subtle: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
  card: '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
  elevated: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
  modal: '0 20px 32px -8px rgba(30, 41, 59, 0.22)',
} as const;

export const RADIUS = {
  sm: '4px',
  DEFAULT: '8px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    english: 'Inter, system-ui, sans-serif',
    tamil: 'Noto Sans Tamil, Inter, sans-serif',
  },
} as const;
