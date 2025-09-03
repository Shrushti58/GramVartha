/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gvGreen: '#2f855a',
        gvBlue:  '#1e40af',
        gvYellow:'#f6e05e',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        marathi: ['Hind', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
