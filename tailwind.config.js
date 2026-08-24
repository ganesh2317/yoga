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
          darkest: "#0C0D10", // Neutral graphite-black (no blue tint)
          surface: "#13151A",
          elevated: "#1A1D24",
          card: "rgba(244, 241, 236, 0.05)",
        },
        glass: {
          fill: "rgba(244, 241, 236, 0.05)",
          hover: "rgba(244, 241, 236, 0.09)",
          border: "rgba(244, 241, 236, 0.10)",
          highlight: "rgba(244, 241, 236, 0.18)",
        },
        accent: {
          forest: "#3F6B4F",   // Deep muted forest/moss green
          moss: "#528364",
          mint: "#88C49D",
          ochre: "#C9A66B",    // Warm ochre/gold secondary accent
          gold: "#E2C389",
          rust: "#C1502E",     // Warm rust/terracotta tertiary alert
        },
        status: {
          good: "#3F6B4F",
          slight: "#C9A66B",
          poor: "#C1502E",
        },
        text: {
          primary: "#F4F1EC",  // Warm off-white
          secondary: "#A8A29B",// Warm grey
          tertiary: "#635E58",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
        display: ['Fraunces', 'serif'],
      },
      boxShadow: {
        'glass-subtle': '0 8px 32px 0 rgba(0, 0, 0, 0.40)',
        'glass-glow': '0 14px 44px 0 rgba(0, 0, 0, 0.55)',
        'forest-glow': '0 0 32px -4px rgba(63, 107, 79, 0.30)',
        'ochre-glow': '0 0 32px -4px rgba(201, 166, 107, 0.30)',
        'rust-glow': '0 0 32px -4px rgba(193, 80, 46, 0.30)',
      },
      animation: {
        'blob-slow': 'blobFloat 32s infinite ease-in-out',
      },
      keyframes: {
        blobFloat: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -30px) scale(1.05)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.97)' },
        },
      }
    },
  },
  plugins: [],
}
