/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
 theme: {
    extend: {
      // 1. Define your custom color palette
      colors: {
        // Primary Colors
        'field-green': {
          50: '#f2f8f3',
          100: '#e5f1e7',
          200: '#cae3cf',
          300: '#9fcaa9',
          400: '#6da87d',
          500: '#2E8B57', // PRIMARY
          600: '#227046',
          700: '#1c5a39',
          800: '#18482f',
          900: '#143b26',
        },
        'warm-earth': {
          50: '#fdf7f2',
          100: '#faede2',
          200: '#f3d6c0',
          300: '#eab892',
          400: '#de8f5b',
          500: '#B5651D', // PRIMARY
          600: '#a15719',
          700: '#864717',
          800: '#6b3916',
          900: '#572f14',
        },
        'sky-blue': {
          50: '#f0f7ff',
          100: '#e1effe',
          200: '#bae0fd',
          300: '#7cc7fc',
          400: '#36adf7',
          500: '#4A90E2', // PRIMARY (Note: Adjusted for harmony)
          600: '#0c69b8',
          700: '#0a5494',
          800: '#09467a',
          900: '#0c3b65',
        },
        'sunshine-yellow': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F2C94C', // PRIMARY
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'background-cream': '#FFF9E6',
      },
      // 2. Define your custom gradients
      backgroundImage: {
        // Header Gradient: Left to Right (Sunshine -> Field)
        'header-gradient': 'linear-gradient(90deg, #F2C94C 0%, #2E8B57 100%)',
        // Notice Gradient: Top to Bottom (Light Cream -> Sunshine)
        'notice-gradient': 'linear-gradient(180deg, #FFE39B 0%, #F2C94C 100%)',
        // Button Gradient: Top to Bottom (Light Green -> Field Green)
        'button-primary': 'linear-gradient(180deg, #3DA56B 0%, #2E8B57 100%)',
        // Hero Gradient: Diagonal (Sky Blue -> Field Green)
        'hero-gradient': 'linear-gradient(45deg, #4A90E2 0%, #2E8B57 100%)',
        // Success Gradient: Top to Bottom (Light Teal -> Field Green)
        'success-gradient': 'linear-gradient(180deg, #A3E4D7 0%, #2E8B57 100%)',
      },
      // 3. You can also extend other properties if needed, like animation for a modern touch
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
