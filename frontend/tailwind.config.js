/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bio: {
          dark: '#0a0f0d',
          panel: '#111a16',
          green: '#10b981',
          emerald: '#059669',
          alert: '#eab308',
          danger: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
