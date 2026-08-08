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
        navy: {
          50: '#F0F4FA',
          100: '#D9E2EC',
          500: '#1E3A8A',
          800: '#0F172A',
          900: '#090D16',
        },
      },
    },
  },
  plugins: [],
}
