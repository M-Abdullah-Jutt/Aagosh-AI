/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#f4f9f4',
          100: '#e0f0e0',
          200: '#bbdebb',
          300: '#8ac68a',
          400: '#5aac5a',
          500: '#3d9440',
          600: '#2e7a31',
          700: '#266029',
          800: '#1f4d22',
          900: '#193f1b',
        },
        brand: {
          50: '#fff8f0',
          100: '#ffefd9',
          200: '#ffd9a8',
          300: '#ffbd6b',
          400: '#ff9a2e',
          500: '#f77c0a',
          600: '#e06000',
          700: '#b84800',
          800: '#943a00',
          900: '#7a3000',
        },
        calm: {
          sand: '#fffdf7',
          warm: '#fff3d9',
          slate: '#475569',
          teal: '#2e7a31',
          softYellow: '#fffde7',
          heading: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'Noto Naskh Arabic', 'Jameel Noori Nastaleeq', 'Segoe UI', 'serif'],
      }
    },
  },
  plugins: [],
}
