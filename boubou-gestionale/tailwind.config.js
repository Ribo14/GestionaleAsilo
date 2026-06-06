/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#008c95',
          dark: '#006970',
          light: '#e0f5f6',
        },
        danger: '#dc2626',
        warning: '#f59e0b',
        success: '#16a34a',
        neutral: '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
      },
    },
  },
  plugins: [],
}
