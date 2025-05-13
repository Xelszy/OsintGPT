/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        black: '#000000',
        transparent: 'transparent',
        current: 'currentColor',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        sky: {
          500: '#0EA5E9',
          600: '#0284C7',
        },
        violet: {
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        background: {
          DEFAULT: "#FCFCF9",
          100: "#FFFFFF",
          200: "#F5F5F2",
          300: "#EAEAE6",
        },
        backgroundDark: {
          DEFAULT: "#100E12",
          100: "#19161D",
          200: "#211E26",
        },
        offset: {
          DEFAULT: "#F5F5F2",
        },
        offsetDark: {
          DEFAULT: "#19161D",
        },
        offsetPlus: {
          DEFAULT: "#EAEAE6",
        },
        offsetPlusDark: {
          DEFAULT: "#211E26",
        },
        textMain: {
          DEFAULT: "#1C1A1E",
        },
        textMainDark: {
          DEFAULT: "#FFFFFF",
        },
        textOff: {
          DEFAULT: "#6C6B70",
        },
        textOffDark: {
          DEFAULT: "#ADACB0",
        },
        text: {
          100: "#333333",
          200: "#6C6B70",
        },
        super: {
          DEFAULT: "#5157E9",
        },
        superDark: {
          DEFAULT: "#818DF7",
        },
        superDuper: {
          DEFAULT: "#818DF7",
        },
        borderMain: {
          DEFAULT: "#E5E5E2",
        },
        borderMainDark: {
          DEFAULT: "#29262E",
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        two: '0.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'in': 'fadeIn 0.3s ease-out',
        'slide-in-from-bottom': 'slideInFromBottom 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromBottom: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}; 