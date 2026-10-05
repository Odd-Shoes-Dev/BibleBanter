let _bgAudio = new Audio('/game-over.mp3');
_bgAudio.loop = true;
let _fadeInterval = null;

// ── Clips & iOS audio unlock ─────────────────────────────────────────────────
// iPad/iPhone only let a page play sound when playback starts from a tap, and
// our sounds are triggered by server events instead. So on the user's first
// tap we switch on a Web Audio context and play every clip through it; once
// running, iOS lets it play at any time.
//
// Clips are fetched lazily (applause + last-place + the next wrong-answer clip
// on the first tap, then one wrong-answer clip ahead) so players don't download
// every clip up front.

const CORRECT_CLIPS = [
  'applause', 'oh-my-god-wow',
].map((name) => `/sounds/correct/${name}.mp3`);
const LAST_PLACE = '/sounds/last-place.mp3';
const FIRST_PLACE = '/sounds/first-one.mp3';
// Wrong-answer clips are used interchangeably: shuffled, no repeats until all have played
const WRONG_CLIPS = [
  '/sounds/wrong-answer-1.mp3',
  '/sounds/wrong-answer-2.mp3',
  ...[
    'jesus-1', 'iweee', 'eeeeeh', 'hahahaha', 'have-mercy-upon-us', 'dururu',
    'haha-good-bye', 'mind-their-business', 'mubs', 'laughing-men', 'jehova',
    'chaii-chai', 'ehhh2', 'famous-baby-laugh', 'i-wonder',
    'katonda-wange', 'man-laughs-on-stage', 'ohh-no-no', 'suffer-is-real',
    'mad-man',
  ].map((name) => `/sounds/wrong/${name}.mp3`),
];

let _correctBag = [];
let _lastCorrect = null;

function pullCorrect() {
  if (_correctBag.length === 0) {
    _correctBag = [...CORRECT_CLIPS];
    for (let i = _correctBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [_correctBag[i], _correctBag[j]] = [_correctBag[j], _correctBag[i]];
    }
    const last = _correctBag.length - 1;
    if (_correctBag[last] === _lastCorrect && last > 0) {
      [_correctBag[last], _correctBag[0]] = [_correctBag[0], _correctBag[last]];
    }
  }
  _lastCorrect = _correctBag.pop();
  return _lastCorrect;
}

let _wrongBag = [];
let _lastPulled = null;
let _upNext = null; // wrong-answer clip chosen for the next failure (prefetched)

function pullWrong() {
  if (_wrongBag.length === 0) {
    _wrongBag = [...WRONG_CLIPS];
    for (let i = _wrongBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [_wrongBag[i], _wrongBag[j]] = [_wrongBag[j], _wrongBag[i]];
    }
    // Don't repeat the clip that was just pulled when the bag refills
    const last = _wrongBag.length - 1;
    if (_wrongBag[last] === _lastPulled && last > 0) {
      [_wrongBag[last], _wrongBag[0]] = [_wrongBag[0], _wrongBag[last]];
    }
  }
  _lastPulled = _wrongBag.pop();
  return _lastPulled;
}

// Plain audio elements, created on demand as a fallback when a decoded clip
// isn't ready (fine on Android/desktop)
const _elements = {};
function getElement(src) {
  if (!_elements[src]) {
    _elements[src] = new Audio(src);
  }
  return _elements[src];
}

let _ctx = null;
const _buffers = {};
const _loading = new Set();
let _feedbackSources = [];

function getCtx() {
  if (!_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _ctx = new AC();
  }
  return _ctx;
}

function loadClip(src) {
  const c = _ctx;
  if (!c || !src || _buffers[src] || _loading.has(src)) return;
  _loading.add(src);
  fetch(src)
    .then((r) => r.arrayBuffer())
    // Callback form: older Safari's decodeAudioData doesn't return a promise
    .then((data) => new Promise((resolve, reject) => c.decodeAudioData(data, resolve, reject)))
    .then((buffer) => {
      _buffers[src] = buffer;
    })
    .catch(() => {})
    .finally(() => _loading.delete(src));
}

function prefetchNextWrong() {
  if (!_upNext) _upNext = pullWrong();
  loadClip(_upNext);
}

