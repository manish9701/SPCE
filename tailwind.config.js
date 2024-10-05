/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Space Grotesk', 'sans-serif'],
        'mono': ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        '.leaflet-container': { height: '100%', width: '100%' },
        '.leaflet-div-icon': { background: 'transparent', border: 'none' },
      });
    },
  ],
}

