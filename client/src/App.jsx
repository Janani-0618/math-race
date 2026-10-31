import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useGame } from './hooks/useGame';
import SpaceBackground from './components/SpaceBackground';
import MathLoader from './components/MathLoader';
import Landing from './pages/Landing';
import Entry from './pages/Entry';
import Waiting from './pages/Waiting';
import Countdown from './pages/Countdown';
import Game from './pages/Game';
import Results from './pages/Results';
import { isSoundOn, setSound } from './utils/sound';

export default function App() {
  const g = useGame();
  const [view, setView] = useState('landing'); // landing | create | join
  const [sound, setSoundState] = useState(isSoundOn()); // OFF by default
  const { room } = g;

  const toggleSound = () => {
    setSound(!sound);
    setSoundState(!sound);
  };

  const goHome = () => {
    g.leave();
    setView('landing');
  };

  let screen = 'landing';
  let content;
  if (g.restoring) {
    screen = 'loading';
    content = <div className="grid min-h-[60vh] place-items-center"><MathLoader label="Reconnecting to your race…" /></div>;
  } else if (!room) {
    if (view === 'create') {
      screen = 'create';
      content = <Entry mode="create" onSubmit={(name) => g.createRoom(name)} onBack={() => setView('landing')} />;
    } else if (view === 'join') {
      screen = 'join';
      content = <Entry mode="join" onSubmit={(name, code) => g.joinRoom(name, code)} onBack={() => setView('landing')} />;
    } else {
      content = <Landing onCreate={() => setView('create')} onJoin={() => setView('join')} />;
    }
  } else {
    screen = room.state;
    if (room.state === 'WAITING') content = <Waiting room={room} me={g.playerId} onStart={g.startGame} onLeave={goHome} />;
    else if (room.state === 'COUNTDOWN') content = <Countdown n={g.countdown} />;
    else if (room.state === 'PLAYING')
      content = <Game room={room} me={g.playerId} question={g.question} answerResult={g.answerResult} questionEnd={g.questionEnd} onAnswer={g.answer} />;
    else content = <Results room={room} me={g.playerId} onPlayAgain={g.playAgain} onHome={goHome} />;
  }

  return (
    <div className="relative min-h-screen">
      <SpaceBackground />
      <div className="relative z-10">
        {!g.connected && !g.restoring && (
          <div className="bg-hot/25 px-4 py-2 text-center text-sm text-pink-100" role="status">
            Not connected to the game server. Retrying…
          </div>
        )}
        {g.error && (
          <div role="alert" className="fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-pop rounded-xl border border-hot/60 bg-ink px-5 py-3 text-pink-100 shadow-xl">
            {g.error}
          </div>
        )}
        <div key={screen} className="animate-pageIn">{content}</div>
      </div>
      <button onClick={toggleSound} aria-pressed={sound} aria-label={sound ? 'Turn sound effects off' : 'Turn sound effects on'}
        title={sound ? 'Sound on' : 'Sound off'}
        className="fixed bottom-4 right-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-ink/80 text-cyan-200 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
        {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </div>
  );
}
