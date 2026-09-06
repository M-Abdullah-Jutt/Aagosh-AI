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
          50: '#f5f7f5',
          100: '#e7ece6',
          200: '#ced9cb',
          300: '#aebfa9',
          400: '#9eb195',
          500: '#758d6b',
          600: '#5a6f51',
          700: '#485841',
          800: '#3a4735',
          900: '#303b2c',
        },
        brand: {
          50: '#fcf6f4',
          100: '#faece7',
          200: '#f3d4c8',
          300: '#eab5a2',
          400: '#de9076',
          500: '#c87b5f',
          600: '#ae5f45',
          700: '#914a34',
          800: '#773f2e',
          900: '#633628',
        },
        calm: {
          sand: '#fbf6f0',
          warm: '#f4e4d7',
          slate: '#475569',
          teal: '#0d9488',
          softBlue: '#f0f7ff',
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
