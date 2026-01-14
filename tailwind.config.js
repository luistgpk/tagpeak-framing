/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./assets/**/*.js",
    "./api/**/*.js"
  ],
  safelist: [
    // Dynamic grid columns (using pattern for any number)
    {
      pattern: /grid-cols-(7|9)/,
    },
    // Common dynamic classes that might be in template strings
    'border-blue-500',
    'bg-blue-50',
    'shadow-md',
    'scale-105',
    'border-gray-300',
    'hover:border-blue-300',
    'hover:bg-gray-50',
    'hover:border-blue-400',
    'hover:bg-blue-50',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
