/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      userDrag: {
        'none': 'none',
      }
    },
  },
  plugins: [],
}