function unlockAudio() {
  const c = getCtx();
  if (c) {
    // Runs on every tap so it also recovers after iOS suspends the context
    // (e.g. the app was backgrounded)
    if (c.state !== 'running') {
      c.resume().catch(() => {});
      // Older iOS versions also need a sound started within the tap
      try {
        const src = c.createBufferSource();
        src.buffer = c.createBuffer(1, 1, 22050);
        src.connect(c.destination);
        src.start(0);
      } catch {}
    }
    CORRECT_CLIPS.forEach(loadClip);
    loadClip(LAST_PLACE);
    loadClip(FIRST_PLACE);
    prefetchNextWrong();
  }
}

// Treat our audio as media so the iOS mute toggle doesn't silence it (Safari 16.4+)
try {
  if (navigator.audioSession) navigator.audioSession.type = 'playback';
} catch {}
['touchend', 'click', 'keydown'].forEach((ev) =>
  window.addEventListener(ev, unlockAudio, { capture: true, passive: true })
);

function playClip(src, { feedback = false, onFail } = {}) {
  const c = _ctx;
  const buffer = _buffers[src];
  if (c && c.state === 'running' && buffer) {
    try {
      const source = c.createBufferSource();
      source.buffer = buffer;
      source.connect(c.destination);
      if (feedback) {
        _feedbackSources.push(source);
        source.onended = () => {
          _feedbackSources = _feedbackSources.filter((s) => s !== source);
        };
      }
      source.start(0);
      return;
    } catch {}
  }
  const el = getElement(src);
  try {
    el.currentTime = 0;
    el.play().catch(() => onFail && onFail());
  } catch {
    if (onFail) onFail();
  }
}

function tone(freq, dur, type = 'sine', vol = 0.25, delay = 0) {
  try {
    const c = getCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(() => {});
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
    sounds.stopFeedback();
    const src = pullCorrect();
    // Falls back to the synthesized chime if the clip can't play
    playClip(src, {
      feedback: true,
      onFail: () => {
        tone(523, 0.12, 'sine', 0.3);
        tone(659, 0.12, 'sine', 0.3, 0.1);
        tone(784, 0.25, 'sine', 0.35, 0.2);
      },
    });
  },
  wrong() {
    sounds.stopFeedback();
    const src = _upNext || pullWrong();
    _upNext = pullWrong();
    loadClip(_upNext);
    // Falls back to the synthesized buzz if the clip can't play
    playClip(src, {
      feedback: true,
      onFail: () => {
        tone(220, 0.15, 'sawtooth', 0.2);
        tone(180, 0.25, 'sawtooth', 0.15, 0.12);
      },
    });
  },
  // Stops the per-question feedback clips (applause / wrong-answer)
  stopFeedback() {
    _feedbackSources.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    _feedbackSources = [];
    Object.entries(_elements).forEach(([src, el]) => {
      if (src === LAST_PLACE) return;
      try {
        el.pause();
        el.currentTime = 0;
      } catch {}
    });
  },
  lastPlace() {
    playClip(LAST_PLACE);
  },
  firstPlace() {
    playClip(FIRST_PLACE);
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

      const audioCtx = getCtx();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const targetVolume = sounds.getBgVolume();

      if (_bgAudio.paused) {
        _bgAudio.currentTime = 0;
        _bgAudio.volume = 0;
        _bgAudio.play().catch(e => console.log('Audio auto-play blocked', e));
      }

      let currentVol = _bgAudio.volume;
      _fadeInterval = setInterval(() => {
        currentVol += 0.05;
        currentVol = Math.min(currentVol, targetVolume);
        _bgAudio.volume = currentVol;
        if (currentVol >= targetVolume) {
          clearInterval(_fadeInterval);
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
    if (_bgAudio.paused) {
      _bgAudio.play().catch(e => console.log('Audio auto-play blocked', e));
    }
    try {
      localStorage.setItem('bb_bg_volume', vol);
    } catch {}
  },
  getBgVolume() {
    try {
      const stored = localStorage.getItem('bb_bg_volume');
      if (stored !== null) return parseFloat(stored);
    } catch {}
    return 0.75; // Default volume set to 75%
  }
};
