import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const MEDALS = ['🥇', '🥈', '🥉'];
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function LandingPage({ onHost, onJoin, onSolo, hostUser, onLogin, onLogout, onHistory, onReports, onTheme, onGoogleLogin }) {
  const [leaderboard, setLeaderboard] = useState([]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${BACKEND}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('bb_token', data.token);
      localStorage.setItem('bb_host', JSON.stringify(data.host));
      onGoogleLogin?.(data.host, data.token);
    } catch {}
  };

  useEffect(() => {
    fetch(`${BACKEND}/api/leaderboard`)
      .then(r => r.json())
      .then(d => setLeaderboard(d.leaderboard || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 relative overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0b14 0%, #0e0f1e 55%, #0a0b14 100%)' }}>

      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] blur-[130px] opacity-25"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.4) 0%, rgba(37,99,235,0.15) 55%, transparent 75%)' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] blur-[90px] opacity-15"
          style={{ background: 'radial-gradient(ellipse, rgba(245,166,35,0.25) 0%, transparent 70%)' }} />
      </div>

      {/* ── HERO ── */}
      <div className="text-center relative z-10 flex flex-col items-center w-full max-w-lg">

        {/* Icon */}
        <div className="mb-4 select-none" style={{ animation: 'sword-hover 4s ease-in-out infinite' }}>
          <span className="text-5xl" style={{ filter: 'drop-shadow(0 0 20px rgba(245,166,35,0.5))' }}>📖</span>
        </div>

        {/* App name */}
        <h1 className="font-anton leading-none tracking-wider mb-3 animate-fade-in"
          style={{
            fontSize: 'clamp(2.6rem, 10vw, 5rem)',
            color: '#f5a623',
            textShadow: '0 0 50px rgba(245,166,35,0.35)',
            letterSpacing: '0.05em',
          }}>
          BIBLE BANTER
        </h1>

        {/* Primary headline */}
        <p className="font-nunito font-black text-white animate-fade-in mb-2"
          style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', animationDelay: '0.1s', lineHeight: 1.3 }}>
          You preached. But did they get it?
        </p>

        {/* Supporting copy */}
        <div className="text-white/40 text-sm leading-relaxed mb-3 max-w-sm animate-fade-in space-y-1"
          style={{ animationDelay: '0.18s' }}>
          <p>You filled the room. But did the message land?<br />Or did the seed fall on rocky ground?</p>
          <p className="text-white/25 italic text-xs">Attendance is visible. Understanding isn't.</p>
        </div>

        {/* Value prop */}
        <p className="text-white/55 text-sm leading-relaxed mb-7 max-w-sm animate-fade-in"
          style={{ animationDelay: '0.25s' }}>
          Bible Banter turns sermons, Bible studies, and fellowship notes into live interactive quizzes — with leaderboards for the room and instant reports for leaders on what was understood, what was missed, and what needs follow-up.
        </p>

        {/* Free badge */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <span className="px-4 py-1.5 rounded-full text-xs font-black tracking-wide"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80' }}>
            ✝️ Free for churches
          </span>
        </div>

        {/* Feature badges */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap animate-fade-in"
          style={{ animationDelay: '0.35s' }}>
          {[
            { icon: '📊', label: 'Instant Reports' },
            { icon: '🎮', label: 'Live Quizzes' },
            { icon: '🏆', label: 'Leaderboard' },
            { icon: '⚡', label: 'Real-Time' },
          ].map(f => (
            <span key={f.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              {f.icon} {f.label}
            </span>
          ))}
        </div>

        {/* Primary CTAs */}
        <div className="flex gap-3 justify-center flex-wrap animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={onHost}
            className="rounded-2xl px-7 py-4 font-nunito font-black text-white text-base transition-all duration-200 hover:scale-[1.04] hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #f5a623 0%, #e8920d 100%)',
              boxShadow: '0 6px 32px rgba(245,166,35,0.4)',
              minWidth: '190px',
            }}
          >
            🎙️ Use Bible Banter Free
          </button>
          <a
            href="https://betweenhisshoulders.org/services/kingdom-tech-hubs/kc-labs-software-development"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl px-7 py-4 font-nunito font-black text-white text-base transition-all duration-200 hover:scale-[1.04] hover:brightness-125 active:scale-95 flex items-center justify-center"
            style={{
              background: '#1e1f30',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
              minWidth: '190px',
            }}
          >
            🙏 Support the Mission
          </a>
        </div>

        {/* Secondary actions */}
        <div className="flex gap-3 mt-3 animate-slide-up flex-wrap justify-center" style={{ animationDelay: '0.48s' }}>
          <button
            onClick={onJoin}
            className="rounded-xl px-5 py-2.5 font-nunito font-black text-sm transition-all hover:brightness-125 active:scale-95"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}
          >
            🎮 Join a Game
          </button>
          <button
            onClick={onSolo}
            className="rounded-xl px-5 py-2.5 font-nunito font-black text-sm transition-all hover:brightness-125 active:scale-95"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}
          >
            🎯 Solo Practice
          </button>
        </div>

        {/* Auth bar */}
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          {hostUser ? (
            <>
              <span className="text-white/40 text-xs">👤 {hostUser.name}</span>
              <button onClick={onHistory}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}>
                📋 History
              </button>
              <button onClick={onReports}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(13,148,136,0.15)', color: '#2dd4bf', border: '1px solid rgba(13,148,136,0.3)' }}>
                📊 Reports
              </button>
              <button onClick={onLogout}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.12)' }}>
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {GOOGLE_CLIENT_ID && (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {}}
                  theme="filled_black"
                  shape="pill"
                  text="signin_with"
                  size="medium"
                />
              )}
              <button onClick={onLogin}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                🔐 Host Login
              </button>
            </div>
          )}
        </div>

        {/* Theme picker */}
        {onTheme && (
          <div className="mt-4">
            <button onClick={onTheme}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.25)' }}>
              🎨 Themes
            </button>
          </div>
        )}
      </div>

      {/* Global Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="relative z-10 w-full max-w-sm mt-10 px-4">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-center text-white/40 text-xs font-black uppercase tracking-widest mb-3">🏆 Hall of Fame — Top Players</p>
            <div className="space-y-1.5">
              {leaderboard.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                  style={{ background: i === 0 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)', border: i === 0 ? '1px solid rgba(251,191,36,0.2)' : '1px solid transparent' }}>
                  <span className="text-sm w-6 text-center flex-shrink-0">{MEDALS[i] || `#${p.rank}`}</span>
                  <span className="flex-1 text-xs font-bold truncate" style={{ color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.7)' }}>{p.name}</span>
                  <span className="text-xs font-black flex-shrink-0" style={{ color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.45)' }}>{p.totalScore.toLocaleString()}</span>
                  <span className="text-white/20 text-xs flex-shrink-0">{p.gamesPlayed}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Attribution footer */}
      <div className="relative z-10 mt-12 mb-2 text-center px-4">
        <div className="inline-flex flex-col items-center gap-2">
          <p className="text-white/20 text-xs leading-relaxed max-w-xs">
            Built by{' '}
            <a href="https://www.oddshoes.dev" target="_blank" rel="noopener noreferrer"
              className="text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors font-semibold">
              Odd Shoes
            </a>
            {' '}in partnership with{' '}
            <a href="https://betweenhisshoulders.org/services/kingdom-tech-hubs/kc-labs-software-development"
              target="_blank" rel="noopener noreferrer"
              className="text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors font-semibold">
              Kingdom Chaplain
            </a>
            {' '}to help churches make understanding visible.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.oddshoes.dev" target="_blank" rel="noopener noreferrer"
              className="text-white/20 hover:text-white/45 text-xs transition-colors">
              oddshoes.dev
            </a>
            <span className="text-white/10">·</span>
            <a href="https://betweenhisshoulders.org" target="_blank" rel="noopener noreferrer"
              className="text-white/20 hover:text-white/45 text-xs transition-colors">
              betweenhisshoulders.org
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
