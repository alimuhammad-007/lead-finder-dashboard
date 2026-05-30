/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Primary display font — geometric, premium feel
        display: ['"DM Sans"', 'sans-serif'],
        // Body font — clean and readable
        body:    ['"Inter"', 'sans-serif'],
        // Mono font — for code/IDs
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Brand colors — deep navy + electric cyan
        brand: {
          50:  '#e0f9ff',
          100: '#b3efff',
          200: '#66deff',
          300: '#00c8ff',
          400: '#00b4e6',
          500: '#0099cc',
          600: '#007aad',
          700: '#005c8f',
          800: '#003d6b',
          900: '#001f3f',
        },
        // UI surface colors
        surface: {
          950: '#030712',
          900: '#0d1117',
          800: '#161b22',
          700: '#21262d',
          600: '#30363d',
          500: '#484f58',
        },
      },
      backgroundImage: {
        // Gradient meshes used in backgrounds
        'mesh-1': 'radial-gradient(at 40% 20%, hsla(195,100%,50%,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(220,100%,56%,0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(195,85%,40%,0.05) 0px, transparent 50%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'glow':      '0 0 20px rgba(0, 200, 255, 0.15)',
        'glow-lg':   '0 0 40px rgba(0, 200, 255, 0.2)',
        'card':      '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5)',
        'card-lg':   '0 10px 40px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}