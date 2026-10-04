/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#e50914',
          darkRed: '#b81d24',
          black: '#0a0a0c',
          card: '#141417'
        }
      }
    },
  },
  plugins: [],
}
