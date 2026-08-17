/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif']
      },
      colors: {
        darkBg: '#080c14',
        cardBg: 'rgba(15, 23, 42, 0.8)',
        forgeGold: '#f59e0b',
        forgeCyan: '#06b6d4',
        forgePurple: '#8b5cf6',
        forgeEmerald: '#10b981'
      }
    }
  },
  plugins: []
}
