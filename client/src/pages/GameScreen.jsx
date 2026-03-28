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
    expert: 'bg-purple-500/40 text-purple-200 border-purple-400/60',
  };
  const catBadge = question.category === 'Old Testament'
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

  if (role === 'host') {
    return <HostGameView
      question={question}
      answerProgress={answerProgress}
      onNextQuestion={onNextQuestion}
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
            <img src="/kampus-logo.jpeg" alt="logo" className="w-7 h-7 object-contain" />
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
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0918' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 flex-shrink-0">
        <span className="text-white/50 text-sm font-semibold">
          Question {question.index + 1} / {question.total}
        </span>
      </div>

      {/* Timer - centered */}
      <div className="flex justify-center py-4">
        <Timer
          duration={question.timeLimit}
          onTimeUp={() => setTimeUp(true)}
          paused={selected !== null}
          questionIndex={question.index}
          circular
        />
      </div>

      {/* Question card */}
      <div className="mx-4 rounded-2xl px-5 py-4 mb-4 text-center"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-white/50 text-xs font-semibold mb-2">
          {question.category} • {question.difficulty}
        </p>
        <p className="text-white text-base sm:text-lg font-black leading-snug">
          {question.question}
        </p>
      </div>

      {/* Answer grid */}
      <div className="flex-1 grid grid-cols-2 gap-3 px-4 pb-4">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={selected !== null || timeUp}
            className={`${getButtonClass(i)} rounded-2xl font-black text-white transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5 px-4 animate-slide-up`}
            style={{
              animationDelay: `${i * 0.07}s`,
              minHeight: '80px',
              boxShadow: selected === i
                ? '0 0 0 4px rgba(255,255,255,0.85), 0 8px 30px rgba(0,0,0,0.5)'
                : undefined
            }}
          >
            <span className="text-xl leading-none flex-shrink-0">{ANSWERS[i].shape}</span>
            <span className="text-base font-black leading-tight text-center">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HostGameView({ question, answerProgress, onNextQuestion, timeUp, setTimeUp }) {
  const pct = answerProgress.total > 0
    ? Math.round((answerProgress.answered / answerProgress.total) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col px-4 py-3" style={{ background: '#0d0918' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/50 text-sm font-semibold">
          Question {question.index + 1} / {question.total}
        </span>
        <span className="text-white/50 text-sm font-semibold">
          {answerProgress.answered}/{answerProgress.total} answered
        </span>
      </div>

      {/* Circular timer — centered */}
      <div className="flex justify-center py-3">
        <Timer
          duration={question.timeLimit}
          onTimeUp={() => setTimeUp(true)}
          paused={false}
          questionIndex={question.index}
          circular
        />
      </div>

      {/* Question card */}
      <div className="rounded-2xl px-5 py-5 mb-5 text-center"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-white/50 text-sm font-semibold mb-2">
          {question.category} • {question.difficulty}
        </p>
        <p className="text-white text-xl md:text-2xl font-black leading-snug">
          {question.question}
        </p>
      </div>

      {/* Answer grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {question.options.map((opt, i) => (
          <div
            key={i}
            className={`${ANSWERS[i].bg} rounded-2xl flex items-center justify-center gap-3 px-4 font-black text-white shadow-lg`}
            style={{ minHeight: '90px' }}
          >
            <span className="text-2xl leading-none flex-shrink-0">{ANSWERS[i].shape}</span>
            <span className="text-lg leading-tight">{opt}</span>
          </div>
        ))}
      </div>

      {/* Next button */}
      <div className="mt-4">
        {pct === 100 && (
          <p className="text-green-400 text-xs font-semibold text-center mb-2">✓ All players answered</p>
        )}
        <button
          onClick={onNextQuestion}
          className="w-full py-3 rounded-xl font-black text-base text-white font-nunito tracking-wide transition-all duration-200 hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            boxShadow: '0 6px 24px rgba(124,58,237,0.4)'
          }}
        >
          {question.index + 1 >= question.total ? '🏆 SHOW RESULTS' : '⏭️ NEXT QUESTION'}
        </button>
      </div>
    </div>
  );
}
