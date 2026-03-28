import { useState, useEffect, useRef } from 'react';
import Timer from '../components/Timer';

const ANSWERS = [
  { bg: 'answer-a', label: 'A', shape: '▲', color: '#ef4444' },
  { bg: 'answer-b', label: 'B', shape: '◆', color: '#3b82f6' },
  { bg: 'answer-c', label: 'C', shape: '●', color: '#eab308' },
  { bg: 'answer-d', label: 'D', shape: '■', color: '#22c55e' },
];

export default function GameScreen({
  question, role, onSubmitAnswer, answerResult,
  answerProgress, players, onNextQuestion, playerName
}) {
  const [selected, setSelected] = useState(null);
  const [timeUp, setTimeUp] = useState(false);
  const prevQuestionRef = useRef(null);

  useEffect(() => {
    if (question && question.index !== prevQuestionRef.current) {
      setSelected(null);
      setTimeUp(false);
      prevQuestionRef.current = question.index;
    }
  }, [question]);

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-spin-slow">✝️</div>
          <p className="text-white/60 text-2xl font-cinzel animate-pulse">Get Ready...</p>
        </div>
      </div>
    );
  }

  const handleAnswer = (index) => {
    if (selected !== null || answerResult || timeUp || role === 'host') return;
    setSelected(index);
    onSubmitAnswer(index);
  };

  const getButtonClass = (index) => {
    const base = ANSWERS[index].bg;
    if (answerResult) {
      if (index === answerResult.correctAnswer) return 'answer-correct';
      if (index === selected && !answerResult.isCorrect) return 'answer-selected-wrong';
      return 'answer-wrong';
    }
    if (selected === index) return `${base} ring-4 ring-white/80 brightness-125`;
    if (selected !== null) return `${base} opacity-50`;
    return base;
  };

  const diffBadge = {
    easy: 'bg-green-500/30 text-green-300 border-green-500/40',
    medium: 'bg-amber-500/30 text-amber-300 border-amber-500/40',
    hard: 'bg-red-500/30 text-red-300 border-red-500/40',
  };
  const catBadge = question.category === 'Old Testament'
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

  if (role === 'host') {
    return <HostGameView
      question={question}
      answerProgress={answerProgress}
      onNextQuestion={onNextQuestion}
      diffBadge={diffBadge}
      catBadge={catBadge}
      timeUp={timeUp}
      setTimeUp={setTimeUp}
    />;
  }

  const showResult = answerResult !== null || (timeUp && selected === null);
  const correctText = answerResult ? question.options[answerResult.correctAnswer] : null;

  if (showResult) {
    const isCorrect = answerResult?.isCorrect;
    const isTimeout = timeUp && !answerResult;

    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#0d0918' }}>
        {/* Top mini bar */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚔️</span>
            <span className="font-cinzel font-black text-sm gradient-text tracking-wider">BIBLE BATTLE</span>
          </div>
          {playerName && (
            <div className="text-white/60 text-sm font-semibold bg-white/8 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              {playerName} • <span className="text-amber-300 font-black">{answerResult?.totalScore?.toLocaleString() ?? 0} pts</span>
            </div>
          )}
        </div>

        {/* Center result */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 animate-fade-in">
          {/* Big emoji */}
          <div className="text-8xl animate-bounce-in">
            {isTimeout ? '⏰' : isCorrect ? '🌟' : '😅'}
          </div>

          {/* Result label */}
          <p className="font-nunito font-black text-4xl"
            style={{
              color: isTimeout ? '#94a3b8' : isCorrect ? '#4ade80' : '#f87171',
              textShadow: isCorrect
                ? '0 0 30px rgba(74,222,128,0.5)'
                : isTimeout ? 'none'
                : '0 0 30px rgba(248,113,113,0.5)'
            }}>
            {isTimeout ? "Time's Up!" : isCorrect ? 'Correct!' : 'Wrong!'}
          </p>

          {/* Correct answer */}
          {correctText && (
            <p className="text-white/70 text-lg font-semibold text-center">
              Answer: <span className="text-amber-300 font-black">{correctText}</span>
            </p>
          )}

          {/* Points earned (correct only) */}
          {isCorrect && answerResult.pointsEarned > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-300 font-nunito font-black text-2xl">+{answerResult.pointsEarned}</span>
              <span className="text-white/50 font-semibold">points</span>
              {answerResult.streak >= 3 && (
                <span className="text-orange-300 font-black text-base ml-1">🔥 {answerResult.streak}x streak!</span>
              )}
            </div>
          )}

          {/* Score card */}
          <div className="rounded-2xl px-10 py-5 text-center mt-2"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-white/50 text-sm font-semibold mb-1">Your score</p>
            <p className="font-nunito font-black text-4xl text-amber-300">
              {answerResult?.totalScore?.toLocaleString() ?? 0}
            </p>
          </div>

          <p className="text-white/25 text-sm mt-2">Waiting for host...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${catBadge}`}>
              {question.category === 'Old Testament' ? '📜 OT' : '✝️ NT'}
            </span>
            <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full border ${diffBadge[question.difficulty] || 'bg-white/10 text-white/60 border-white/20'}`}>
              {question.difficulty}
            </span>
          </div>
          <span className="font-cinzel text-sm font-black text-white/50">
            {question.index + 1}<span className="text-white/25">/{question.total}</span>
          </span>
        </div>

        <Timer
          duration={question.timeLimit}
          onTimeUp={() => setTimeUp(true)}
          paused={selected !== null}
          questionIndex={question.index}
        />

        <div className="mt-3 rounded-2xl px-5 py-4 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
          <p className="text-white text-lg sm:text-xl font-bold leading-snug">
            {question.question}
          </p>
        </div>
      </div>

      {/* Answer grid */}
      <div className="flex-1 grid grid-cols-2 gap-3 px-4 pb-4 pt-2 relative z-10">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={selected !== null || timeUp}
            className={`${getButtonClass(i)} rounded-3xl font-bold text-white transition-all duration-300 active:scale-95 flex flex-col items-center justify-center gap-2 p-4 animate-slide-up relative overflow-hidden`}
            style={{
              animationDelay: `${i * 0.08}s`,
              minHeight: '90px',
              boxShadow: selected === i
                ? '0 0 0 4px rgba(255,255,255,0.8), 0 8px 30px rgba(0,0,0,0.4)'
                : undefined
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none" />
            <span className="text-4xl font-black leading-none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
              {ANSWERS[i].shape}
            </span>
            <span className="text-base sm:text-lg font-black leading-tight text-center px-2">
              {opt}
            </span>
            <span className="absolute bottom-2.5 left-3 w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center text-xs font-black">
              {ANSWERS[i].label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HostGameView({ question, answerProgress, onNextQuestion, diffBadge, catBadge, timeUp, setTimeUp }) {
  const pct = answerProgress.total > 0
    ? Math.round((answerProgress.answered / answerProgress.total) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col px-6 py-5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-purple-900/50 to-transparent" />
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full border ${catBadge}`}>
            {question.category}
          </span>
          <span className={`text-sm font-bold uppercase px-4 py-2 rounded-full border ${diffBadge[question.difficulty] || 'bg-white/10 text-white/60 border-white/20'}`}>
            {question.difficulty}
          </span>
        </div>
        <div className="font-nunito text-2xl font-black text-white/60">
          {question.index + 1} <span className="text-white/30">/ {question.total}</span>
        </div>
      </div>

      {/* Timer */}
      <div className="mb-6 relative z-10">
        <Timer
          duration={question.timeLimit}
          onTimeUp={() => setTimeUp(true)}
          paused={false}
          questionIndex={question.index}
          hostMode
        />
      </div>

      {/* Question - BIG for projector */}
      <div className="relative z-10 rounded-3xl p-8 mb-6 text-center"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
        <p className="text-white text-3xl md:text-5xl font-black leading-tight">
          {question.question}
        </p>
      </div>

      {/* Answer grid - large blocks */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        {question.options.map((opt, i) => (
          <div
            key={i}
            className={`${ANSWERS[i].bg} rounded-2xl px-5 py-4 flex items-center gap-4 text-white font-bold shadow-xl`}
            style={{ minHeight: '90px' }}
          >
            <span className="w-10 h-10 rounded-xl bg-black/25 flex items-center justify-center text-xl font-black flex-shrink-0">
              {ANSWERS[i].label}
            </span>
            <span className="text-2xl leading-tight font-black">{opt}</span>
          </div>
        ))}
      </div>

      {/* Progress + Next */}
      <div className="relative z-10 mt-auto">
        <div className="bg-glass-dark rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 font-semibold text-sm uppercase tracking-wider">Players Answered</span>
            <span className="font-nunito text-3xl font-black text-white">
              {answerProgress.answered}
              <span className="text-white/40 text-xl"> / {answerProgress.total}</span>
            </span>
          </div>
          <div className="bg-white/10 rounded-full h-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : 'linear-gradient(90deg, #8b5cf6, #7c3aed)'
              }}
            />
          </div>
          {pct === 100 && (
            <p className="text-green-400 text-sm font-bold text-center mt-2 animate-pulse">✅ All players answered!</p>
          )}
        </div>

        <button
          onClick={onNextQuestion}
          className="w-full py-5 rounded-2xl font-black text-2xl text-white font-nunito transition-all duration-300 hover:scale-105 hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            boxShadow: '0 8px 40px rgba(124,58,237,0.5)'
          }}
        >
          {question.index + 1 >= question.total ? '🏆 SHOW RESULTS' : '⏭️ NEXT QUESTION'}
        </button>
      </div>
    </div>
  );
}
