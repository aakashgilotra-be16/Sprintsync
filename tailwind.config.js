/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'jira-blue': '#0052CC',
        'jira-dark': '#091E42',
        'jira-gray': '#F4F5F7',
      },
    },
  },
  plugins: [],
};
