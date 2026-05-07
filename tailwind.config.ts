import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)'],
        mono: ['var(--font-dm-mono)', 'monospace'],
        body: ['var(--font-dm-sans)'],
      },
      colors: {
        carbon: {
          950: '#070709',
          900: '#0d0d10',
          800: '#141418',
          700: '#1c1c22',
          600: '#26262e',
        },
        cyan: { neon: '#00d4ff' },
        amber: { hot: '#f59e0b' },
        steel: '#8892a4',
      },
      animation: {
        'trace': 'trace 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        trace: {
          '0%, 100%': { opacity: '0.3', transform: 'scaleX(0)' },
          '50%': { opacity: '1', transform: 'scaleX(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
