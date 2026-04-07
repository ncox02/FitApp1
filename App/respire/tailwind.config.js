/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Barlow Condensed', 'sans-serif'],
      },
      colors: {
        // Light theme
        light: {
          bg: '#f5f4f0',
          surface: '#ffffff',
          surface2: '#f0ede8',
          border: '#ddd9d3',
          text: '#1c1917',
          text2: '#6b6560',
          text3: '#a09890',
        },
        // Dark theme
        dark: {
          bg: '#16141f',
          surface: '#1e1c2a',
          surface2: '#272436',
          border: '#312e42',
          text: '#ede8e3',
          text2: '#8a8499',
          text3: '#514d62',
        },
        // Brand accent — same in both themes
        brand: {
          primary: '#5b7cf6',   // blue-indigo
          secondary: '#e8622a', // terracotta
          accent: '#3ec97c',    // green
          warn: '#e8622a',
          danger: '#e04545',
        }
      },
      animation: {
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      }
    }
  },
  plugins: []
}
