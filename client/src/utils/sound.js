// Optional sound effects (Web Audio – no audio files). OFF by default; the choice is remembered on this device.
let ctx = null;
let enabled = false;
try { enabled = localStorage.getItem('mathrace.sound') === 'on'; } catch { /* ignore */ }

export const isSoundOn = () => enabled;
export function setSound(on) {
  enabled = on;
  try { localStorage.setItem('mathrace.sound', on ? 'on' : 'off'); } catch { /* ignore */ }
  if (on) tone(660, 0.1);
}

function tone(freq, dur = 0.12, type = 'sine', vol = 0.05, delay = 0) {
  if (!enabled) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  } catch { /* audio not available – ignore */ }
}

export const sfx = {
  correct() { tone(660, 0.1); tone(880, 0.16, 'sine', 0.05, 0.1); },
  wrong() { tone(200, 0.22, 'triangle', 0.045); },
  warn() { tone(520, 0.07, 'square', 0.025); },
  go() { tone(523, 0.1); tone(784, 0.2, 'sine', 0.05, 0.1); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.2, 'sine', 0.05, i * 0.14)); },
};
