import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    screens: {
      xs: '420px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        surface: {
          canvas: '#0A0F18',
          card: '#111827',
          elevated: '#1A2436',
          hover: '#243147',
        },
        border: {
          subtle: '#1F2B3E',
          strong: '#32435C',
        },
        ink: {
          primary: '#F8FAFC',
          secondary: '#B8C5D6',
          muted: '#8494AB',
          inverse: '#06131F',
        },
        brand: {
          DEFAULT: '#22D3EE',
          strong: '#06B6D4',
          hover: '#38E0F8',
          muted: '#083344',
        },
        sport: {
          goal: '#059669',
          'goal-light': '#34D399',
          triple: '#0284C7',
          'triple-light': '#38BDF8',
          miss: '#DC2626',
          'miss-light': '#FB7185',
          warn: '#D97706',
          'warn-light': '#FBBF24',
        },
      },
      fontFamily: {
        sans: ['Outfit', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.35)',
        sticky: '0 8px 24px -8px rgba(0, 0, 0, 0.65)',
        modal: '0 24px 48px -12px rgba(0, 0, 0, 0.75)',
      },
    },
  },
  plugins: [],
}
