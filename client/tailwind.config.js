/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0d0a2b',      // deep indigo background
        panel: '#17123f',    // card surface
        line: '#2e2766',     // borders / empty ring
        neon: '#3cf2b5',     // success / correct (mint)
        volt: '#27d6f5',     // cyan accent
        hot: '#ff5d8f',      // wrong / urgent (pink-red)
        sun: '#ffa63d',      // orange accent
        magenta: '#e44fe8',  // magenta accent
        electric: '#4f7bff', // electric blue accent
      },
      fontFamily: {
        sans: ['"Chakra Petch"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        pageIn: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { '0%': { transform: 'scale(.4)', opacity: 0 }, '60%': { transform: 'scale(1.15)', opacity: 1 }, '100%': { transform: 'scale(1)' } },
        scorePop: { '0%': { transform: 'scale(1.4)', color: '#3cf2b5' }, '100%': { transform: 'scale(1)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        drive: { from: { transform: 'translateX(-20vw)' }, to: { transform: 'translateX(110vw)' } },
        road: { from: { backgroundPositionX: '0px' }, to: { backgroundPositionX: '-56px' } },
        glow: { '0%,100%': { boxShadow: '0 0 0 0 rgba(39,214,245,0)' }, '50%': { boxShadow: '0 0 32px 2px rgba(228,79,232,.35)' } },
        burst: { '0%': { transform: 'translate(0,0) scale(.3)', opacity: 1 }, '100%': { transform: 'translate(var(--dx), var(--dy)) scale(1.2)', opacity: 0 } },
        tick: { '0%': { transform: 'scale(1.35)' }, '100%': { transform: 'scale(1)' } },
        pulseRing: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
        floatY: { '0%': { transform: 'translateY(0) rotate(0deg)' }, '100%': { transform: 'translateY(-26px) rotate(14deg)' } },
        twinkle: { '0%': { opacity: 0.35 }, '100%': { opacity: 0.9 } },
        shimmer: { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '200% 50%' } },
        rise: { '0%': { transform: 'scaleY(0)' }, '100%': { transform: 'scaleY(1)' } },
        confetti: { '0%': { transform: 'translate3d(0,-10vh,0) rotate(0deg)', opacity: 1 }, '100%': { transform: 'translate3d(var(--sway),110vh,0) rotate(720deg)', opacity: 0.9 } },
        hop: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        bobble: { '0%,100%': { transform: 'translateY(0) rotate(-3deg)' }, '50%': { transform: 'translateY(-10px) rotate(3deg)' } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        flame: { '0%': { transform: 'scaleX(0.7)' }, '100%': { transform: 'scaleX(1.2)' } },
        bounceOnce: { '0%,100%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.04)' }, '70%': { transform: 'scale(0.99)' } },
        gentleShake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-4px)' }, '75%': { transform: 'translateX(4px)' } },
        trophy: { '0%': { transform: 'scale(0) rotate(-20deg)', opacity: 0 }, '60%': { transform: 'scale(1.2) rotate(6deg)', opacity: 1 }, '100%': { transform: 'scale(1) rotate(0)' } },
      },
      animation: {
        pageIn: 'pageIn .4s ease-out both',
        pop: 'pop .45s ease-out both',
        scorePop: 'scorePop .5s ease-out both',
        shake: 'shake .35s ease-in-out',
        drive: 'drive 6s linear infinite',
        road: 'road .5s linear infinite',
        glow: 'glow 2.4s ease-in-out infinite',
        burst: 'burst .9s ease-out both',
        tick: 'tick .5s ease-out',
        pulseRing: 'pulseRing .8s ease-in-out infinite',
        floatY: 'floatY 9s ease-in-out infinite alternate',
        twinkle: 'twinkle 3.5s ease-in-out infinite alternate',
        shimmer: 'shimmer 6s linear infinite',
        rise: 'rise .8s cubic-bezier(.2,.9,.3,1) both',
        confetti: 'confetti 4s ease-in both',
        hop: 'hop 1s ease-in-out infinite',
        bobble: 'bobble 3.2s ease-in-out infinite',
        spinSlow: 'spinSlow 14s linear infinite',
        flame: 'flame .18s ease-in-out infinite alternate',
        bounceOnce: 'bounceOnce .5s ease-out',
        gentleShake: 'gentleShake .5s ease-in-out',
        trophy: 'trophy .9s cubic-bezier(.2,1.2,.4,1) both',
      },
    },
  },
  plugins: [],
};
