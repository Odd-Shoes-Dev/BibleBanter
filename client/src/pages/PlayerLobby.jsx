export default function PlayerLobby({ pin, playerName, players, onLeave }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-md text-center relative z-10 animate-bounce-in">
        {/* Waiting animation */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl font-black text-white mx-auto mb-4 animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
              {playerName[0]?.toUpperCase()}
            </div>
          </div>
          <h2 className="font-cinzel text-3xl font-black text-white mb-1">
            {playerName}
          </h2>
          <p className="text-amber-400 font-semibold">You're in! ✅</p>
        </div>

        <div className="bg-glass-dark rounded-3xl p-8 mb-6">
          <div className="flex justify-center mb-4">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-amber-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
          <p className="text-white/70 text-lg font-medium mb-2">Waiting for host to start...</p>
          <p className="text-white/40 text-sm">Get ready for the Bible Battle!</p>
        </div>

        <div className="bg-glass-dark rounded-3xl p-5 mb-4">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-semibold">Game PIN</p>
          <p className="font-cinzel text-4xl font-black text-white tracking-[0.2em]">{pin}</p>
        </div>

        <div className="bg-glass rounded-2xl p-4">
          <p className="text-white/40 text-sm mb-3 font-semibold">
            Players ready: <span className="text-white font-bold">{players.length}</span>
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {players.slice(0, 12).map((p, i) => (
              <span key={p.id}
                className="bg-white/15 rounded-full px-3 py-1 text-white text-sm font-medium animate-bounce-in"
                style={{ animationDelay: `${i * 0.05}s` }}>
                {p.name === playerName ? <span className="text-amber-300">{p.name} (you)</span> : p.name}
              </span>
            ))}
            {players.length > 12 && (
              <span className="text-white/40 text-sm">+{players.length - 12} more</span>
            )}
          </div>
        </div>

        <p className="mt-6 text-white/30 text-sm animate-pulse">
          ✝️ Sharpen your scripture knowledge... ✝️
        </p>

        <button
          onClick={onLeave}
          className="mt-4 px-6 py-2.5 rounded-2xl font-bold text-sm text-white/40 hover:text-white/70 transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          ✕ Leave Game
        </button>
      </div>
    </div>
  );
}
