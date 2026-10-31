import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Leaderboard from '../components/Leaderboard';
import MathLoader from '../components/MathLoader';
import RaceTrack from '../components/RaceTrack';
import { percent, rankPlayers } from '../utils/format';
import { sfx } from '../utils/sound';

const SPARKS = ['⭐', '✨', '🎉', '⚡', '🌟'];
const CONFETTI = ['#27d6f5', '#e44fe8', '#ffa63d', '#3cf2b5', '#ffd23f', '#818cf8'];
const RING = 2 * Math.PI * 34;

// A, B, C, D each get their own colour so options are quick to tell apart.
const OPT = [
  { badge: 'bg-cyan-300', hover: 'hover:border-cyan-300 hover:shadow-[0_0_0_4px_rgba(103,232,249,0.22)]' },
  { badge: 'bg-fuchsia-400', hover: 'hover:border-fuchsia-400 hover:shadow-[0_0_0_4px_rgba(232,121,249,0.22)]' },
  { badge: 'bg-orange-400', hover: 'hover:border-orange-400 hover:shadow-[0_0_0_4px_rgba(251,146,60,0.22)]' },
  { badge: 'bg-indigo-400', hover: 'hover:border-indigo-400 hover:shadow-[0_0_0_4px_rgba(129,140,248,0.25)]' },
];
const DIFF = {
  'Warm-up': 'border-emerald-300/50 bg-emerald-400/10 text-emerald-100',
  Normal: 'border-cyan-300/50 bg-cyan-400/10 text-cyan-100',
  Challenge: 'border-orange-300/60 bg-orange-400/15 text-orange-100',
};
// ring colour by time left: plenty (cyan/mint) -> low (yellow/orange) -> final 3 s (red)
const PHASE = {
  calm: { from: '#3cf2b5', to: '#27d6f5', text: 'text-white', label: 'seconds' },
  warn: { from: '#ffd23f', to: '#ffa63d', text: 'text-amber-300', label: 'Hurry up!' },
  danger: { from: '#ff5d8f', to: '#ff3b5c', text: 'text-hot', label: 'Last seconds! 🔥' },
};

// Small celebration: stars + a few confetti bits fly outward once (CSS only, disappears with the feedback card).
function Celebration() {
  const items = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const d = 70 + Math.random() * 70;
        const star = i % 3 !== 0;
        return {
          star, e: SPARKS[i % SPARKS.length], color: CONFETTI[i % CONFETTI.length],
          dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.6 - 8, delay: Math.random() * 0.1,
        };
      }),
    []
  );
  return (
    <div className="confetti-piece pointer-events-none absolute left-1/2 top-6 z-10" aria-hidden>
      {items.map((it, i) => (
        <span key={i} className="absolute animate-burst" style={{ '--dx': `${it.dx}px`, '--dy': `${it.dy}px`, animationDelay: `${it.delay}s` }}>
          {it.star ? <span className="text-xl">{it.e}</span> : <span className="block h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} />}
        </span>
      ))}
    </div>
  );
}

