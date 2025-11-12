/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          // Modern food delivery palette
          primary: {
            50: '#fff7ed',
            100: '#ffedd5',
            500: '#f97316', // Vibrant orange
            600: '#ea580c',
            700: '#c2410c',
            900: '#7c2d12',
          },
          dark: {
            DEFAULT: '#0f172a',
            light: '#1e293b',
          },
          accent: {
            yellow: '#fbbf24',
            green: '#10b981',
            red: '#ef4444',
          }
        },
        fontFamily: {
          heading: ['Playfair Display', 'serif'],
          body: ['Inter', 'sans-serif'],
        },
        boxShadow: {
          'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          'glow': '0 0 20px rgba(249, 115, 22, 0.4)',
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'hero-pattern': "url('/pattern.svg')",
        }
      },
    },
    plugins: [],
  }