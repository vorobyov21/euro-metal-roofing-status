/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'euro-green': '#5CB85C',
        'euro-green-dark': '#4A9A4A',
        'euro-gray': '#2D3436',
        'euro-gray-light': '#636E72',
      },
    },
  },
  plugins: [],
}
