/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4a90e2',
          dark: '#3a7bc8',
          light: '#6ba3e8',
        },
        secondary: {
          DEFAULT: '#2c3e50',
          dark: '#1a252f',
        },
        success: {
          DEFAULT: '#27ae60',
          dark: '#229954',
        },
        danger: {
          DEFAULT: '#e74c3c',
          dark: '#c0392b',
        },
        warning: {
          DEFAULT: '#f39c12',
        },
      },
      boxShadow: {
        'custom': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'custom-lg': '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}

