import { hueFor } from '../utils/format';

// Original SVG racer (no external images). Points right, towards the finish line.
export default function Rocket({ name = '', me = false, size = 46, flame = true }) {
  const color = me ? 'hsl(190 95% 60%)' : `hsl(${hueFor(name)} 85% 62%)`;
  return (
    <svg width={size} height={size / 2} viewBox="0 0 72 36" role="img" aria-label="racing rocket"
      style={{ overflow: 'visible', filter: me ? `drop-shadow(0 0 7px ${color})` : `drop-shadow(0 0 3px ${color})` }}>
      {flame && (
        <g className="rocket-flame">
          <path d="M14 18 L1 10 Q7 18 1 26 Z" fill="#ff9d3d" />
          <path d="M14 18 L6 13.5 Q9.5 18 6 22.5 Z" fill="#fff3b0" />
        </g>
      )}
      <path d="M22 9 L11 1 L28 8 Z" fill={color} opacity="0.85" />
      <path d="M22 27 L11 35 L28 28 Z" fill={color} opacity="0.85" />
      <path d="M14 8 H44 Q66 10 70 18 Q66 26 44 28 H14 Q10 18 14 8 Z" fill={color} />
      <path d="M16 11 H44 Q60 12 66 17 H16 Z" fill="#fff" opacity="0.25" />
      <rect x="25" y="8" width="4" height="20" fill="#0d0a2b" opacity="0.25" />
      <circle cx="42" cy="18" r="5.5" fill="#0d0a2b" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.2" />
      <circle cx="42" cy="18" r="3" fill="#7be8ff" />
    </svg>
  );
}
