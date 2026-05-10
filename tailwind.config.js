/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    fontFamily: {
      sans: [
        '"Hiragino Kaku Gothic ProN"',
        '"Yu Gothic UI"',
        '"Noto Sans JP"',
        'system-ui',
        'sans-serif',
      ],
    },
    fontSize: {
      sm: ['1rem', { lineHeight: '1.6' }],
      base: ['1.125rem', { lineHeight: '1.7' }],
      lg: ['1.375rem', { lineHeight: '1.5' }],
      xl: ['1.75rem', { lineHeight: '1.3' }],
      '2xl': ['2rem', { lineHeight: '1.2' }],
      score: ['2.5rem', { lineHeight: '1.0' }],
    },
    extend: {
      colors: {
        ink: '#0F172A',
        sub: '#1E293B',
        primary: '#1D4ED8',
        success: '#15803D',
        danger: '#B91C1C',
        warning: '#B45309',
        line: '#475569',
        bg: '#F1F5F9',
        winBg: '#DCFCE7',
        loseBg: '#FEE2E2',
      },
      minHeight: { btn: '56px', input: '56px', cell: '64px' },
      minWidth: { btn: '144px', cell: '64px' },
    },
  },
  plugins: [],
};
