/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        construction: {
          planning: '#4A90D9',
          clearing: '#FFB84D',
          earthwork: '#996633',
          pavement: '#666666',
          finishing: '#66CC66',
          completed: '#333333',
        },
        phase: {
          1: '#4A90D9',
          2: '#FFB84D',
          3: '#996633',
          4: '#666666',
          5: '#66CC66',
          6: '#333333',
        }
      }
    },
  },
  plugins: [],
}
