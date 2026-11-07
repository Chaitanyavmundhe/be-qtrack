/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          surface: '#f8f7f4',
          card: '#ffffff',
          stone: '#f1efe9',
          border: '#e4e0d7',
          steel: '#2d333b',
          graphite: '#181b20',
          charcoal: '#0e1116',
          amber: '#d97706',
          orange: '#ea580c',
          gold: '#b45309',
          emerald: '#059669',
          crimson: '#dc2626',
          slate: '#475569',
          muted: '#71717a'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
