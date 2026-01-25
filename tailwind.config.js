/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'osamoc-blue': '#004A99',
        'osamoc-gray': '#F4F4F4',
        'osamoc-green': '#28A745',
        'osamoc-red': '#DC3545',
      },
    },
  },
  plugins: [],
}
