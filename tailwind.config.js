/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          darkest: "#0B0F14",
          surface: "#0F1620",
          card: "rgba(255, 255, 255, 0.06)",
        },
        glass: {
          fill: "rgba(255, 255, 255, 0.06)",
          hover: "rgba(255, 255, 255, 0.09)",
          border: "rgba(255, 255, 255, 0.12)",
          highlight: "rgba(255, 255, 255, 0.18)",
        },
        accent: {
          green: "#22C55E",
          emerald: "#34D399",
          mint: "#A7F3D0",
        },
        status: {
          good: "#22C55E",
          slight: "#F59E0B",
          poor: "#EF4444",
        },
        text: {
          primary: "#F5F7FA",
          secondary: "#94A3B8",
          tertiary: "#5B6472",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'glass-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'green-glow': '0 0 25px -5px rgba(34, 197, 94, 0.4)',
        'amber-glow': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'red-glow': '0 0 25px -5px rgba(239, 68, 68, 0.4)',
      },
      animation: {
        'blob-slow': 'blobFloat 25s infinite ease-in-out',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        blobFloat: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 0.8, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.03)' },
        }
      }
    },
  },
  plugins: [],
}
