import { LogIn, Calculator, Zap, Trophy, Users, Timer, GraduationCap } from 'lucide-react';
import Rocket from '../components/Rocket';

const steps = [
  { icon: LogIn, title: 'Join', text: 'The host creates a race. Everyone joins with the 6-character code.', tone: 'bg-cyan-300' },
  { icon: Calculator, title: 'Solve', text: 'Answer 10 quick maths questions. Beat the clock on every one.', tone: 'bg-fuchsia-400' },
  { icon: Zap, title: 'Race', text: 'Correct answers push your rocket forward. Faster answers earn a bonus.', tone: 'bg-orange-400' },
  { icon: Trophy, title: 'Win', text: 'Highest score takes the trophy. Play again for a fresh set!', tone: 'bg-indigo-400' },
];

const demo = [
  { name: 'Alex', dur: '5.2s', delay: '0s', me: true },
  { name: 'Sam', dur: '6.4s', delay: '-2s' },
  { name: 'Ravi', dur: '7.6s', delay: '-4s' },
];

export default function Landing({ onCreate, onJoin }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 text-center sm:pt-12">
      {/* glowing rocket mascot */}
      <div className="relative mx-auto mb-2 grid h-36 w-36 place-items-center sm:h-44 sm:w-44" aria-hidden>
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400/40 via-fuchsia-500/30 to-orange-400/30 blur-2xl" />
        <div className="animate-bobble" style={{ rotate: '-28deg' }}><Rocket me size={130} /></div>
      </div>

      <h1 className="text-6xl font-bold italic tracking-tight sm:text-8xl">
        <span className="gradient-anim neon-text">MATH RACE</span>
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-slate-100 sm:text-2xl">Think Fast. Solve Smart. Race to Victory!</p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/50 bg-cyan-300/15 px-3 py-1 text-cyan-100"><Timer size={15} /> 15 Seconds Per Question</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-300/50 bg-fuchsia-400/15 px-3 py-1 text-fuchsia-100"><GraduationCap size={15} /> Made for Class 12 Students</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300/50 bg-orange-400/15 px-3 py-1 text-orange-100"><Users size={15} /> Up to 30 Players</span>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button className="btn-hot w-full text-xl sm:w-64" onClick={onCreate}>🚀 CREATE RACE</button>
        <button className="btn-ghost w-full text-xl sm:w-64" onClick={onJoin}>🏁 JOIN RACE</button>
      </div>

      {/* decorative live track */}
      <div className="panel mx-auto mt-10 max-w-4xl space-y-2 overflow-hidden p-3" aria-hidden>
        {demo.map((c) => (
          <div key={c.name} className="lane lane-scroll relative h-12 animate-road overflow-hidden rounded-xl border-2 border-white/10">
            <div className="absolute inset-y-0 left-0 flex items-center animate-drive" style={{ animationDuration: c.dur, animationDelay: c.delay }}>
              <Rocket name={c.name} me={c.me} size={48} />
            </div>
            <div className="finish absolute inset-y-0 right-0 w-3" />
          </div>
        ))}
      </div>

      <section className="mx-auto mt-12 max-w-4xl" aria-label="How to play">
        <h2 className="mb-4 text-2xl font-bold">How to play</h2>
        <ol className="grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text, tone }, i) => (
            <li key={title} className="panel animate-pageIn p-5" style={{ animationDelay: `${i * 90}ms` }}>
              <span className={`mb-3 grid h-11 w-11 place-items-center rounded-xl text-ink ${tone}`}><Icon size={22} /></span>
              <p className="text-lg font-bold"><span className="text-slate-300">{i + 1}.</span> {title}</p>
              <p className="mt-1 text-sm text-slate-200">{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
