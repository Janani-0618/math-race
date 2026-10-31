import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import MathLoader from '../components/MathLoader';

export default function Entry({ mode, onSubmit, onBack }) {
  const isJoin = mode === 'join';
  const [name, setName] = useState(() => sessionStorage.getItem('mathrace.nick') || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setError('Enter a nickname to continue.');
    if (isJoin && code.trim().length !== 6) return setError('Room codes are 6 characters long.');
    setError('');
    setBusy(true);
    sessionStorage.setItem('mathrace.nick', n);
    const res = await onSubmit(n, code.trim().toUpperCase());
    setBusy(false);
    if (!res?.ok) setError(res?.error || 'Something went wrong. Try again.');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white">
        <ArrowLeft size={16} /> Back
      </button>
      <form onSubmit={submit} className="panel relative space-y-5 overflow-hidden p-6 sm:p-8" noValidate>
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-orange-400" />
        <div>
          <p className="text-3xl">{isJoin ? '🏁' : '🚀'}</p>
          <h1 className="mt-1 text-3xl font-bold italic">{isJoin ? 'Join a race' : 'Create a race'}</h1>
          <p className="mt-1 text-sm text-slate-300">{isJoin ? 'Ask the host for the 6-character room code.' : 'Pick a nickname. You will get a room code to share.'}</p>
        </div>
        <div>
          <label htmlFor="nick" className="mb-1.5 block text-sm font-semibold text-slate-200">Player name</label>
          <input id="nick" className="input" value={name} maxLength={16} autoFocus autoComplete="off"
            placeholder="e.g. Alex" onChange={(e) => setName(e.target.value)} />
        </div>
        {isJoin && (
          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-semibold text-slate-200">Room code</label>
            <input id="code" className="input text-center text-2xl font-bold uppercase tracking-[0.35em]" value={code}
              maxLength={6} autoComplete="off" placeholder="ABC123"
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
          </div>
        )}
        {error && <p role="alert" className="rounded-xl border border-hot/50 bg-hot/10 px-3 py-2 text-sm text-pink-200">{error}</p>}
        <button type="submit" disabled={busy} className={`${isJoin ? 'btn-primary' : 'btn-hot'} w-full text-lg`}>
          {busy ? <MathLoader compact label="Connecting…" /> : isJoin ? '🏁 JOIN RACE' : '🚀 CREATE RACE'}
        </button>
      </form>
    </div>
  );
}
