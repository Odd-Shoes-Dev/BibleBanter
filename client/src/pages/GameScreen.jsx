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
  answerProgress, liveLeaderboard = [], players, onNextQuestion, playerName
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
      liveLeaderboard={liveLeaderboard}
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
      <div className="min-h-screen flex flex-col items-center" style={{ background: '#0d0918' }}>
        <div className="w-full max-w-lg flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <img src="/kampus-logo.jpeg" alt="logo" className="w-6 h-6 object-contain opacity-80" />
            <span className="font-cinzel font-black text-sm tracking-widest" style={{ color: '#d4a843' }}>BIBLE BATTLE</span>
          </div>
          {playerName && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-white/70 font-semibold">{playerName}</span>
              <span className="text-white/30">•</span>
              <span className="font-black text-amber-300">{answerResult?.totalScore?.toLocaleString() ?? 0} pts</span>
            </div>
          )}
        </div>

        {/* Center result */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          {/* Emoji */}
          <div className="text-7xl animate-bounce-in select-none">
            {isTimeout ? '⏰' : isCorrect ? '🌟' : '�'}
          </div>

          {/* Result label */}
          <p className="font-nunito font-black text-4xl animate-fade-in"
            style={{
              color: isTimeout ? '#94a3b8' : isCorrect ? '#4ade80' : '#f87171',
            }}>
            {isTimeout ? "Time's Up!" : isCorrect ? 'Correct!' : 'Wrong!'}
          </p>

          {/* Correct answer */}
          {correctText && (
            <div className="text-center animate-fade-in">
              <p className="text-white font-semibold text-lg">
                Answer: <span className="font-black" style={{ color: '#d4a843' }}>{correctText}</span>
              </p>
              {question.scripture && (
                <p className="text-white/40 text-sm mt-1">
                  📖 {question.scripture}
                </p>
              )}
            </div>
          )}

          {/* Points (correct only) */}
          {isCorrect && answerResult.pointsEarned > 0 && (
            <p className="text-amber-300 font-nunito font-black text-xl animate-fade-in">
              +{answerResult.pointsEarned} pts
              {answerResult.streak >= 3 && (
                <span className="text-orange-400 text-base ml-2">🔥 {answerResult.streak}x</span>
              )}
            </p>
          )}

          {/* Score card */}
          <div className="rounded-2xl px-14 py-5 text-center mt-1 animate-slide-up"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <p className="text-white/45 text-sm font-medium mb-1">Your score</p>
            <p className="font-nunito font-black text-4xl" style={{ color: '#d4a843' }}>
              {answerResult?.totalScore?.toLocaleString() ?? 0}
            </p>
          </div>

          <p className="text-white/20 text-xs uppercase tracking-widest mt-2">Waiting for host...</p>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: '#0d0918' }}>
      <div className="w-full max-w-lg flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 flex-shrink-0">
        <span className="text-white/50 text-sm font-semibold">
          Question {question.index + 1} / {question.total}
        </span>
        {/* Live rank badge */}
        {liveLeaderboard.length > 0 && playerName && (() => {
          const myRank = liveLeaderboard.findIndex(p => p.name === playerName) + 1;
          return myRank > 0 ? (
            <span className="text-xs font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
              #{myRank} of {liveLeaderboard.length}
            </span>
          ) : null;
        })()}
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
      <div className="grid grid-cols-2 gap-3 px-4 pb-4 flex-1">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={selected !== null || timeUp}
            className={`${getButtonClass(i)} rounded-2xl font-black text-white transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5 px-4 animate-slide-up`}
            style={{
              animationDelay: `${i * 0.07}s`,
              minHeight: 'clamp(70px, 13vh, 130px)',
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
    </div>
  );
}

function HostGameView({ question, answerProgress, liveLeaderboard = [], onNextQuestion, timeUp, setTimeUp }) {
  const pct = answerProgress.total > 0
    ? Math.round((answerProgress.answered / answerProgress.total) * 100)
    : 0;

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0918' }}>

      {/* Main question area */}
      <div className="flex-1 flex flex-col px-4 py-3 md:px-8 min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-sm md:text-base font-semibold">
            Question {question.index + 1} / {question.total}
          </span>
          <span className="text-white/50 text-sm md:text-base font-semibold">
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
        <div className="rounded-2xl px-5 py-5 mb-5 text-center w-full"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-white/50 text-sm font-semibold mb-2">
            {question.category} • {question.difficulty}
          </p>
          <p className="text-white text-xl md:text-2xl lg:text-3xl font-black leading-snug">
            {question.question}
          </p>
        </div>

        {/* Answer grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-5 flex-1">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className={`${ANSWERS[i].bg} rounded-2xl flex items-center justify-center gap-3 px-4 md:px-6 font-black text-white shadow-lg`}
              style={{ minHeight: 'clamp(80px, 12vh, 160px)' }}
            >
              <span className="text-2xl md:text-3xl leading-none flex-shrink-0">{ANSWERS[i].shape}</span>
              <span className="text-lg md:text-xl lg:text-2xl leading-tight">{opt}</span>
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
            className="w-full py-3 md:py-4 rounded-xl font-black text-base md:text-lg text-white font-nunito tracking-wide transition-all duration-200 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              boxShadow: '0 6px 24px rgba(124,58,237,0.4)'
            }}
          >
            {question.index + 1 >= question.total ? '🏆 SHOW RESULTS' : '⏭️ NEXT QUESTION'}
          </button>
        </div>
      </div>

      {/* Live leaderboard sidebar */}
      <div className="w-56 lg:w-64 flex-shrink-0 flex flex-col py-3 pr-3 pl-2 hidden sm:flex"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-3 text-center">🏆 Live Rankings</p>
        <div className="flex-1 space-y-1.5 overflow-y-auto">
          {liveLeaderboard.length === 0 ? (
            <p className="text-white/20 text-xs text-center mt-8">Waiting for answers...</p>
          ) : (
            liveLeaderboard.slice(0, 12).map((player, i) => (
              <div
                key={player.name}
                className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-300"
                style={{
                  background: i === 0
                    ? 'rgba(251,191,36,0.15)'
                    : i < 3
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(255,255,255,0.04)',
                  border: i === 0 ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent',
                }}
              >
                <span className="text-sm w-5 text-center flex-shrink-0 font-black"
                  style={{ color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#fb923c' : '#ffffff50' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </span>
                <span className="flex-1 text-xs font-bold truncate"
                  style={{ color: i === 0 ? '#fbbf24' : '#ffffffcc' }}>
                  {player.name}
                </span>
                <span className="text-xs font-black flex-shrink-0"
                  style={{ color: i === 0 ? '#fbbf24' : '#ffffff70' }}>
                  {player.score.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
