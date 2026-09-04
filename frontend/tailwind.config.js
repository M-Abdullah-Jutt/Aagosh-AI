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
          50: '#f4f9f6',
          100: '#e4f2eb',
          200: '#c6e3d5',
          300: '#9dcca9',
          400: '#6eb083',
          500: '#4a9464',
          600: '#38774f',
          700: '#2f5f41',
          800: '#284d36',
          900: '#22402e',
        },
        calm: {
          sand: '#fcfaf7',
          warm: '#f7f3ec',
          slate: '#475569',
          teal: '#0d9488',
          softBlue: '#f0f7ff',
          heading: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
