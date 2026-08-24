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
          darkest: "#090D12", // Warmer, premium dark charcoal
          surface: "#0D131C",
          elevated: "#121924",
          card: "rgba(255, 255, 255, 0.05)",
        },
        glass: {
          fill: "rgba(255, 255, 255, 0.05)",
          hover: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.10)",
          highlight: "rgba(255, 255, 255, 0.16)",
        },
        accent: {
          sage: "#10B981",    // Refined calm emerald/sage
          emerald: "#34D399",
          mint: "#6EE7B7",
          warm: "#F59E0B",     // Secondary warm terracotta/amber contrast accent
          rose: "#E11D48",
        },
        status: {
          good: "#10B981",
          slight: "#F59E0B",
          poor: "#F43F5E",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          tertiary: "#64748B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'glass-subtle': '0 8px 32px 0 rgba(0, 0, 0, 0.28)',
        'glass-glow': '0 12px 40px 0 rgba(0, 0, 0, 0.45)',
        'sage-glow': '0 0 30px -5px rgba(16, 185, 129, 0.25)',
        'warm-glow': '0 0 30px -5px rgba(245, 158, 11, 0.25)',
      },
      animation: {
        'blob-slow': 'blobFloat 28s infinite ease-in-out',
        'specular-shimmer': 'specularShimmer 8s ease-in-out infinite',
      },
      keyframes: {
        blobFloat: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(25px, -35px) scale(1.08)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.96)' },
        },
        specularShimmer: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.7 },
        }
      }
    },
  },
  plugins: [],
}
