// constants/colors.ts
/**
 * Color palette for the application
 * Matches the web frontend theme exactly with light and dark mode support
 */

// Light theme colors (matching web Tailwind config)
export const lightColors = {
  // Primary Colors - Exact match from web Tailwind config
  primary: {
    50: '#fdf4f0',
    100: '#fde8d8',
    200: '#f4c4aa',
    300: '#d4804a',
    400: '#c0613a',
    500: '#a84d2e',
    600: '#8a3c24',
    700: '#6e2e1c',
    800: '#5a2e18',
    900: '#3d2018',
    DEFAULT: '#a84d2e', // primary-500 from web
  },

  // Accent Colors - Exact match from web
  accent: {
    mist: '#fdf4f0',
    sage: '#fde8d8',
    lime: '#d4804a',
    green: '#c0613a',
    forest: '#3d2018',
    DEFAULT: '#d4804a', // accent-lime from web
  },

  // UI Elements - Exact match from web tokens
  background: '#fdf6f2',
  surface: '#ffffff',
  border: '#f0d0bc',
  
  // Text Colors - Exact match from web text tokens
  text: {
    primary: '#3b1408',
    secondary: '#7a3020',
    muted: '#a85a40',
    light: '#c89080',
    inverse: '#ffffff',
    disabled: '#cbd5e1',
  },

  // Button Colors
  button: {
    primary: '#a84d2e',
    primaryHover: '#8a3c24',
    secondary: '#7a3020',
    secondaryHover: '#a85a40',
    outline: '#f0d0bc',
    disabled: '#cbd5e1',
  },

  // Category Colors (keeping existing but adjusted to match web palette)
  categories: {
    development: '#d4804a',
    health: '#c0613a',
    education: '#a84d2e',
    agriculture: '#8a3c24',
    employment: '#6e2e1c',
    social_welfare: '#5a2e18',
    tax_billing: '#3d2018',
    election: '#f4c4aa',
    meeting: '#fde8d8',
    general: '#7a3020',
  },

  // Status Colors
  status: {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    inProgress: '#3b82f6',
    completed: '#8b5cf6',
  },

  // Shadow Colors - Matching web shadows
  shadow: {
    light: '0 4px 15px rgba(138,60,36,0.08)',
    medium: '0 4px 20px rgba(138,60,36,0.12)',
    dark: '0 8px 25px rgba(138,60,36,0.16)',
    hover: '0 8px 30px rgba(212,128,74,0.28)',
  },

  // Gradient backgrounds from web
  gradients: {
    forest: 'linear-gradient(135deg, #8a3c24 0%, #6e2e1c 100%)',
    green: 'linear-gradient(135deg, #c0613a 0%, #d4804a 40%, #a84d2e 100%)',
    mist: 'linear-gradient(135deg, #fdf6f2 0%, #fdf4f0 100%)',
    heroOverlay: 'linear-gradient(135deg, rgba(138,60,36,0.95), rgba(110,46,28,0.88))',
  },

  // Neutral Colors
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

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// Dark theme colors - Matching web dark theme tokens
export const darkColors = {
  // Primary Colors - Matching web dark theme
  primary: {
    50: '#3d2018',
    100: '#5a2e18',
    200: '#6e2e1c',
    300: '#8a3c24',
    400: '#a84d2e',
    500: '#c0613a',
    600: '#d4804a',
    700: '#f4c4aa',
    800: '#fde8d8',
    900: '#fdf4f0',
    DEFAULT: '#c0613a', // primary-400 from web dark
  },

  // Accent Colors - Matching web dark
  accent: {
    mist: '#1e0c07',
    sage: '#2e1610',
    lime: '#d4804a',
    green: '#c0613a',
    forest: '#3d2018',
    DEFAULT: '#d4804a',
  },

  // UI Elements - Exact match from web dark tokens
  background: '#1e0c07',
  surface: '#2e1610',
  surface2: '#3d2018',
  border: '#5a2e18',
  
  // Text Colors - Exact match from web dark text tokens
  text: {
    primary: '#fdf4f0',
    secondary: '#fde8d8',
    muted: '#d4804a',
    light: '#c0613a',
    inverse: '#1e0c07',
    disabled: '#5a2e18',
  },

  // Button Colors - Matching web dark
  button: {
    primary: '#c0613a',
    primaryHover: '#d4804a',
    secondary: '#fde8d8',
    secondaryHover: '#fdf4f0',
    outline: '#5a2e18',
    disabled: '#3d2018',
  },

  // Category Colors (adjusted for dark)
  categories: {
    development: '#d4804a',
    health: '#c0613a',
    education: '#a84d2e',
    agriculture: '#8a3c24',
    employment: '#6e2e1c',
    social_welfare: '#5a2e18',
    tax_billing: '#3d2018',
    election: '#f4c4aa',
    meeting: '#fde8d8',
    general: '#c89080',
  },

  // Status Colors
  status: {
    pending: '#fbbf24',
    approved: '#34d399',
    rejected: '#f87171',
    inProgress: '#60a5fa',
    completed: '#a78bfa',
  },

  // Shadow Colors - Matching web dark shadows
  shadow: {
    light: '0 4px 15px rgba(0,0,0,0.35)',
    medium: '0 4px 20px rgba(0,0,0,0.45)',
    dark: '0 8px 25px rgba(0,0,0,0.55)',
    hover: '0 8px 30px rgba(212,128,74,0.25)',
  },

  // Gradient backgrounds from web dark
  gradients: {
    forest: 'linear-gradient(135deg, #a84d2e 0%, #3d2018 100%)',
    green: 'linear-gradient(135deg, #c0613a 0%, #d4804a 40%, #a84d2e 100%)',
    dark: 'linear-gradient(135deg, #a84d2e 0%, #3d2018 100%)',
    heroOverlay: 'linear-gradient(135deg, #1e0c07 0%, #3d2018 40%, #5a2e18 70%, #c0613a 100%)',
    surfaceGradient: 'linear-gradient(145deg, #3d2018 0%, #1e0c07 100%)',
    cardGradient: 'linear-gradient(145deg, #5a2e18 0%, #3d2018 100%)',
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

  // Semantic Colors
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
};

export const commonColors = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export default { light: lightColors, dark: darkColors, common: commonColors };