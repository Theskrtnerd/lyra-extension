/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/wxt/entrypoints/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#e8f3ff',
          600: '#0a66c2',
          700: '#004182',
        },
      },
    },
  },
  plugins: [],
} 