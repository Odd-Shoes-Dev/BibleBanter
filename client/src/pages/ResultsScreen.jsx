const ANSWER_SHAPES = ['▲', '◆', '●', '■'];
const ANSWER_LABELS = ['A', 'B', 'C', 'D'];
const ANSWER_BG = [
  'bg-red-600/20 border-red-500/40 text-red-300',
  'bg-blue-600/20 border-blue-500/40 text-blue-300',
  'bg-yellow-600/20 border-yellow-500/40 text-yellow-300',
  'bg-green-600/20 border-green-500/40 text-green-300',
];

export default function ResultsScreen({ results, role, answerResult, onNext, playerName }) {
  if (!results) return null;

  const { correctAnswer, scripture, leaderboard, isLastQuestion } = results;
  const myRank = leaderboard.findIndex(p => p.name === playerName) + 1;

  const rankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-3 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto space-y-3">

        {/* Correct answer banner */}
        <div className="animate-bounce-in">
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.15))',
              border: '2px solid rgba(34,197,94,0.4)',
              boxShadow: '0 0 40px rgba(34,197,94,0.15)'
            }}
          >
            <p className="font-nunito text-green-400/70 text-xs font-extrabold uppercase tracking-wider mb-3">✅ Correct Answer</p>
            <div className={`inline-flex items-center gap-3 rounded-2xl px-5 py-3 border ${ANSWER_BG[correctAnswer]}`}>
              <span className="text-2xl font-black">{ANSWER_SHAPES[correctAnswer]}</span>
              <span className="font-nunito text-xl font-black">{ANSWER_LABELS[correctAnswer]}</span>
              <span className="text-green-400 text-xl">✓</span>
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

        {/* Leaderboard */}
        <div className="rounded-2xl p-4 animate-slide-up"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', animationDelay: '0.1s' }}>
          <h3 className="font-nunito text-base font-black text-white mb-3 text-center tracking-wide uppercase">🏆 Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 8).map((player, i) => {
              const isMe = player.name === playerName;
              return (
                <div
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
                </div>
              );
            })}
          </div>
          {role === 'player' && myRank > 8 && (
            <p className="text-center text-white/30 text-xs mt-3">Your rank: #{myRank}</p>
          )}
        </div>

        {/* Host controls */}
        {role === 'host' && (
          <button
            onClick={onNext}
            className="w-full py-4 rounded-2xl font-black text-xl text-white font-nunito transition-all duration-300 hover:scale-[1.02] hover:brightness-110 animate-slide-up"
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
            {isLastQuestion ? '🏆 FINAL RESULTS' : '⏭️ NEXT QUESTION'}
          </button>
        )}

        {/* Player waiting indicator */}
        {role === 'player' && (
          <div className="text-center pb-4 animate-fade-in">
            <div className="flex justify-center gap-1.5 mb-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-purple-400/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-white/30 text-sm">Waiting for host...</p>
          </div>
        )}
      </div>
    </div>
  );
}
