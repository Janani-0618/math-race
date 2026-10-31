import { useState } from 'react';
import { Copy, Check, Crown, LogOut } from 'lucide-react';
import RaceTrack from '../components/RaceTrack';
import { avatarColor, initial } from '../utils/format';

export default function Waiting({ room, me, onStart, onLeave }) {
  const [copied, setCopied] = useState(false);
  const isHost = room.hostId === me;
  const count = room.players.length;

  async function copy() {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable on plain http – the code is shown on screen anyway */
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      {/* animated room-code card */}
      <div className="panel animate-glow relative overflow-hidden p-6 text-center">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-orange-400" />
        <p className="text-sm font-semibold tracking-widest text-cyan-200">ROOM CODE</p>
        <p className="gradient-anim neon-text mt-1 text-6xl font-bold tracking-[0.3em] sm:text-7xl" aria-label={`Room code ${room.code.split('').join(' ')}`}>{room.code}</p>
        <button onClick={copy} className="btn-ghost mx-auto mt-3 px-5 py-2 text-sm" aria-label="Copy room code">
          {copied ? <Check size={16} className="text-neon" /> : <Copy size={16} />} {copied ? 'Copied!' : 'COPY CODE'}
        </button>
        <p className="mt-3 text-sm text-slate-200">
          Friends join at <span className="font-semibold text-white">{window.location.host}</span> with this code
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_290px]">
        <section className="panel p-4" aria-label="Players">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold">Players</h2>
            <span className="rounded-full bg-cyan-300/15 px-3 py-1 text-sm font-semibold text-cyan-100">Players Ready: {count} / {room.maxPlayers}</span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={room.maxPlayers} aria-valuenow={count} aria-label="Room capacity">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-orange-400 transition-[width] duration-500" style={{ width: `${(count / room.maxPlayers) * 100}%` }} />
          </div>
          <ol className="grid max-h-[340px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {room.players.map((p, i) => (
              <li key={p.id} style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}
                className={`flex animate-pageIn items-center gap-3 rounded-xl border px-3 py-2 ${p.id === me ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 bg-white/[0.04]'} ${p.connected ? '' : 'opacity-50'}`}>
                <span className="w-5 text-sm tabular-nums text-slate-300">{i + 1}.</span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-base font-bold text-ink" style={{ background: avatarColor(p.name) }}>{initial(p.name)}</span>
                <span className="flex-1 truncate">{p.name}{p.id === me && <span className="ml-2 rounded bg-cyan-300/20 px-1.5 py-0.5 text-xs text-cyan-100">you</span>}</span>
                {p.id === room.hostId && <Crown size={16} className="text-amber-300" aria-label="Host" />}
              </li>
            ))}
          </ol>
        </section>

        <section className="panel flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="animate-bobble text-5xl" aria-hidden>🚀</div>
          {isHost ? (
            <>
              <p className="text-slate-100">You are the host. Start whenever everyone is in.</p>
              <button className="btn-hot w-full text-lg" onClick={onStart}>🏁 START RACE</button>
            </>
          ) : (
            <p className="text-slate-100">Waiting for the host to start the race<span className="animate-pulse">…</span></p>
          )}
          <p className="text-sm text-slate-200">Waiting for players<span className="animate-pulse">...</span></p>
          <p className="rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-100">{room.total} questions · {room.questionSeconds} seconds each · faster answers score more</p>
          <button onClick={onLeave} className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white">
            <LogOut size={14} /> Leave room
          </button>
        </section>
      </div>

      <RaceTrack players={room.players} meId={me} maxScore={room.maxScore} title="Starting grid" />
    </div>
  );
}
