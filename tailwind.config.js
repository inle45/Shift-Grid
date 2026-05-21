/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rush: {
          bg: '#0A0A0F',
          surface: '#12121A',
          s2: '#1C1C28',
          blue: '#00D4FF',
          pink: '#FF0066',
          green: '#00FF87',
          yellow: '#FFD600',
          purple: '#A855F7',
          text: '#F0F0F8',
          muted: '#5A5A72',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        body: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
