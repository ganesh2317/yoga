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
          DEFAULT: "var(--bg)",
          elev: "var(--bg-elev)",
        },
        background: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          border: "var(--surface-border)",
        },
        raised: "var(--raised)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        text: {
          DEFAULT: "var(--text)",
          2: "var(--text-2)",
          3: "var(--text-3)",
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          fg: "var(--accent-fg)",
        },
        /* Primary is an alias for accent — used extensively in the codebase */
        primary: {
          DEFAULT: "var(--primary)",
          400: "var(--primary)",
          500: "var(--primary)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
          fg: "var(--primary-fg)",
        },
        good: {
          DEFAULT: "var(--good)",
          soft: "var(--good-soft)",
        },
        slight: {
          DEFAULT: "var(--slight)",
          soft: "var(--slight-soft)",
        },
        poor: {
          DEFAULT: "var(--poor)",
          soft: "var(--poor-soft)",
        },
        /* Semantic status aliases */
        success: {
          DEFAULT: "var(--success)",
          400: "var(--success)",
          500: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          400: "var(--warning)",
          500: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          400: "var(--danger)",
          500: "var(--danger)",
          soft: "var(--danger-soft)",
        },
        info: {
          DEFAULT: "var(--info)",
          400: "var(--info)",
          500: "var(--info)",
          soft: "var(--info-soft)",
        },
        tier: {
          ground: "var(--tier-ground)",
          breath: "var(--tier-breath)",
          balance: "var(--tier-balance)",
          strength: "var(--tier-strength)",
          mastery: "var(--tier-mastery)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      fontSize: {
        'display': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.01em' }],
        'h1': ['1.625rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        'h2': ['1.25rem', { lineHeight: '1.75rem' }],
        'h3': ['1.0625rem', { lineHeight: '1.5rem' }],
        'body': ['1rem', { lineHeight: '1.5rem' }],
        'label': ['0.875rem', { lineHeight: '1.25rem' }],
        'caption': ['0.75rem', { lineHeight: '1rem' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
      },
      borderRadius: {
        'control': 'var(--radius-control)',
        'card': 'var(--radius-card)',
        'sheet': 'var(--radius-sheet)',
        'hero': 'var(--radius-hero)',
        'pill': 'var(--radius-pill)',
      },
      boxShadow: {
        '1': 'var(--shadow-1)',
        '2': 'var(--shadow-2)',
      },
      transitionTimingFunction: {
        'smooth': 'var(--ease)',
      },
      transitionDuration: {
        'state': 'var(--dur-state)',
        'enter': 'var(--dur-enter)',
        'sheet': 'var(--dur-sheet)',
      },
    },
  },
  plugins: [],
}
