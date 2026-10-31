export const TOTAL = 10;

// Rank by score, then correct answers, then faster average time.
export function rankPlayers(players) {
  return [...players].sort(
    (a, b) =>
      b.score - a.score ||
      b.correct - a.correct ||
      (a.avgTime || 99) - (b.avgTime || 99) ||
      a.name.localeCompare(b.name)
  );
}

export const percent = (n, d) => (d ? Math.round((n / d) * 1000) / 10 : 0);
export const fmtTime = (s) => (s ? `${s.toFixed(1)}s` : '—');

export function hueFor(name) {
  // FNV-1a hash: names that differ only in their last characters still get clearly different colours
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 360;
}

// Friendly avatar colour for a player name (same hue everywhere: lobby, ranking, track).
export const avatarColor = (name) => `hsl(${hueFor(name)} 85% 62%)`;
export const initial = (name) => (name || '?').trim().charAt(0).toUpperCase();
