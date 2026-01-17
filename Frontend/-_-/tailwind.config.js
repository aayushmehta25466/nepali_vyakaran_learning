/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#667eea',
          dark: '#764ba2',
        },
        secondary: {
          DEFAULT: '#56ab2f',
          light: '#a8e6cf',
        },
      },
      fontFamily: {
        nepali: ['Noto Sans Devanagari', 'sans-serif'],
        english: ['Comic Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
