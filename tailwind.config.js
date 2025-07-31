/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

// Helper function to generate color variables
const withOpacity = (variableName) => {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Updated to use CSS variables for dynamic theming
        primary: {
          DEFAULT: withOpacity('--color-primary'),
          50: withOpacity('--color-primary-50'),
          100: withOpacity('--color-primary-100'),
          500: withOpacity('--color-primary-500'),
          600: withOpacity('--color-primary-600'),
          800: withOpacity('--color-primary-800'),
        },
        secondary: {
          DEFAULT: withOpacity('--color-secondary'),
          500: withOpacity('--color-secondary-500'),
        },
        accent: {
          DEFAULT: withOpacity('--color-accent'),
          500: withOpacity('--color-accent-500'),
        },
        surface: withOpacity('--color-surface'),
        neutral: colors.slate,
        success: colors.green,
        warning: colors.yellow,
        danger: colors.red,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.75rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 5s linear infinite',
      },
    },
  },
  plugins: [],
};