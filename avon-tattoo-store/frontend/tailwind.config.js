/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
        },
        dark: {
          800: '#18181B',
          900: '#0F0F12',
          950: '#09090B',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['"DM Sans"', 'system-ui', 'sans-serif'],
        dmsans: ['"DM Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
