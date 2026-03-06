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
        brand: {
          navy:   '#00405c',
          orange: '#f15a29',
          light:  '#f8fafc',
          border: '#e2e8f0',
          muted:  '#64748b',
          text:   '#1e293b',
          card:   '#ffffff',
          hover:  '#f1f5f9',
          navy2:  '#005070',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
