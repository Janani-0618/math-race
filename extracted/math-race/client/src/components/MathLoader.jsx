const SYMBOLS = [['+', 'text-cyan-300'], ['−', 'text-fuchsia-400'], ['×', 'text-orange-300'], ['÷', 'text-indigo-300']];

// Loading indicator made of bouncing math symbols.
export default function MathLoader({ label, compact = false }) {
  return (
    <div role="status" aria-live="polite" className={`flex ${compact ? 'items-center gap-2' : 'flex-col items-center gap-3'}`}>
      <div className={`flex ${compact ? 'gap-1 text-lg' : 'gap-3 text-4xl'} font-bold`}>
        {SYMBOLS.map(([s, c], i) => (
          <span key={s} className={`animate-hop ${c}`} style={{ animationDelay: `${i * 0.15}s` }}>{s}</span>
        ))}
      </div>
      {label && <p className={`${compact ? 'text-sm' : 'text-base'} text-slate-200`}>{label}</p>}
    </div>
  );
}
