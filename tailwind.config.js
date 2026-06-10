/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        brand: {
          page:    '#f0ede6',
          border:  '#111111',
          header:  '#111111',
          sidebar: '#111111',
        },
        accent: {
          mint:    '#c8f0d8',
          sand:    '#f0e8c8',
          yellow:  '#f5e642',
          pink:    '#f7b3d1',
          purple:  '#c9b8f0',
          active:  '#00c48c',
        },
        shadow: {
          mint:    '#1a6640',
          sand:    '#7a6e00',
          yellow:  '#7a6e00',
          pink:    '#8a2050',
          purple:  '#3d2880',
          black:   '#111111',
        },
        data: {
          positive: '#00c48c',
          negative: '#e63946',
        },
        text: {
          inverted:  '#f0ede6',
          muted:     '#888888',
          muted_inv: '#666666',
        },
        dashed: '#bbbbbb',
      },
    },
  },
  plugins: [],
}
