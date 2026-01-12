/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        player: {
          red: '#E53935',
          blue: '#1E88E5',
          green: '#43A047',
          purple: '#8E24AA',
          orange: '#FB8C00',
          teal: '#00ACC1',
          pink: '#D81B60',
          amber: '#FFB300',
        },
        game: {
          bg: '#0a0a0f',
          card: '#12121a',
          border: '#2a2a3a',
          accent: '#6366f1',
          glow: '#818cf8',
        }
      },
      fontFamily: {
        game: ['Rajdhani', 'Orbitron', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
