/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ecommerce: {
          primary: '#3b82f6',
          dark: '#1e293b',
          accent: '#f59e0b',
        }
      },
    },
  },
  plugins: [],
}