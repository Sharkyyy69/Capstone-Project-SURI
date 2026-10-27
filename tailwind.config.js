/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(16, 185, 129, 0.15), 0 15px 40px rgba(16, 185, 129, 0.15)',
      },
    },
  },
  plugins: [],
};
