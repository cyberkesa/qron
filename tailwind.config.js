/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
        },
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
      },
      // keep existing primary as alias to brand
      // primary palette kept for backward compatibility
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
        },
      },
      fontSize: {
        // Customize the font sizes for better mobile experience
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.813rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.5rem' }],
        lg: ['1rem', { lineHeight: '1.75rem' }],
        xl: ['1.125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.25rem', { lineHeight: '2rem' }],
        '3xl': ['1.5rem', { lineHeight: '2.25rem' }],
        '4xl': ['1.875rem', { lineHeight: '2.5rem' }],
        '5xl': ['2.25rem', { lineHeight: '2.5rem' }],
        xxs: ['0.625rem', { lineHeight: '0.75rem' }], // 10px
        tiny: ['0.5625rem', { lineHeight: '0.75rem' }], // 9px
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
      },
      scale: {
        98: '0.98',
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
      spacing: {
        0.25: '0.0625rem', // 1px
        0.75: '0.1875rem', // 3px
        1.25: '0.3125rem', // 5px
        1.75: '0.4375rem', // 7px
        2.25: '0.5625rem', // 9px
        2.75: '0.6875rem', // 11px
        3.25: '0.8125rem', // 13px
        3.75: '0.9375rem', // 15px
        4.25: '1.0625rem', // 17px
        4.75: '1.1875rem', // 19px
        5.25: '1.3125rem', // 21px
        5.75: '1.4375rem', // 23px
        6.25: '1.5625rem', // 25px
        6.75: '1.6875rem', // 27px
        7.25: '1.8125rem', // 29px
        7.75: '1.9375rem', // 31px
      },
    },
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
};
