export default function GameOver({
  leaderboard,
  teamLeaderboard,
  playerName,
  onPlayAgain,
  role,
  onViewReport,
  onContinue,
  continueInfo,
  onJoinAnother,
}) {
  const myRank = leaderboard.findIndex((p) => p.name === playerName) + 1;
  const myEntry = leaderboard.find((p) => p.name === playerName);

  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const teamColors = {
    red: "bg-red-500/20 border-red-500/40 text-red-400",
    blue: "bg-blue-500/20 border-blue-500/40 text-blue-400",
    green: "bg-green-500/20 border-green-500/40 text-green-400",
    yellow: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
  };

  const rankMsg = (rank) => {
    if (rank === 1)
      return {
        emoji: "🏆",
        msg: "CHAMPION!",
        color: "text-amber-400",
        bg: "bg-amber-500/20 border-amber-500/40",
      };
    if (rank === 2)
      return {
        emoji: "🥈",
        msg: "RUNNER-UP!",
        color: "text-slate-300",
        bg: "bg-slate-500/20 border-slate-500/40",
      };
    if (rank === 3)
      return {
        emoji: "🥉",
        msg: "3RD PLACE!",
        color: "text-orange-400",
        bg: "bg-orange-500/20 border-orange-500/40",
      };
    return {
      emoji: `#${rank}`,
      msg: `RANK ${rank}`,
      color: "text-white/70",
      bg: "bg-white/10 border-white/20",
    };
  };

  const myResult = myRank > 0 ? rankMsg(myRank) : null;

  return (
    <div
      className="min-h-screen flex flex-col px-4 py-6 overflow-y-auto relative"
      style={{ background: "#0d0918" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-purple-900/40 to-transparent" />
      </div>

      <div className="w-full max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Title */}
        <div className="text-center animate-bounce-in">
          <div className="text-6xl mb-3">🏆</div>
          <h1
            className="font-anton text-4xl sm:text-5xl md:text-6xl gradient-text tracking-wider mb-2"
            style={{ letterSpacing: "0.04em" }}
          >
            GAME OVER
          </h1>
          <p className="text-white/50 font-medium">Bible Banter Complete!</p>
        </div>

        {/* Player rank card */}
        {myResult && playerName && (
          <div
            className={`rounded-3xl p-6 text-center border animate-slide-up ${myResult.bg}`}
          >
            <div className="text-5xl mb-2">{myResult.emoji}</div>
            <p className={`font-nunito text-2xl font-black ${myResult.color}`}>
              {myResult.msg}
            </p>
            <p className="text-white font-bold text-xl mt-1">{playerName}</p>
            <p className="text-white/60 mt-2">
              Final Score:{" "}
              <span className="text-white font-black font-nunito text-2xl">
                {myEntry?.score?.toLocaleString() || 0}
              </span>
            </p>
            {myEntry?.streak >= 3 && (
              <p className="text-orange-400 text-sm mt-1">
                🔥 Best streak: {myEntry.streak}x
              </p>
            )}
          </div>
        )}

        {/* Team Leaderboard */}
        {teamLeaderboard && teamLeaderboard.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <h3 className="font-nunito text-center text-lg font-black text-white/60 tracking-wide uppercase mb-4">
              Team Standings
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {teamLeaderboard.map((team) => (
                <div
                  key={team.team}
                  className={`p-4 rounded-2xl text-center border ${teamColors[team.team] || "bg-white/10"} shadow-lg flex flex-col justify-center`}
                >
                  <div className="text-sm font-bold uppercase mb-1">
                    {team.team}
                  </div>
                  <div className="text-2xl font-black">
                    {team.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Podium */}
        {podium.length >= 2 && (
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="font-nunito text-center text-lg font-black text-white/60 tracking-wide uppercase mb-4">
              Top Players
            </h3>
            <div className="flex items-end justify-center gap-3">
              {/* 2nd place */}
              {podium[1] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-400 flex items-center justify-center text-xl font-black text-white mb-2">
                    {podium[1].name[0].toUpperCase()}
                  </div>
                  <p className="text-white font-bold text-xs sm:text-sm text-center truncate w-full px-1">
                    {podium[1].name}
                  </p>
                  <p className="text-slate-300 font-nunito font-black text-xs sm:text-sm">
                    {podium[1].score.toLocaleString()}
                  </p>
                  <div className="w-full bg-slate-400/80 rounded-t-xl h-16 sm:h-24 mt-2 flex items-center justify-center text-2xl sm:text-4xl">
                    🥈
                  </div>
                </div>
              )}

              {/* 1st place */}
              {podium[0] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-amber-400 flex items-center justify-center text-2xl font-black text-white mb-2 animate-pulse-glow">
                    {podium[0].name[0].toUpperCase()}
                  </div>
                  <p className="text-white font-bold text-xs sm:text-sm text-center truncate w-full px-1">
                    {podium[0].name}
                  </p>
                  <p className="text-amber-300 font-nunito font-black text-sm sm:text-base">
                    {podium[0].score.toLocaleString()}
                  </p>
                  <div className="w-full bg-amber-400/80 rounded-t-xl h-20 sm:h-32 mt-2 flex items-center justify-center text-3xl sm:text-5xl">
                    🥇
                  </div>
                </div>
              )}

              {/* 3rd place */}
              {podium[2] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-600 flex items-center justify-center text-xl font-black text-white mb-2">
                    {podium[2].name[0].toUpperCase()}
                  </div>
                  <p className="text-white font-bold text-xs sm:text-sm text-center truncate w-full px-1">
                    {podium[2].name}
                  </p>
                  <p className="text-orange-400 font-nunito font-black text-xs sm:text-sm">
                    {podium[2].score.toLocaleString()}
                  </p>
                  <div className="w-full bg-orange-600/80 rounded-t-xl h-12 sm:h-16 mt-2 flex items-center justify-center text-2xl sm:text-3xl">
                    🥉
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full leaderboard */}
        {leaderboard.length > 0 && (
          <div
            className="bg-glass-dark rounded-3xl p-5 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h3 className="font-nunito text-center text-base font-black text-white/50 tracking-wide uppercase mb-4">
              Full Results
            </h3>
            <div className="space-y-2">
              {leaderboard.map((player, i) => {
                const isMe = player.name === playerName;
                return (
                  <div
                    key={player.name}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${
                      isMe
                        ? "bg-amber-500/20 border border-amber-500/40"
                        : "bg-white/5"
                    }`}
                  >
                    <span className="text-base w-8 text-center">
                      {player.rank === 1
                        ? "🥇"
                        : player.rank === 2
                          ? "🥈"
                          : player.rank === 3
                            ? "🥉"
                            : `#${player.rank}`}
                    </span>
                    <span
                      className={`flex-1 font-semibold truncate text-sm ${isMe ? "text-amber-300" : "text-white/80"}`}
                    >
                      {player.name}
                      {isMe && (
                        <span className="text-amber-400/50 text-xs ml-1">
                          (you)
                        </span>
                      )}
                    </span>
                    {player.streak >= 3 && (
                      <span className="text-orange-400 text-xs">
                        🔥{player.streak}
                      </span>
                    )}
                    <span
                      className={`font-nunito font-black text-base ${isMe ? "text-amber-300" : "text-white/70"}`}
                    >
                      {player.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Host report button */}
        {role === "host" && onViewReport && (
          <button
            onClick={onViewReport}
            className="w-full py-4 rounded-2xl font-black text-lg text-white font-nunito tracking-wide transition-all duration-300 hover:scale-105 animate-slide-up"
            style={{
              background: "linear-gradient(135deg, #0f766e, #0d9488)",
              boxShadow: "0 6px 30px rgba(13,148,136,0.45)",
              animationDelay: "0.25s",
            }}
          >
            📊 VIEW UNDERSTANDING REPORT
          </button>
        )}

        {/* Continue to next batch — host only */}
        {role === "host" && onContinue && continueInfo && (
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-2xl font-black text-lg text-white font-nunito tracking-wide transition-all duration-300 hover:scale-105 animate-slide-up"
            style={{
              background: "linear-gradient(135deg, #d97706, #b45309)",
              boxShadow: "0 6px 30px rgba(217,119,6,0.45)",
              animationDelay: "0.28s",
            }}
          >
            ▶ Continue — Q{continueInfo.nextOffset + 1}–
            {Math.min(
              continueInfo.nextOffset + 10,
              continueInfo.totalQuestions,
            )}{" "}
            of {continueInfo.totalQuestions}
          </button>
        )}

        {/* Play again */}
        <button
          onClick={onPlayAgain}
          className="w-full py-4 sm:py-5 rounded-2xl font-black text-xl sm:text-2xl text-white font-nunito tracking-wide transition-all duration-300 hover:scale-105 animate-slide-up"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            boxShadow: "0 8px 40px rgba(124,58,237,0.5)",
            animationDelay: "0.3s",
          }}
        >
          ✝️ PLAY AGAIN
        </button>

        {/* Join another game — players only */}
        {role !== "host" && onJoinAnother && (
          <button
            onClick={onJoinAnother}
            className="w-full py-3 rounded-2xl font-bold text-sm text-white/50 hover:text-white/80 transition-all duration-200 animate-slide-up font-nunito"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              animationDelay: "0.35s",
            }}
          >
            🔗 Join Another Game
          </button>
        )}

        <div className="text-center text-white/25 text-xs font-nunito tracking-wide pb-4 space-y-1">
          <p>BIBLE BANTER — TEST YOUR SCRIPTURE KNOWLEDGE</p>
          <p>
            Music:{" "}
            <a
              href="https://uppbeat.io/track/danijel-zambo/game-over?rt=uc-referral"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/50 transition-colors"
            >
              "Game Over" by Danijel Zambo
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
