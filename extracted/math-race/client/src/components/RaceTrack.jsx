import { Flag } from 'lucide-react';
import Rocket from './Rocket';
import { avatarColor, hueFor, rankPlayers } from '../utils/format';

// Shows you + the top racers (max `maxLanes`), so even 30 players stay readable and fast.
export default function RaceTrack({ players, meId, maxLanes = 6, maxScore = 1500, title = 'Race track' }) {
  const ranked = rankPlayers(players);
  const me = players.find((p) => p.id === meId);
  const others = ranked.filter((p) => p.id !== meId).slice(0, me ? maxLanes - 1 : maxLanes);
  const otherIds = new Set(others.map((p) => p.id));
  // Stable lane order (you first, then join order) so rockets animate smoothly instead of jumping lanes.
  const lanes = [...(me ? [me] : []), ...players.filter((p) => p.id !== meId && otherIds.has(p.id))];
  const hidden = players.length - lanes.length;
  const rankOf = (id) => ranked.findIndex((p) => p.id === id) + 1;
  const medal = (r) => ({ 1: '🥇', 2: '🥈', 3: '🥉' }[r] || `#${r}`);

  return (
    <section className="panel p-3 sm:p-4" aria-label="Race track">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-200">
        <span className="font-semibold">🚀 {title}{hidden > 0 && ` · top ${lanes.length} of ${players.length} racers`}</span>
        <span className="inline-flex items-center gap-1">Finish: {maxScore} pts <Flag size={13} className="text-sun" /></span>
      </div>
      <div className="space-y-1.5">
        {lanes.map((p) => {
          const isMe = p.id === meId;
          const pos = Math.min(100, p.progress ?? 0);
          const trail = isMe ? 'hsl(190 95% 60%)' : `hsl(${hueFor(p.name)} 85% 62%)`;
          return (
            <div key={p.id} className="flex items-center gap-2">
              <div className={`flex w-20 items-center gap-1.5 text-xs sm:w-28 sm:text-sm ${isMe ? 'font-bold text-white' : 'text-slate-200'}`}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: isMe ? trail : avatarColor(p.name) }} />
                <span className="truncate">{p.name}{isMe && <span className="ml-1 text-[10px] text-cyan-200">(you)</span>}</span>
              </div>
              <div className={`lane relative h-12 flex-1 overflow-hidden rounded-xl border-2 ${isMe ? 'border-cyan-300/70 shadow-[0_0_18px_-4px_rgba(103,232,249,0.6)]' : 'border-white/10'}`}>
                <div className="finish absolute inset-y-0 right-0 w-3" />
                <div className="absolute inset-y-0 left-1 right-4">
                  <div className="absolute inset-y-4 left-0 rounded-full transition-[width] duration-1000 ease-out"
                    style={{ width: `${pos}%`, background: `linear-gradient(90deg, transparent, ${trail})`, opacity: 0.5 }} />
                  <div className="absolute top-1/2 transition-[left,transform] duration-1000 ease-out"
                    style={{ left: `${pos}%`, transform: `translate(-${pos}%, -50%)` }}>
                    <Rocket name={p.name} me={isMe} size={isMe ? 50 : 44} flame={isMe || pos > 0} />
                  </div>
                </div>
              </div>
              <div className="flex w-16 items-center justify-end gap-1 text-right text-xs tabular-nums sm:w-20 sm:text-sm">
                <span className="text-slate-300">{medal(rankOf(p.id))}</span>
                <span className="font-semibold text-white">{p.score}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
