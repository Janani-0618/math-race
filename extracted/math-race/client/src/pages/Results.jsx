import { useEffect } from 'react';
import { Home, RotateCcw } from 'lucide-react';
import Confetti from '../components/Confetti';
import RaceTrack from '../components/RaceTrack';
import { TOTAL, avatarColor, fmtTime, initial, percent, rankPlayers } from '../utils/format';
import { sfx } from '../utils/sound';

const podium = [
  { idx: 1, label: '🥈 2nd', h: 'h-24', tone: 'from-slate-300/40 to-slate-400/10 border-slate-300/50', delay: '0.5s' },
  { idx: 0, label: '🥇 1st', h: 'h-36', tone: 'from-amber-300/50 to-amber-500/10 border-amber-300/70 shadow-[0_0_34px_-8px_rgba(252,211,77,0.7)]', delay: '0.8s' },
  { idx: 2, label: '🥉 3rd', h: 'h-16', tone: 'from-orange-400/40 to-orange-600/10 border-orange-400/50', delay: '0.2s' },
];
const tileTone = ['from-fuchsia-500/25', 'from-emerald-400/25', 'from-pink-500/25', 'from-cyan-400/25', 'from-sky-400/25', 'from-orange-400/30', 'from-indigo-400/25', 'from-amber-300/25'];

export default function Results({ room, me, onPlayAgain, onHome }) {
  const ranked = rankPlayers(room.players);
  const mine = room.players.find((p) => p.id === me);
  const myRank = ranked.findIndex((p) => p.id === me) + 1;
  const winner = ranked[0];
  const isHost = room.hostId === me;
  const total = room.total || TOTAL;

  useEffect(() => { sfx.win(); }, []);

  const acc = mine ? percent(mine.correct, total) : 0;
  const summary = !mine ? '' : acc >= 80 ? 'Superb run! You are a maths champion.' : acc >= 50 ? 'Nice work! A few more and you will top the board.' : 'Good effort! Play again and beat your score.';

  const tiles = mine && [
    ['Total questions', total],
    ['Correct answers', mine.correct],
    ['Wrong / unanswered', total - mine.correct],
    ['Accuracy', `${acc}%`],
    ['Avg response time', fmtTime(mine.avgTime)],
    ['Final score', mine.score],
    ['Race distance', `${mine.score} m (${mine.progress.toFixed(0)}%)`],
    ['Final rank', `#${myRank}`],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-8">
      <Confetti />

      {/* winner banner with animated trophy */}
      <header className="text-center">
        <div className="relative mx-auto grid h-36 w-36 place-items-center" aria-hidden>
          <div className="absolute inset-0 animate-spinSlow rounded-full opacity-60"
            style={{ background: 'conic-gradient(from 0deg, transparent, rgba(255,210,63,.55), transparent 25%, rgba(228,79,232,.45), transparent 55%, rgba(39,214,245,.5), transparent 80%)', maskImage: 'radial-gradient(circle, transparent 28%, #000 30%, #000 100%)', WebkitMaskImage: 'radial-gradient(circle, transparent 28%, #000 30%, #000 100%)' }} />
          <span className="animate-trophy text-7xl drop-shadow-[0_0_24px_rgba(255,210,63,0.8)]">🏆</span>
        </div>
        <h1 className="mt-1 text-4xl font-bold italic sm:text-6xl"><span aria-hidden>🏁</span> <span className="gradient-anim neon-text">RACE FINISHED!</span></h1>
        {winner && (
          <p className="mt-3 text-xl font-semibold text-slate-100 sm:text-3xl">
            {winner.id === me ? <>🎉 You won, <span className="text-amber-300">{winner.name}</span>!</> : <>Winner: <span className="text-amber-300">{winner.name}</span> with {winner.score} points</>}
          </p>
        )}
      </header>

      {/* animated podium */}
      <div className="mx-auto flex max-w-xl items-end justify-center gap-2 sm:gap-3" aria-label="Podium">
        {podium.filter((s) => ranked[s.idx]).map((s) => {
          const p = ranked[s.idx];
          return (
            <div key={p.id} className="flex flex-1 flex-col items-center">
              <div className="mb-2 animate-pageIn text-center" style={{ animationDelay: s.delay }}>
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-full text-lg font-bold text-ink" style={{ background: avatarColor(p.name) }}>{initial(p.name)}</span>
                <p className={`mt-1 max-w-[110px] truncate text-base font-bold sm:text-lg ${p.id === me ? 'text-cyan-200' : ''}`}>{p.name}</p>
                <p className="text-2xl font-bold tabular-nums text-amber-200">{p.score}</p>
              </div>
              <div className={`w-full origin-bottom animate-rise rounded-t-2xl border-2 border-b-0 bg-gradient-to-b ${s.tone} ${s.h} grid place-items-center text-2xl`} style={{ animationDelay: s.delay }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {mine && (
        <p className="text-center text-lg font-semibold text-cyan-100">
          You finished <span className="text-white">#{myRank}</span> of {ranked.length} · {mine.correct}/{total} correct · avg {fmtTime(mine.avgTime)} — {summary}
        </p>
      )}

      <div className="panel overflow-x-auto p-2">
        <table className="w-full min-w-[560px] text-left">
          <caption className="sr-only">Final leaderboard</caption>
          <thead className="text-sm text-cyan-100">
            <tr>{['Rank', 'Player', 'Score', 'Correct', 'Accuracy', 'Avg Time'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {ranked.map((p, i) => (
              <tr key={p.id} className={`border-t border-white/10 ${p.id === me ? 'bg-gradient-to-r from-cyan-400/20 to-fuchsia-500/20 font-semibold' : i % 2 ? 'bg-white/[0.03]' : ''}`}>
                <td className="px-3 py-2 tabular-nums">{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td>
                <td className="px-3 py-2">{p.name}{!p.connected && <span className="ml-2 text-xs text-slate-300">left</span>}</td>
                <td className="px-3 py-2 font-bold tabular-nums text-amber-200">{p.score}</td>
                <td className="px-3 py-2 tabular-nums">{p.correct}/{total}</td>
                <td className="px-3 py-2 tabular-nums">{Math.round(percent(p.correct, total))}%</td>
                <td className="px-3 py-2 tabular-nums">{fmtTime(p.avgTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tiles && (
        <section aria-label="Your stats" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map(([label, value], i) => (
            <div key={label} className={`panel bg-gradient-to-br to-panel px-4 py-3 ${tileTone[i]}`}>
              <p className="text-xs text-slate-100">{label}</p>
              <p className="text-xl font-bold tabular-nums">{value}</p>
            </div>
          ))}
        </section>
      )}

      <RaceTrack players={room.players} meId={me} maxScore={room.maxScore} title="Final positions" />

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <button className="btn-hot sm:w-64" onClick={onPlayAgain} disabled={!isHost} title={isHost ? 'Start a fresh set of questions' : 'Only the host can restart'}>
          <RotateCcw size={18} /> {isHost ? 'PLAY AGAIN' : 'WAITING FOR HOST'}
        </button>
        <button className="btn-ghost sm:w-64" onClick={onHome}><Home size={18} /> BACK TO HOME</button>
      </div>
    </div>
  );
}
