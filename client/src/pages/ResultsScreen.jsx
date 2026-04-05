import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ANSWER_SHAPES = ['▲', '◆', '●', '■'];
const ANSWER_LABELS = ['A', 'B', 'C', 'D'];
const ANSWER_BG = [
  'bg-red-600/20 border-red-500/40 text-red-300',
  'bg-blue-600/20 border-blue-500/40 text-blue-300',
  'bg-yellow-600/20 border-yellow-500/40 text-yellow-300',
  'bg-green-600/20 border-green-500/40 text-green-300',
];

export default function ResultsScreen({ results, teamLeaderboard, role, answerResult, onNext, playerName }) {
  if (!results) return null;

  const { correctAnswer, correctText, scripture, leaderboard, isLastQuestion, autoAdvanceIn = 7 } = results;
  const tLeaderboard = teamLeaderboard || results.teamLeaderboard || [];

  const decodeHTML = (html) => {
    if (!html) return '';
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const teamColors = {
    red: 'bg-red-500/20 border-red-500/40 text-red-400',
    blue: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    green: 'bg-green-500/20 border-green-500/40 text-green-400',
    yellow: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
  };

  const [countdown, setCountdown] = useState(autoAdvanceIn);

  useEffect(() => {
    setCountdown(autoAdvanceIn);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoAdvanceIn]);
  const myRank = leaderboard.findIndex(p => p.name === playerName) + 1;

  const rankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-3 overflow-y-auto" style={{ background: '#0d0918' }}>
      <div className="w-full max-w-2xl mx-auto space-y-3">

        {/* Correct answer banner */}
        <div className="animate-bounce-in">
          <div
            className="rounded-2xl p-4 text-center max-w-sm mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.15))',
              border: '2px solid rgba(34,197,94,0.4)',
              boxShadow: '0 0 40px rgba(34,197,94,0.15)'
            }}
          >
            <p className="font-nunito text-green-400/70 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-3">✅ Correct Answer</p>
            <div className={`inline-flex flex-col sm:flex-row items-center gap-4 rounded-2xl px-5 py-4 border ${ANSWER_BG[correctAnswer]} w-full justify-center`}>
              <div className="flex items-center justify-center gap-3 shrink-0">
                <span className="text-3xl sm:text-4xl leading-none flex items-center">{ANSWER_SHAPES[correctAnswer]}</span>
                <span className="font-nunito text-3xl sm:text-4xl font-black leading-none">{ANSWER_LABELS[correctAnswer]}</span>
                <span className="text-green-400 text-2xl hidden sm:block ml-1">✓</span>
              </div>
              {correctText && (
                <span className="font-semibold text-xl sm:text-2xl sm:border-l sm:border-current/30 sm:pl-4 text-center sm:text-left break-words w-full sm:w-auto">
                  {decodeHTML(correctText)}
                </span>
              )}
            </div>

            {/* Player personal result */}
            {role === 'player' && answerResult && (
              <div className={`mt-4 rounded-2xl px-5 py-4 ${
                answerResult.isCorrect
                  ? 'bg-green-500/15 border border-green-500/30'
                  : 'bg-red-500/15 border border-red-500/30'
              }`}>
                <p className={`font-nunito text-2xl font-black mb-1 ${
                  answerResult.isCorrect ? 'text-green-300' : 'text-red-300'
                }`}>
                  {answerResult.isCorrect ? '🎉 CORRECT!' : '❌ WRONG!'}
                </p>
                {answerResult.isCorrect ? (
                  <p className="text-white/70 font-semibold">
                    <span className="text-yellow-300 font-black text-xl">+{answerResult.pointsEarned}</span> pts
                    {answerResult.streak >= 3 && (
                      <span className="ml-3 text-orange-300">🔥 {answerResult.streak}x streak!</span>
                    )}
                    <span className="ml-3 text-white/40 text-sm">Total: {answerResult.totalScore.toLocaleString()}</span>
                  </p>
                ) : (
                  <p className="text-white/40 text-sm">Better luck next time!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scripture */}
        {scripture && (
          <div className="rounded-2xl p-4 animate-slide-up"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <p className="text-amber-400/70 text-xs font-bold uppercase tracking-wider mb-2">📖 Scripture</p>
            <p className="text-white/75 text-sm leading-relaxed italic">{scripture}</p>
          </div>
        )}

        {/* Team Leaderboard */}
        {tLeaderboard && tLeaderboard.length > 0 && (
          <div className="rounded-2xl p-4 animate-slide-up"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', animationDelay: '0.05s' }}>
            <h3 className="font-nunito text-sm sm:text-base font-black text-white/60 mb-3 text-center tracking-wide uppercase">Group Standings</h3>
            <div className="grid grid-cols-2 gap-3">
              {tLeaderboard.map((team, i) => (
                <div key={team.team} className={`p-3 rounded-2xl text-center border ${teamColors[team.team] || 'bg-white/10'} flex items-center justify-between`}>
                     <span className="text-xs font-bold uppercase">{team.team}</span>
                     <span className="text-lg font-black">{team.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="rounded-2xl p-4 animate-slide-up"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', animationDelay: '0.1s' }}>
          <h3 className="font-nunito text-sm sm:text-base font-black text-white mb-3 text-center tracking-wide uppercase">🏆 Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 8).map((player, i) => {
              const isMe = player.name === playerName;
              return (
                <motion.div
                  layout
                  transition={{ type: 'spring', bounce: 0.65, duration: 1.2 }}
                  key={player.name}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 animate-slide-up ${
                    isMe
                      ? 'border-2'
                      : 'border'
                  }`}
                  style={{
                    background: isMe ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
                    borderColor: isMe ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.08)',
                    animationDelay: `${i * 0.04}s`
                  }}
                >
                  <span className="text-lg w-8 text-center flex-shrink-0">{rankEmoji(player.rank)}</span>
                  <span className={`flex-1 font-bold text-sm truncate ${
                    isMe ? 'text-amber-300' : 'text-white/85'
                  }`}>
                    {player.name}
                    {isMe && <span className="text-amber-400/50 text-xs ml-1.5">(you)</span>}
                  </span>
                  {player.streak >= 3 && (
                    <span className="text-orange-400 text-xs font-bold">🔥{player.streak}</span>
                  )}
                  <span className={`font-nunito font-black text-base flex-shrink-0 ${
                    isMe ? 'text-amber-300' : 'text-white/70'
                  }`}>
                    {player.score.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
          {role === 'player' && myRank > 8 && (
            <p className="text-center text-white/30 text-xs mt-3">Your rank: #{myRank}</p>
          )}
        </div>

        {/* Auto-advance countdown bar — shown to everyone */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <p className="text-white/30 text-xs uppercase tracking-widest">
              {isLastQuestion ? 'Final results in' : 'Next question in'}
            </p>
            <p className="font-nunito font-black text-white/60 text-sm">{countdown}s</p>
          </div>
          <div className="rounded-full overflow-hidden h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-none"
              style={{
                width: `${(countdown / autoAdvanceIn) * 100}%`,
                background: isLastQuestion
                  ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                  : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                transition: `width 1s linear`,
              }}
            />
          </div>
        </div>

        {/* Host: skip ahead button */}
        {role === 'host' && (
          <button
            onClick={onNext}
            className="w-full py-3 sm:py-4 rounded-2xl font-black text-base sm:text-xl text-white font-nunito transition-all duration-300 hover:scale-[1.02] hover:brightness-110 animate-slide-up"
            style={{
              background: isLastQuestion
                ? 'linear-gradient(135deg, #d97706, #b45309)'
                : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              boxShadow: isLastQuestion
                ? '0 8px 40px rgba(217,119,6,0.5)'
                : '0 8px 40px rgba(124,58,237,0.5)',
              animationDelay: '0.15s'
            }}
          >
            {isLastQuestion ? '🏆 FINAL RESULTS' : '⏭️ Skip Ahead'}
          </button>
        )}
      </div>
    </div>
  );
}
