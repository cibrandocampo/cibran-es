/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        brand:   '#fcd34d',
        accent:  '#4a56a1',
        primary: '#454961',
      },
    },
  },
  plugins: [],
}
