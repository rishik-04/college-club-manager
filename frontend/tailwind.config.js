/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        navy: {
          DEFAULT: '#0B1B3A',
          light: '#132A56',
          soft: '#1B3568',
        },
        brand: {
          DEFAULT: '#2F6FEB',
          dark: '#1E54C4',
          soft: '#EAF1FF',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        canvas: '#F4F6FA',
        line: '#E5E9F1',
      }
    },
  },
  plugins: [],
}
