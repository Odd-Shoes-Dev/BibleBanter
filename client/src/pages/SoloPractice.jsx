import { useState, useEffect, useRef, useCallback } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const ANSWER_COLORS = ['answer-a', 'answer-b', 'answer-c', 'answer-d'];
const ANSWER_SHAPES = ['▲', '◆', '●', '■'];
const ANSWER_LABELS = ['A', 'B', 'C', 'D'];
const QUESTION_TIME = 20;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SoloPractice({ onBack, authToken }) {
  const [phase, setPhase] = useState('setup'); // setup | playing | results

  // Setup state
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [count, setCount] = useState(10);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [loadingStart, setLoadingStart] = useState(false);
  const [setupError, setSetupError] = useState('');

  // Playing state
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [answers, setAnswers] = useState([]); // { answerIndex, isCorrect, timeUsed }
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load sets on mount
  useEffect(() => {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    fetch(`${BACKEND}/api/sets`, { headers })
      .then(r => r.json())
      .then(d => {
        setSets(d.sets || []);
        if (d.sets?.length > 0) setSelectedSetId(d.sets[0].id);
      })
      .catch(() => setSetupError('Failed to load question sets.'));
  }, [authToken]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(QUESTION_TIME);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, QUESTION_TIME - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        stopTimer();
        setRevealed(true);
        setSelected(null); // no answer = timeout
      }
    }, 100);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const startGame = async () => {
    setSetupError('');
    setLoadingStart(true);
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const res = await fetch(`${BACKEND}/api/sets/${selectedSetId}/questions`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load questions.');
      const pool = shuffle(data.questions).slice(0, count);
      if (pool.length === 0) throw new Error('No questions found in this set.');
      setQuestions(pool);
      setQIndex(0);
      setSelected(null);
      setRevealed(false);
      setAnswers([]);
      setScore(0);
      setStreak(0);
      setPhase('playing');
      if (timerEnabled) startTimer();
      else { stopTimer(); setTimeLeft(QUESTION_TIME); startTimeRef.current = Date.now(); }
    } catch (e) {
      setSetupError(e.message);
    } finally {
      setLoadingStart(false);
    }
  };

  const handleAnswer = (index) => {
    if (revealed) return;
    stopTimer();
    const timeUsed = (Date.now() - startTimeRef.current) / 1000;
    const q = questions[qIndex];
    const isCorrect = index === q.answer;
    let pts = 0;
    let newStreak = streak;
    if (isCorrect) {
      pts = timeUsed <= 5 ? 6 : 5;
      newStreak = streak + 1;
      setScore(s => s + pts);
      setStreak(newStreak);
    } else {
      newStreak = 0;
      setStreak(0);
    }
    setSelected(index);
    setRevealed(true);
    setAnswers(prev => [...prev, { answerIndex: index, isCorrect, timeUsed, pts, streak: newStreak }]);
  };

  const handleNext = () => {
    const next = qIndex + 1;
    if (next >= questions.length) {
      setPhase('results');
      stopTimer();
      return;
    }
    setQIndex(next);
    setSelected(null);
    setRevealed(false);
    if (timerEnabled) startTimer();
    else { setTimeLeft(QUESTION_TIME); startTimeRef.current = Date.now(); }
  };

  const handleTimeout = () => {
    setAnswers(prev => [...prev, { answerIndex: null, isCorrect: false, timeUsed: QUESTION_TIME, pts: 0, streak: 0 }]);
  };

  // When revealed due to timeout (selected === null), record the answer once
  const prevRevealedRef = useRef(false);
  useEffect(() => {
    if (revealed && selected === null && !prevRevealedRef.current) {
      handleTimeout();
    }
    prevRevealedRef.current = revealed;
  }, [revealed]);

  const getButtonClass = (index) => {
    const base = ANSWER_COLORS[index];
    if (!revealed) return `${base}${selected === index ? ' ring-4 ring-white/80 brightness-125' : ''}`;
    const q = questions[qIndex];
    if (index === q.answer) return 'answer-correct';
    if (index === selected && index !== q.answer) return 'answer-selected-wrong';
    return 'answer-wrong';
  };

  // ── SETUP SCREEN ──────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: '#0d0918' }}>
        <div className="w-full max-w-md animate-fade-in">
          <button onClick={onBack} className="mb-6 text-white/50 hover:text-white flex items-center gap-2 transition-colors text-sm font-semibold">
            ← Back
          </button>

          <div className="bg-glass-dark rounded-3xl p-7 shadow-2xl">
            <div className="text-center mb-7">
              <div className="text-5xl mb-3">🎯</div>
              <h2 className="font-cinzel text-3xl font-black text-white mb-1">SOLO PRACTICE</h2>
              <p className="text-white/40 text-sm">Practice at your own pace, no host needed</p>
            </div>

            <div className="space-y-5">
              {/* Set selector */}
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Question Set</label>
                <select
                  value={selectedSetId}
                  onChange={e => setSelectedSetId(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-amber-400 transition-all appearance-none"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  {sets.map(s => (
                    <option key={s.id} value={s.id} style={{ background: '#1a0f2e' }}>
                      {s.name} ({s._count?.questions ?? '?'} questions)
                    </option>
                  ))}
                </select>
              </div>

              {/* Question count */}
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Number of Questions</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map(n => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={`py-3 rounded-xl font-black text-sm transition-all ${
                        count === n
                          ? 'text-black'
                          : 'bg-white/10 text-white/60 hover:bg-white/15'
                      }`}
                      style={count === n ? { background: 'linear-gradient(135deg, #d97706, #b45309)' } : {}}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer toggle */}
              <div className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <p className="text-white font-semibold text-sm">Timer ({QUESTION_TIME}s per question)</p>
                  <p className="text-white/35 text-xs">{timerEnabled ? 'Points based on speed' : 'Take your time, flat scoring'}</p>
                </div>
                <button
                  onClick={() => setTimerEnabled(t => !t)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${timerEnabled ? 'bg-amber-500' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${timerEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {setupError && (
                <p className="text-red-400 text-sm text-center font-semibold">⚠️ {setupError}</p>
              )}

              <button
                onClick={startGame}
                disabled={loadingStart || !selectedSetId}
                className="w-full py-4 rounded-2xl font-black text-xl text-white font-cinzel tracking-wide transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)' }}
              >
                {loadingStart ? '⏳ Loading...' : '🎯 START PRACTICE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING SCREEN ────────────────────────────────────────────────────────────
  if (phase === 'playing') {
    const q = questions[qIndex];
    const pct = (timeLeft / QUESTION_TIME) * 100;
    const isUrgent = timeLeft <= 5;
    const isMid = timeLeft <= 10;
    const timerColor = isUrgent ? '#ef4444' : isMid ? '#f59e0b' : '#d97706';

    return (
      <div className="min-h-screen flex flex-col items-center" style={{ background: '#0d0918' }}>
        <div className="w-full max-w-lg flex flex-col min-h-screen">

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-white/50 text-sm font-semibold">
              {qIndex + 1} / {questions.length}
            </span>
            <span className="font-cinzel font-black text-sm tracking-widest" style={{ color: '#d4a843' }}>
              PRACTICE
            </span>
            <span className="font-nunito font-black text-amber-300 text-sm">
              {score.toLocaleString()} pts
            </span>
          </div>

          {/* Timer */}
          {timerEnabled && (
            <div className="px-5 pt-3 pb-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/30 text-xs uppercase tracking-widest">Time</span>
                <span className={`font-nunito font-black text-sm ${isUrgent ? 'animate-pulse' : ''}`} style={{ color: timerColor }}>
                  {Math.ceil(timeLeft)}s
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-none timer-bar"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}cc)`, transition: 'width 0.1s linear' }} />
              </div>
            </div>
          )}

          {/* Streak badge */}
          {streak >= 3 && (
            <div className="mx-5 mt-2 text-center">
              <span className="text-orange-400 text-xs font-black">🔥 {streak}x STREAK BONUS!</span>
            </div>
          )}

          {/* Question */}
          <div className="mx-4 mt-3 rounded-2xl px-5 py-4 text-center"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-white/40 text-xs font-semibold mb-2">{q.category} • {q.difficulty}</p>
            <p className="text-white text-base sm:text-lg font-black leading-snug">{q.question}</p>
          </div>

          {/* Answer buttons */}
          <div className="grid grid-cols-2 gap-3 px-4 mt-3 pb-2 flex-1">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={revealed}
                className={`${getButtonClass(i)} rounded-2xl font-black text-white transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5 px-4 animate-slide-up`}
                style={{ animationDelay: `${i * 0.07}s`, minHeight: 'clamp(70px, 13vh, 120px)' }}
              >
                <span className="text-xl leading-none flex-shrink-0">{ANSWER_SHAPES[i]}</span>
                <span className="text-sm font-black leading-tight text-center">{opt}</span>
              </button>
            ))}
          </div>

          {/* Reveal panel */}
          {revealed && (
            <div className="mx-4 mb-4 rounded-2xl px-5 py-4 animate-slide-up"
              style={{ background: selected === q.answer ? 'rgba(34,197,94,0.12)' : selected === null ? 'rgba(148,163,184,0.1)' : 'rgba(239,68,68,0.10)', border: `1px solid ${selected === q.answer ? 'rgba(34,197,94,0.3)' : selected === null ? 'rgba(148,163,184,0.2)' : 'rgba(239,68,68,0.25)'}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className={`font-nunito font-black text-lg ${selected === q.answer ? 'text-green-400' : selected === null ? 'text-slate-400' : 'text-red-400'}`}>
                  {selected === null ? "⏰ Time's Up!" : selected === q.answer ? '🌟 Correct!' : '❌ Wrong!'}
                </p>
                {selected === q.answer && answers[answers.length - 1]?.pts > 0 && (
                  <span className="text-amber-300 font-black text-sm">
                    +{answers[answers.length - 1].pts} pts
                    {streak >= 3 && <span className="text-orange-400 ml-1">🔥</span>}
                  </span>
                )}
              </div>
              <p className="text-white/60 text-sm">
                Answer: <span className="text-white font-bold">{ANSWER_LABELS[q.answer]}. {q.options[q.answer]}</span>
              </p>
              {q.scripture && (
                <p className="text-amber-400/60 text-xs mt-1.5 italic">📖 {q.scripture}</p>
              )}
              <button
                onClick={handleNext}
                className="w-full mt-3 py-3 rounded-xl font-black text-base text-white transition-all hover:brightness-110"
                style={{
                  background: qIndex + 1 >= questions.length
                    ? 'linear-gradient(135deg, #d97706, #b45309)'
                    : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  boxShadow: qIndex + 1 >= questions.length
                    ? '0 6px 20px rgba(217,119,6,0.4)'
                    : '0 6px 20px rgba(124,58,237,0.4)',
                }}
              >
                {qIndex + 1 >= questions.length ? '🏆 See Results' : 'Next Question →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS SCREEN ────────────────────────────────────────────────────────────
  if (phase === 'results') {
    const totalQ = questions.length;
    const correct = answers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correct / totalQ) * 100);
    const avgTime = answers.length > 0
      ? (answers.reduce((s, a) => s + a.timeUsed, 0) / answers.length).toFixed(1)
      : '—';

    const grade = accuracy >= 90 ? { label: 'Excellent!', color: '#4ade80', emoji: '🏆' }
      : accuracy >= 70 ? { label: 'Great Job!', color: '#fbbf24', emoji: '🌟' }
      : accuracy >= 50 ? { label: 'Good Effort', color: '#f59e0b', emoji: '✊' }
      : { label: 'Keep Practising', color: '#f87171', emoji: '📖' };

    return (
      <div className="min-h-screen px-4 py-6 overflow-y-auto" style={{ background: '#0d0918' }}>
        <div className="w-full max-w-lg mx-auto space-y-4 animate-fade-in">

          {/* Grade card */}
          <div className="rounded-3xl p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-6xl mb-2">{grade.emoji}</div>
            <p className="font-nunito font-black text-3xl mb-1" style={{ color: grade.color }}>{grade.label}</p>
            <p className="font-nunito font-black text-5xl text-white mb-1">{score.toLocaleString()}</p>
            <p className="text-white/40 text-sm">points</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 70 ? '#4ade80' : accuracy >= 50 ? '#fbbf24' : '#f87171' },
              { label: 'Correct', value: `${correct}/${totalQ}`, color: '#ffffff' },
              { label: 'Avg Time', value: `${avgTime}s`, color: '#a78bfa' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="font-nunito font-black text-xl" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-white/35 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Question review */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/50 text-xs font-black uppercase tracking-widest px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              Question Review
            </p>
            <div className="divide-y" style={{ '--tw-divide-opacity': 0.06 }}>
              {questions.map((q, i) => {
                const a = answers[i];
                const isCorrect = a?.isCorrect;
                const isTimeout = a?.answerIndex === null;
                return (
                  <div key={q.id || i} className="px-4 py-3 flex gap-3 items-start"
                    style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {isTimeout ? '⏰' : isCorrect ? '✅' : '❌'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm font-semibold leading-snug">{q.question}</p>
                      <p className="text-white/35 text-xs mt-0.5">
                        Answer: <span className="text-white/60 font-semibold">{ANSWER_LABELS[q.answer]}. {q.options[q.answer]}</span>
                        {!isCorrect && !isTimeout && a?.answerIndex !== undefined && (
                          <span className="text-red-400/70 ml-2">
                            (You chose {ANSWER_LABELS[a.answerIndex]})
                          </span>
                        )}
                      </p>
                      {q.scripture && (
                        <p className="text-amber-400/40 text-xs mt-0.5 italic">📖 {q.scripture}</p>
                      )}
                    </div>
                    {isCorrect && (
                      <span className="text-amber-300 text-xs font-black flex-shrink-0">+{a.pts}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            <button
              onClick={() => { setPhase('setup'); stopTimer(); }}
              className="py-3 rounded-2xl font-black text-white text-sm transition-all hover:brightness-110"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              ⚙️ New Session
            </button>
            <button
              onClick={() => {
                setQIndex(0); setSelected(null); setRevealed(false);
                setAnswers([]); setScore(0); setStreak(0);
                setPhase('playing');
                const newQ = shuffle(questions).slice(0, count);
                setQuestions(newQ);
                if (timerEnabled) startTimer(); else { setTimeLeft(QUESTION_TIME); startTimeRef.current = Date.now(); }
              }}
              className="py-3 rounded-2xl font-black text-white text-sm transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
