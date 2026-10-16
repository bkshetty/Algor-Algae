/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      colors: {
        ground: '#060a12',
        'ground-secondary': '#090f19',
        'surface-glass': 'rgba(13, 21, 34, 0.75)',
        ink: {
          primary: '#ede7dc',
          secondary: '#9ea5a8',
          muted: '#6c7378'
        },
        accent: {
          green: '#10b981',
          cyan: '#0284c7',
          amber: '#f59e0b',
          crimson: '#ef4444'
        },
        hairline: 'rgba(237, 231, 220, 0.13)'
      }
    },
  },
  plugins: [],
}
