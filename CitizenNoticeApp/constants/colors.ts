// constants/colors.ts
/**
 * Color palette for the application
 * Matches the web frontend theme exactly with light and dark mode support
 */

// Light theme colors (default)
export const lightColors = {
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
    DEFAULT: '#8B6B61', // Add this line
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
    DEFAULT: '#64748b',
  },

  // Accent Colors
  accent: {
    teal: '#14b8a6',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    DEFAULT: '#14b8a6',
  },

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Category Colors
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

  // UI Elements
  background: '#faf7f5',
  surface: '#ffffff',
  surfaceHover: '#f5efe9',
  border: '#e8ddd1',
  borderDark: '#d4c0a8',
  
  // Text Colors
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    muted: '#94a3b8',
    inverse: '#ffffff',
    disabled: '#cbd5e1',
  },

  // Button Colors
  button: {
    primary: '#8B6B61',
    primaryHover: '#6D4C41',
    secondary: '#64748b',
    secondaryHover: '#475569',
    outline: '#e8ddd1',
    disabled: '#cbd5e1',
  },

  // Status Colors
  status: {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    inProgress: '#3b82f6',
    completed: '#8b5cf6',
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.15)',
  },
};

// Dark theme colors
export const darkColors = {
  // Primary Colors (adjusted for dark mode)
  primary: {
    50: '#4E342E',
    100: '#5D4037',
    200: '#6D4C41',
    300: '#8B6B61',
    400: '#A88560',
    500: '#C0A07F',
    600: '#D4C0A8',
    700: '#E8DDD1',
    800: '#F5EFE9',
    900: '#FAF7F5',
    DEFAULT: '#C0A07F', // Add this line
  },

  // Neutral Colors (dark mode)
  neutral: {
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#94a3b8',
    600: '#cbd5e1',
    700: '#e2e8f0',
    800: '#f1f5f9',
    900: '#f8fafc',
    DEFAULT: '#94a3b8',
  },

  // Accent Colors
  accent: {
    teal: '#2dd4bf',
    blue: '#60a5fa',
    purple: '#a78bfa',
    DEFAULT: '#2dd4bf',
  },

  // Semantic Colors
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',

  // Category Colors
  categories: {
    development: '#60a5fa',
    health: '#f87171',
    education: '#a78bfa',
    agriculture: '#34d399',
    employment: '#fbbf24',
    social_welfare: '#f472b6',
    tax_billing: '#2dd4bf',
    election: '#fb923c',
    meeting: '#818cf8',
    general: '#94a3b8',
  },

  // UI Elements
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#334155',
  border: '#334155',
  borderDark: '#475569',
  
  // Text Colors
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
    inverse: '#0f172a',
    disabled: '#475569',
  },

  // Button Colors
  button: {
    primary: '#C0A07F',
    primaryHover: '#D4C0A8',
    secondary: '#64748b',
    secondaryHover: '#94a3b8',
    outline: '#334155',
    disabled: '#475569',
  },

  // Status Colors
  status: {
    pending: '#fbbf24',
    approved: '#34d399',
    rejected: '#f87171',
    inProgress: '#60a5fa',
    completed: '#a78bfa',
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.2)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.4)',
  },
};

export const commonColors = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export default { light: lightColors, dark: darkColors, common: commonColors };