// Lightweight animated background: twinkling stars + slowly floating math symbols (pure CSS, no images).
const ITEMS = [
  ['+', 6, 14, 44, 'text-cyan-300', 9, 0], ['−', 90, 10, 40, 'text-fuchsia-400', 11, -3], ['×', 14, 70, 48, 'text-orange-300', 10, -5],
  ['÷', 84, 66, 44, 'text-indigo-300', 12, -2], ['π', 48, 6, 42, 'text-fuchsia-300', 13, -6], ['√', 70, 38, 46, 'text-cyan-200', 9, -4],
  ['%', 28, 38, 38, 'text-orange-200', 12, -8], ['∑', 8, 42, 40, 'text-indigo-200', 14, -1],
  // the rest are hidden on small phones to keep things light
  ['△', 60, 82, 40, 'text-cyan-300', 10, -7], ['∞', 38, 88, 44, 'text-fuchsia-300', 13, -9], ['=', 94, 30, 36, 'text-orange-300', 11, -2],
  ['○', 22, 18, 34, 'text-indigo-300', 12, -5], ['x²', 76, 90, 38, 'text-cyan-200', 14, -3], ['□', 52, 56, 34, 'text-fuchsia-400', 15, -6],
];

export default function SpaceBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="stars animate-twinkle" />
      <div className="stars-2 animate-twinkle" style={{ animationDelay: '-1.8s' }} />
      {ITEMS.map(([sym, x, y, size, color, dur, delay], i) => (
        <span key={i}
          className={`bg-float absolute animate-floatY select-none font-bold opacity-[0.13] ${color} ${i >= 8 ? 'max-sm:hidden' : ''}`}
          style={{ left: `${x}%`, top: `${y}%`, fontSize: size, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
          {sym}
        </span>
      ))}
    </div>
  );
}
