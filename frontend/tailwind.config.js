/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0C0D1A',
        ink: '#EDEEFF',
        mute: '#A9AEE6',
        blue: '#2F6BFF',
        line: 'rgba(255,255,255,.14)',
        glass: 'rgba(255,255,255,.07)',
      },
      fontFamily: {
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        g0: 'linear-gradient(145deg,#3B3FA8,#1B1D4D)',
        g1: 'linear-gradient(145deg,#2A58D6,#14173A)',
        g2: 'linear-gradient(145deg,#6A3FB5,#1B1240)',
        g3: 'linear-gradient(145deg,#1F7A8C,#10213A)',
        glow: 'radial-gradient(circle at 50% -10%,rgba(60,66,170,.75),transparent 60%),linear-gradient(transparent 60%,rgba(12,13,26,.85))',
        hero: 'linear-gradient(100deg,rgba(18,20,58,.85),rgba(12,13,26,.55))',
      },
      keyframes: {
        bl: { '50%': { opacity: '0' } },
        pl: { '50%': { opacity: '.4' } },
        up: { '30%': { transform: 'translateY(-4px)' } },
      },
      animation: {
        bl: 'bl 1s steps(2) infinite',
        pl: 'pl 1.4s ease-in-out infinite',
        up: 'up 1s infinite',
      },
    },
  },
  plugins: [],
};
