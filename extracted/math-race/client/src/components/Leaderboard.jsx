import { rankPlayers, avatarColor, initial } from '../utils/format';

const MEDALS = ['🥇', '🥈', '🥉'];
const ROW = 48; // px per row – rows are absolutely positioned so rank changes glide smoothly

export default function Leaderboard({ players, meId, limit = 8, title = 'Live ranking' }) {
  const ranked = rankPlayers(players);
  const meIdx = ranked.findIndex((p) => p.id === meId);
  const meOutside = meIdx >= limit;

  // slot = visual row. Top `limit` get slots 0..limit-1; if you are outside the top, you sit in a final slot.
  const entries = ranked.slice(0, limit).map((p, i) => ({ p, rank: i + 1, slot: i }));
  if (meOutside) entries.push({ p: ranked[meIdx], rank: meIdx + 1, slot: Math.min(limit, ranked.length) + 0.5 });
  const rows = Math.min(limit, ranked.length) + (meOutside ? 1.5 : 0);

  return (
    <aside className="panel p-3" aria-label="Live ranking">
      <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-bold tracking-wide text-slate-100">
        <span className="text-base" aria-hidden>🏆</span>
        <span className="gradient-text text-base">{title.toUpperCase()}</span>
      </h2>
      <ol className="relative" style={{ height: rows * ROW }}>
        {entries.map(({ p, rank, slot }) => (
          <li key={p.id}
            className={`absolute inset-x-0 flex items-center gap-3 rounded-xl px-3 transition-[top] duration-700 ease-out ${
              p.id === meId ? 'bg-gradient-to-r from-cyan-400/25 to-fuchsia-500/25 ring-1 ring-cyan-300/60' : rank === 1 ? 'bg-amber-300/10' : ''
            } ${p.connected ? '' : 'opacity-50'}`}
            style={{ top: slot * ROW, height: ROW - 4 }}>
            <span className="w-7 text-center text-lg tabular-nums text-slate-300">{rank <= 3 ? MEDALS[rank - 1] : rank}</span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-ink" style={{ background: avatarColor(p.name) }}>{initial(p.name)}</span>
            <span className={`flex-1 truncate ${p.id === meId ? 'font-bold text-white' : 'text-slate-100'}`}>{p.name}</span>
            <span key={p.score} className="inline-block animate-scorePop font-bold tabular-nums text-amber-200">{p.score}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
