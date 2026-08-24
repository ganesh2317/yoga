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
          darkest: "#0A0E14", // Deep charcoal-navy near-black
          surface: "#0F1620", // Panel/screen background
          card: "#151B24",    // Dark charcoal card fill
        },
        accent: {
          emerald: "#22C55E", // Bright emerald primary accent
          mint: "#34D399",
          amber: "#F59E0B",   // Warm amber/gold highlight & liquid glass material tint
          gold: "#FBBF24",
          red: "#EF4444",     // Poor / error red
        },
        status: {
          good: "#22C55E",
          slight: "#F59E0B",
          poor: "#EF4444",
        },
        text: {
          primary: "#F5F7FA",   // Clean off-white primary
          secondary: "#94A3B8", // Slate grey secondary
          tertiary: "#64748B",  // Muted slate tertiary
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
        serif: ['Manrope', 'sans-serif'], // Fallback mapping so font-serif uses Manrope
      },
      boxShadow: {
        'glass-subtle': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-glow': '0 14px 44px 0 rgba(0, 0, 0, 0.65)',
        'emerald-glow': '0 0 28px -4px rgba(34, 197, 94, 0.35)',
        'amber-glow': '0 0 28px -4px rgba(245, 158, 11, 0.35)',
        'red-glow': '0 0 28px -4px rgba(239, 68, 68, 0.35)',
      },
      animation: {
        'liquid-sweep': 'liquidSweep 650ms ease-out forwards',
        'ring-glint': 'ringGlint 900ms ease-in-out forwards',
      },
      keyframes: {
        liquidSweep: {
          '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' },
          '100%': { transform: 'translateX(200%) translateY(200%) rotate(45deg)' },
        },
        ringGlint: {
          '0%': { opacity: '0', strokeDashoffset: '400' },
          '50%': { opacity: '0.9' },
          '100%': { opacity: '0', strokeDashoffset: '0' },
        },
      }
    },
  },
  plugins: [],
}
