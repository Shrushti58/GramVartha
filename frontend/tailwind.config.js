/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Original palette
        cream: '#F9F5F0',
        sand: '#E6CCB2',
        latte: '#DDB892',
        mocha: '#B08968',
        cocoa: '#7F5539',
        clay: '#9C6644',
        'sage-green': '#6B705C',
        
        // Enhanced color system
        primary: {
          50: '#FEFCF9',
          100: '#F9F5F0',
          200: '#E6CCB2',
          300: '#DDB892',
          400: '#B08968',
          500: '#9C6644',
          600: '#7F5539',
          700: '#5D4037',
          800: '#4A3329',
          900: '#3E2723',
        },
        accent: {
          teal: '#2D9CA6',
          'teal-dark': '#1A6A72',
          berry: '#9C4A6A',
          olive: '#8A9B6E',
        },
        // Semantic colors
        background: '#F9F5F0',
        surface: '#FFFFFF',
        text: {
          primary: '#3E2723',
          secondary: '#5D4037',
          muted: '#8D6E63',
        }
      },
      backgroundImage: {
        'earth-gradient': 'linear-gradient(135deg, #E6CCB2 0%, #B08968 100%)',
        'button-gradient': 'linear-gradient(90deg, #6B705C 0%, #7F5539 100%)',
        'button-primary': 'linear-gradient(90deg, #5D4037 0%, #7F5539 100%)',
        'header-gradient': 'linear-gradient(90deg, #F9F5F0 0%, #DDB892 100%)',
        'hero-pattern': 'linear-gradient(135deg, rgba(249, 245, 240, 0.9) 0%, rgba(221, 184, 146, 0.8) 100%)',
      },
      boxShadow: {
        'soft-earth': '0 4px 12px rgba(124, 85, 52, 0.25)',
        'earth-md': '0 6px 20px rgba(124, 85, 52, 0.15)',
        'earth-lg': '0 10px 40px rgba(124, 85, 52, 0.1)',
        'inner-earth': 'inset 0 2px 4px rgba(124, 85, 52, 0.1)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Playfair Display', 'serif'], // Complementary font for headings
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}