export default function Game({ room, me, question, answerResult, questionEnd, onAnswer }) {
  const [now, setNow] = useState(Date.now());
  const [pending, setPending] = useState(null);
  const [isPhone, setIsPhone] = useState(() => window.matchMedia('(max-width: 639px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = () => setIsPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const mine = room.players.find((p) => p.id === me);
  const myRank = rankPlayers(room.players).findIndex((p) => p.id === me) + 1;

  useEffect(() => { setPending(null); }, [question?.index]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, []);

  const ar = question && answerResult?.index === question.index ? answerResult : null;
  const qe = question && questionEnd?.index === question.index ? questionEnd : null;
  // The duration (15 s) always comes from the server (question.durationMs); the client never hard-codes it.
  // elapsed is clamped at 0 because `now` only refreshes every 100 ms and can briefly be older than receivedAt
  const remainingMs = question ? Math.min(question.durationMs, Math.max(0, question.remainingMs - Math.max(0, now - question.receivedAt))) : 0;
  const secs = Math.ceil(remainingMs / 1000);
  const answered = pending !== null || !!ar;
  const locked = answered || !!qe || remainingMs === 0;
  const correctIndex = ar?.correctIndex ?? qe?.correctIndex;
  const explanation = ar?.explanation ?? qe?.explanation;
  const chosen = ar?.chosen ?? pending;
  const revealed = correctIndex != null;

  // timer phases (calm -> warn at the halfway point -> danger in the final 3 seconds)
  const warnAt = question ? Math.floor(question.durationMs / 2000) : 7;
  const phaseKey = locked || !question ? 'calm' : secs <= 3 ? 'danger' : secs <= warnAt ? 'warn' : 'calm';
  const phase = PHASE[phaseKey];
  const frac = question ? remainingMs / question.durationMs : 0;

  // optional sounds (muted unless the player turned sound on)
  useEffect(() => { if (ar) (ar.correct ? sfx.correct() : sfx.wrong()); }, [ar]);
  useEffect(() => { if (question && !locked && secs >= 1 && secs <= 3) sfx.warn(); }, [secs, locked, question]);

  function pick(i) {
    if (locked || !question) return;
    setPending(i);
    onAnswer(i);
  }

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const i = ['a', 'b', 'c', 'd'].indexOf(k);
      const n = ['1', '2', '3', '4'].indexOf(k);
      if (i >= 0) pick(i);
      else if (n >= 0) pick(n);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const optState = (i) => {
    if (revealed) {
      if (i === correctIndex) return `border-neon bg-neon/15 ring-2 ring-neon/40 ${chosen === i ? 'animate-bounceOnce' : ''}`;
      if (i === chosen) return 'border-hot bg-hot/15 animate-gentleShake';
      return 'border-white/10 opacity-40';
    }
    if (chosen === i) return 'border-white bg-white/10 ring-2 ring-white/40';
    if (locked) return 'border-white/10 opacity-50';
    return `cursor-pointer border-white/20 bg-white/[0.06] hover:-translate-y-0.5 hover:bg-white/[0.1] active:scale-[0.99] ${OPT[i].hover}`;
  };
  const badgeClass = (i) => {
    if (revealed && i === correctIndex) return 'bg-neon text-ink';
    if (revealed && i === chosen) return 'bg-hot text-ink';
    return `${OPT[i].badge} text-ink`;
  };

  const lanes = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 6;
  const qNum = question ? question.index + 1 : 0;
  const total = question?.total ?? room.total;
  const raceDone = question ? ((question.index + (qe ? 1 : 0)) / total) * 100 : 0;

  const stat = (label, value, tone, extra) => (
    <div className={`panel bg-gradient-to-br px-2 py-2 sm:px-4 ${tone}`}>
      <p className="text-[11px] text-slate-100 sm:text-xs">{label}</p>
      <p key={String(value)} className="origin-left animate-scorePop text-lg font-bold tabular-nums sm:text-xl">{value}{extra}</p>
    </div>
  );

  const feedbackCard = (ar || qe) && (() => {
    const card = (
      <div className={isPhone ? 'fixed inset-x-3 top-2 z-40 rounded-2xl border border-white/20 bg-ink/95 p-2.5 text-center shadow-2xl' : 'relative rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3'}>
        {ar?.correct && <Celebration key={question.index} />}
        {ar ? (
          ar.correct ? (
            <p className="animate-pop text-2xl font-bold text-neon">✓ CORRECT! +{ar.points} POINTS{ar.points >= 140 && ' ⚡'}</p>
          ) : (
            <p className="animate-gentleShake text-2xl font-bold text-hot">✗ NOT QUITE · +0 POINTS</p>
          )
        ) : (
          <p className="animate-pop text-2xl font-bold text-amber-300">⏱️ TIME&apos;S UP · +0 POINTS</p>
        )}
        {explanation && <p className="mt-1 text-sm text-slate-100 sm:text-base">💡 {explanation}</p>}
        {ar && !qe && <p className="text-xs text-slate-200">Waiting for other racers…</p>}
      </div>
    );
    return isPhone ? createPortal(card, document.body) : card;
  })();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4">
      {/* race completion bar */}
      <div className="flex items-center gap-3" aria-label="Race completion">
        <span className="text-xs font-semibold text-cyan-100">RACE</span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(raceDone)}>
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-orange-400 shadow-[0_0_12px_rgba(228,79,232,0.6)] transition-[width] duration-700 ease-out" style={{ width: `${raceDone}%` }} />
        </div>
        <span className="text-xs font-semibold tabular-nums text-slate-100">{Math.round(raceDone)}%</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        <div className={`panel col-span-4 order-first flex items-center gap-4 px-4 py-2 sm:order-none sm:col-span-1 ${phaseKey === 'danger' ? 'border-hot/70 shadow-[0_0_28px_-6px_rgba(255,93,143,0.7)]' : ''}`}>
          <div className={`relative h-20 w-20 shrink-0 ${phaseKey === 'danger' ? 'animate-pulseRing' : ''}`}>
            <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden>
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={phase.from} /><stop offset="100%" stopColor={phase.to} /></linearGradient>
              </defs>
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="8" className="stroke-line" />
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="8" strokeLinecap="round" stroke="url(#ringGrad)"
                className="transition-[stroke-dashoffset] duration-100 ease-linear" strokeDasharray={RING} strokeDashoffset={RING * (1 - frac)} />
            </svg>
            <span key={phaseKey === 'danger' ? secs : phaseKey}
              className={`absolute inset-0 grid place-items-center text-4xl font-bold tabular-nums ${phase.text} ${phaseKey === 'danger' ? 'animate-tick' : ''}`}
              role="timer" aria-label={`${secs} seconds left`}>{secs}</span>
          </div>
          <div>
            <p className="text-xs text-slate-100">⏱️ Time left</p>
            <p className={`text-sm font-semibold ${phase.text}`}>{phase.label}</p>
          </div>
        </div>
        {stat('Question', question ? `${qNum} / ${total}` : `– / ${total}`, 'from-fuchsia-500/30 to-panel')}
        {stat('Score', mine?.score ?? 0, 'from-orange-400/30 to-panel')}
        {stat('Rank', `#${myRank || '-'}`, 'from-cyan-400/30 to-panel', <span className="ml-1 text-sm font-medium text-slate-200">/ {room.players.length}</span>)}
        {stat('Correct', mine?.correct ?? 0, 'from-emerald-400/30 to-panel', <span className="ml-2 hidden text-sm font-medium text-slate-200 sm:inline">{percent(mine?.correct ?? 0, mine?.attempts ?? 0).toFixed(0)}%</span>)}
      </div>

      <div className="order-4 lg:order-3"><RaceTrack players={room.players} meId={me} maxLanes={lanes} maxScore={room.maxScore} /></div>

      <div className="contents lg:order-2 lg:grid lg:grid-cols-[1fr_300px] lg:gap-3">
        <div className="order-3 space-y-3 lg:order-none">
          <div className="panel relative animate-pageIn overflow-hidden p-6 text-center sm:p-9" key={question?.index}>
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-orange-400" />
            {question ? (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
                  <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-400/10 px-3 py-1 text-fuchsia-100">{question.icon} {question.category}</span>
                  <span className={`rounded-full border px-3 py-1 ${DIFF[question.difficulty] || ''}`}>{question.difficulty}</span>
                </div>
                <h1 className="text-3xl font-bold leading-tight sm:text-4xl xl:text-5xl">{question.text}</h1>
              </>
            ) : (
              <div className="py-6"><MathLoader label="Get ready…" /></div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Answer options">
            {question?.options.map((opt, i) => (
              <button key={`${question.index}-${i}`} disabled={locked} onClick={() => pick(i)} aria-label={`Option ${'ABCD'[i]}: ${opt}`}
                className={`flex min-h-[72px] items-center gap-4 rounded-2xl border-2 px-5 py-3 text-left text-2xl font-semibold transition duration-150 xl:min-h-[84px] xl:text-3xl ${optState(i)}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-bold ${badgeClass(i)}`}>{'ABCD'[i]}</span>
                <span className="flex-1">{opt}</span>
                {revealed && i === correctIndex && <span className="text-neon" aria-label="correct">✓</span>}
                {revealed && i === chosen && i !== correctIndex && <span className="text-hot" aria-label="wrong">✗</span>}
              </button>
            ))}
          </div>

          {/* Feedback + explanation: inline on laptops; on phones a floating card pinned to the top of the screen (rendered in <body>) */}
          <div className="relative text-center sm:min-h-[96px]" aria-live="polite">{feedbackCard}</div>
        </div>
        <div className="order-5 lg:order-none"><Leaderboard players={room.players} meId={me} /></div>
      </div>
    </div>
  );
}
