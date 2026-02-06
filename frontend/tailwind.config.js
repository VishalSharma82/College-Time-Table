/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
