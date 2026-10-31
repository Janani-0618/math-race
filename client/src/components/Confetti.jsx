import { useMemo } from 'react';

const COLORS = ['#27d6f5', '#e44fe8', '#ffa63d', '#3cf2b5', '#818cf8', '#ffd23f'];

// One-shot falling confetti (CSS only, ~36 small pieces, hidden for reduced-motion users).
export default function Confetti({ count = 36 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        size: 7 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 1.4,
        dur: 3 + Math.random() * 2.2,
        sway: (Math.random() - 0.5) * 160,
        round: i % 3 === 0,
      })),
    [count]
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`, width: p.size, height: p.round ? p.size : p.size * 0.5, background: p.color,
            borderRadius: p.round ? '50%' : '2px', animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, '--sway': `${p.sway}px`,
          }} />
      ))}
    </div>
  );
}
