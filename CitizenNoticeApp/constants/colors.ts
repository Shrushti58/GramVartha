/**
 * Color palette for the application
 * Matches the web frontend theme exactly
 */

export const Colors = {
  // Primary Colors (Earth/Brown tones from web)
  primary: {
    50: '#faf7f5',
    100: '#f5efe9',
    200: '#e8ddd1',
    300: '#d4c0a8',
    400: '#c0a07f',
    500: '#a88560',
    600: '#8B6B61',
    700: '#6D4C41',
    800: '#5D4037',
    900: '#4E342E',
  },

  // Neutral Colors (Slate)
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Accent Colors
  accent: {
    teal: '#14b8a6',
    blue: '#3b82f6',
    purple: '#8b5cf6',
  },

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Category Colors (matching web categories)
  categories: {
    development: '#3b82f6',
    health: '#ef4444',
    education: '#8b5cf6',
    agriculture: '#10b981',
    employment: '#f59e0b',
    social_welfare: '#ec4899',
    tax_billing: '#14b8a6',
    election: '#f97316',
    meeting: '#6366f1',
    general: '#64748b',
  },

  // Button Colors (from web theme)
  button: {
    primary: '#8B6B61', // Matches button-primary from web
    hover: '#6D4C41',
  },

  // UI Elements
  background: '#faf7f5', // Matches bg-background from web
  surface: '#ffffff',
  border: '#e8ddd1', // Lighter earth tone
  
  // Text Colors
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',
};

export default Colors;