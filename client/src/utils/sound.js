let _bgAudio = new Audio('/game-over.mpeg');
_bgAudio.loop = true;
let _fadeInterval = null;

let _ctx = null;
function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function tone(freq, dur, type = 'sine', vol = 0.25, delay = 0) {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur + 0.05);
  } catch {}
}

export const sounds = {
  correct() {
    tone(523, 0.12, 'sine', 0.3);
    tone(659, 0.12, 'sine', 0.3, 0.1);
    tone(784, 0.25, 'sine', 0.35, 0.2);
  },
  wrong() {
    tone(220, 0.15, 'sawtooth', 0.2);
    tone(180, 0.25, 'sawtooth', 0.15, 0.12);
  },
  tick() {
    tone(880, 0.04, 'square', 0.08);
  },
  urgentTick() {
    tone(1100, 0.06, 'square', 0.18);
  },
  join() {
    tone(440, 0.08, 'sine', 0.12);
    tone(550, 0.12, 'sine', 0.12, 0.08);
  },
  start() {
    [523, 587, 659, 784].forEach((f, i) => tone(f, 0.18, 'sine', 0.3, i * 0.1));
  },
  countdown() {
    tone(660, 0.08, 'square', 0.2);
  },
  playBg() {
    try {
      if (_fadeInterval) clearInterval(_fadeInterval);
      _bgAudio.currentTime = 0;
      _bgAudio.volume = 0;
      const targetVolume = sounds.getBgVolume();
      _bgAudio.play().catch(e => console.log('Audio auto-play blocked', e));
      
      let currentVol = 0;
      _fadeInterval = setInterval(() => {
        currentVol += 0.05;
        if (currentVol >= targetVolume) {
          _bgAudio.volume = targetVolume;
          clearInterval(_fadeInterval);
        } else {
          _bgAudio.volume = currentVol;
        }
      }, 200);
    } catch (e) {
      console.log('Error playing background audio:', e);
    }
  },
  stopBg() {
    try {
      if (_fadeInterval) clearInterval(_fadeInterval);
      _bgAudio.pause();
      _bgAudio.currentTime = 0;
    } catch {}
  },
  setBgVolume(vol) {
    if (_fadeInterval) clearInterval(_fadeInterval);
    _bgAudio.volume = vol;
    try {
      localStorage.setItem('bb_bg_volume', vol);
    } catch {}
  },
  getBgVolume() {
    try {
      const stored = localStorage.getItem('bb_bg_volume');
      if (stored !== null) return parseFloat(stored);
    } catch {}
    return 0.3; // Default lower volume
  }
};
