export default function LandingPage({ onHost, onJoin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
        {/* Decorative cross pattern */}
        <div className="absolute top-12 right-16 text-6xl opacity-5 font-cinzel rotate-12">✝</div>
        <div className="absolute bottom-24 left-12 text-8xl opacity-5 font-cinzel -rotate-6">✝</div>
        <div className="absolute top-1/3 left-8 text-4xl opacity-5 font-cinzel rotate-45">✝</div>
      </div>

      {/* Logo */}
      <div className="text-center mb-6 relative z-10">
        <div className="animate-bounce-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              boxShadow: '0 0 60px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            <span className="text-3xl">✝️</span>
          </div>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="font-cinzel font-black tracking-widest leading-none"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #fbbf24 60%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 30px rgba(251,191,36,0.35))'
            }}>
            BIBLE
          </h1>
          <h1 className="font-cinzel font-black tracking-widest leading-none text-white"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              textShadow: '0 0 50px rgba(255,255,255,0.2)'
            }}>
            BATTLE
          </h1>
        </div>
        <p className="text-purple-300/80 text-sm mt-3 font-medium tracking-widest animate-fade-in"
          style={{ animationDelay: '0.2s' }}>
          ⚔️  ULTIMATE SCRIPTURE QUIZ  ⚔️
        </p>
      </div>

      {/* Main buttons */}
      <div className="w-full max-w-sm space-y-2.5 relative z-10 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <button
          onClick={onHost}
          className="w-full group relative overflow-hidden rounded-2xl py-4 px-5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl flex-shrink-0">
              👑
            </div>
            <div className="text-left">
              <p className="font-cinzel font-black text-white text-xl tracking-wide">HOST A GAME</p>
              <p className="text-purple-200/70 text-sm font-medium">Create & run a quiz session</p>
            </div>
            <span className="ml-auto text-white/40 text-2xl">›</span>
          </div>
        </button>

        <button
          onClick={onJoin}
          className="w-full group relative overflow-hidden rounded-2xl py-4 px-5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #d97706 0%, #c2770a 50%, #b45309 100%)',
            boxShadow: '0 8px 32px rgba(217,119,6,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl flex-shrink-0">
              🎮
            </div>
            <div className="text-left">
              <p className="font-cinzel font-black text-white text-xl tracking-wide">JOIN GAME</p>
              <p className="text-amber-200/70 text-sm font-medium">Enter with a game PIN</p>
            </div>
            <span className="ml-auto text-white/40 text-2xl">›</span>
          </div>
        </button>
      </div>

      {/* Feature strip */}
      <div className="flex flex-wrap gap-2 justify-center mt-5 relative z-10 animate-fade-in px-4" style={{ animationDelay: '0.3s' }}>
        {['� Old Testament', '✝️ New Testament', '⏱️ Countdown', '🔥 Streaks', '🏆 Leaderboard'].map(f => (
          <span key={f}
            className="px-3 py-1.5 rounded-full text-xs text-white/50 font-semibold tracking-wide"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {f}
          </span>
        ))}
      </div>

      <p className="mt-4 mb-3 text-white/20 text-xs font-cinzel tracking-[0.3em] uppercase relative z-10">
        Bible Battle — 2026
      </p>
    </div>
  );
}
