import { useEffect } from 'react';
import { sfx } from '../utils/sound';

export default function Countdown({ n }) {
  const value = n ?? 3;
  const go = value === 0;
  useEffect(() => { if (go) sfx.go(); else sfx.warn(); }, [value, go]);
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div>
        <p className="mb-2 text-lg font-semibold tracking-widest text-cyan-200">GET READY</p>
        <div key={value} className={`animate-pop font-bold italic ${go ? 'text-6xl sm:text-8xl' : 'text-[9rem] leading-none sm:text-[13rem]'}`}
          style={{ filter: 'drop-shadow(0 0 28px rgba(228,79,232,.55))' }}>
          <span className="gradient-text">{go ? 'GO!' : value}</span>{go && <span aria-hidden> 🏁</span>}
        </div>
      </div>
    </div>
  );
}
