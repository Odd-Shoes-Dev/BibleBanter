const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 4 + (i % 4) * 3,
  x: 5 + (i * 8.3) % 90,
  y: 10 + (i * 13.7) % 80,
  delay: (i * 0.4) % 3,
  dur: 3 + (i % 3),
}));

export default function LandingPage({ onHost, onJoin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0a1a 0%, #0d1224 50%, #0a0f1e 100%)' }}>

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Orange orb */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)', animationDuration: '4s' }} />
        {/* Blue orb */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', animationDuration: '5s', animationDelay: '1s' }} />
        {/* Top center glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.1) 0%, rgba(37,99,235,0.08) 50%, transparent 70%)' }} />

        {/* Floating particles */}
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full animate-bounce"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: p.id % 2 === 0
                ? `rgba(249,115,22,${0.15 + (p.id % 3) * 0.08})`
                : `rgba(37,99,235,${0.15 + (p.id % 3) * 0.08})`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}

        {/* Decorative cross / scripture marks */}
        <div className="absolute top-10 right-14 text-5xl opacity-[0.04] font-cinzel rotate-12 select-none">✝</div>
        <div className="absolute bottom-20 left-10 text-7xl opacity-[0.04] font-cinzel -rotate-6 select-none">✝</div>
      </div>

      {/* ── HERO ── */}
      <div className="text-center relative z-10">

        {/* Logo — animated entrance */}
        <div className="animate-bounce-in mb-4">
          <img
            src="/kampus-logo.jpeg"
            alt="Kampus Logo"
            className="w-20 h-20 object-contain mx-auto"
            style={{ filter: 'drop-shadow(0 0 24px rgba(249,115,22,0.55))' }}
          />
        </div>

        {/* Title */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="font-cinzel font-black leading-none tracking-widest"
            style={{
              fontSize: 'clamp(2.4rem, 7vw, 4.5rem)',
              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 40%, #fdba74 70%, #ea580c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 40px rgba(249,115,22,0.5))',
            }}>
            BIBLE BATTLE
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-white/50 text-sm mt-3 mb-6 font-medium animate-fade-in"
          style={{ animationDelay: '0.2s' }}>
          The ultimate Bible trivia showdown. Host a game, invite friends, and battle it out!
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 justify-center mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {[
            { icon: '⚡', label: 'Speed Scoring' },
            { icon: '👥', label: 'Multiplayer' },
            { icon: '🏆', label: 'Leaderboard' },
            { icon: '🔥', label: 'Streaks' },
            { icon: '📖', label: 'Scripture' },
          ].map((f, i) => (
            <span key={f.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                animationDelay: `${0.3 + i * 0.05}s`
              }}>
              {f.icon} {f.label}
            </span>
          ))}
        </div>

        {/* Buttons — side by side like reference */}
        <div className="flex gap-3 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {/* Host — Orange */}
          <button
            onClick={onHost}
            className="group relative overflow-hidden rounded-2xl px-8 py-4 font-nunito font-black text-white text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 8px 32px rgba(249,115,22,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
              minWidth: '170px',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600" />
            <span className="relative flex items-center justify-center gap-2">
              🎙️ Host a Game
            </span>
          </button>

          {/* Join — Blue */}
          <button
            onClick={onJoin}
            className="group relative overflow-hidden rounded-2xl px-8 py-4 font-nunito font-black text-white text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
              minWidth: '170px',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600" />
            <span className="relative flex items-center justify-center gap-2">
              🎮 Join Game
            </span>
          </button>
        </div>
      </div>

      <p className="mt-8 text-white/15 text-xs font-cinzel tracking-[0.3em] uppercase relative z-10">
        Bible Battle — 2026
      </p>
    </div>
  );
}
