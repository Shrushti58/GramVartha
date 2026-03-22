/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", 
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7eb',
          100: '#d6edc4',
          200: '#b3d99a',
          300: '#8ac46e',
          400: '#6aaa4a',
          500: '#4e8f33',
          600: '#3a6b26',
          700: '#2d5a1e',
          800: '#243d18',
          900: '#1a2e10',
        },
        accent: {
          mist: '#eef6e6',
          sage: '#d4e8c0',
          lime: '#c8df5e',
          green: '#6aaa4a',
          forest: '#2d5a1e',
        },

        // ─── Light theme tokens ───
        background: '#f8f6f0',
        surface: '#ffffff',
        border: '#d4e8c0',
        text: {
          primary: '#1a2e1a',
          secondary: '#3a5a3a',
          muted: '#7a907a',
          light: '#aac4aa',
        },

        // ─── Dark theme tokens ───
        dark: {
          background: '#0f1a0f',
          surface: '#1a2e1a',
          surface2: '#243d18',
          border: '#2d5a1e',
          text: {
            primary: '#e8f5e0',
            secondary: '#b3d99a',
            muted: '#6aaa4a',
            light: '#4e8f33',
          },
        },
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(135deg, #2d5a1e 0%, #243d18 100%)',
        'green-gradient': 'linear-gradient(135deg, #6aaa4a 0%, #3a6b26 100%)',
        'mist-gradient': 'linear-gradient(135deg, #f8f6f0 0%, #eef6e6 100%)',
        'dark-gradient': 'linear-gradient(135deg, #3a6b26 0%, #1a2e10 100%)',
        'hero-overlay': 'linear-gradient(135deg, rgba(45,90,30,0.95), rgba(36,61,24,0.88))',
        // dark mode gradients
        'dark-surface-gradient': 'linear-gradient(135deg, #1a2e1a 0%, #0f1a0f 100%)',
        'dark-card-gradient': 'linear-gradient(135deg, #243d18 0%, #1a2e1a 100%)',
        'dark-hero-gradient': 'linear-gradient(135deg, #0f1a0f 0%, #1a2e1a 60%, #243d18 100%)',
      },
      boxShadow: {
        'soft': '0 4px 15px rgba(45,90,30,0.06)',
        'medium': '0 4px 20px rgba(45,90,30,0.09)',
        'large': '0 8px 25px rgba(45,90,30,0.12)',
        'hover': '0 8px 30px rgba(45,90,30,0.18)',
        'inner-soft': 'inset 0 2px 4px rgba(45,90,30,0.06)',
        // dark mode shadows
        'dark-soft': '0 4px 15px rgba(0,0,0,0.3)',
        'dark-medium': '0 4px 20px rgba(0,0,0,0.4)',
        'dark-large': '0 8px 25px rgba(0,0,0,0.5)',
        'dark-hover': '0 8px 30px rgba(106,170,74,0.2)',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        body: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.7' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.375rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      transitionDuration: {
        '0': '0ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
  },
  plugins: [],
}