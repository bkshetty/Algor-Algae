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
        sf: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
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
        hairline: 'rgba(237, 231, 220, 0.13)',
        // Apple Retail Design System Tokens (apple-design.md)
        apple: {
          bg: '#F5F5F7',
          surface: '#FFFFFF',
          dark: '#000000',
          text: '#1D1D1F',
          secondary: '#86868B',
          blue: '#0071E3',
          'blue-hover': '#0076DF',
          'blue-link': '#0066CC',
          'blue-tint': '#2997FF',
          border: 'rgba(0, 0, 0, 0.08)',
          'border-dark': 'rgba(255, 255, 255, 0.14)'
        }
      }
    },
  },
  plugins: [],
}
