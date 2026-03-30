import { useState, useEffect } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const MEDALS = ['🥇', '🥈', '🥉'];

export default function LandingPage({ onHost, onJoin, onSolo, hostUser, onLogin, onLogout, onHistory, onReports, onTheme }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND}/api/leaderboard`)
      .then(r => r.json())
      .then(d => setLeaderboard(d.leaderboard || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d0e1a 0%, #111228 60%, #0d0e1a 100%)' }}>

      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.3) 0%, rgba(37,99,235,0.15) 50%, transparent 70%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.2) 0%, transparent 70%)' }} />
      </div>

      {/* ── HERO ── */}
      <div className="text-center relative z-10 flex flex-col items-center">

        {/* Crossed swords icon */}
        <div className="mb-3 select-none" style={{ animation: 'sword-hover 3s ease-in-out infinite' }}>
          <span className="text-5xl" style={{ filter: 'drop-shadow(0 0 18px rgba(139,92,246,0.6))' }}>⚔️</span>
        </div>

        {/* Title */}
        <h1 className="font-anton leading-none tracking-wider mb-4 animate-fade-in"
          style={{
            fontSize: 'clamp(3rem, 11vw, 6rem)',
            color: '#f5a623',
            textShadow: '0 0 60px rgba(245,166,35,0.4)',
            letterSpacing: '0.04em',
          }}>
          BIBLE BATTLE
        </h1>

        {/* Tagline */}
        <p className="text-white/45 text-sm leading-relaxed mb-8 max-w-xs animate-fade-in"
          style={{ animationDelay: '0.15s' }}>
          The ultimate Bible trivia showdown. Host a game, invite friends, and battle it out!
        </p>

        {/* Feature badges — only 3, matching reference */}
        <div className="flex gap-2 justify-center mb-9 flex-wrap animate-fade-in"
          style={{ animationDelay: '0.25s' }}>
          {[
            { icon: '⚡', label: 'Speed Scoring' },
            { icon: '👥', label: 'Multiplayer' },
            { icon: '🏆', label: 'Leaderboard' },
          ].map(f => (
            <span key={f.label}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.55)',
              }}>
              {f.icon} {f.label}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.35s' }}>
          {/* Host — Amber/Orange */}
          <button
            onClick={onHost}
            className="group relative overflow-hidden rounded-2xl px-8 py-4 font-nunito font-black text-white text-base transition-all duration-200 hover:scale-[1.04] hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #f5a623 0%, #e8920d 100%)',
              boxShadow: '0 6px 32px rgba(245,166,35,0.45)',
              minWidth: '160px',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              🎙️ Host a Game
            </span>
          </button>

          {/* Join — Dark charcoal */}
          <button
            onClick={onJoin}
            className="group relative overflow-hidden rounded-2xl px-8 py-4 font-nunito font-black text-white text-base transition-all duration-200 hover:scale-[1.04] hover:brightness-125 active:scale-95"
            style={{
              background: '#2a2b3d',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
              minWidth: '160px',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              🎮 Join Game
            </span>
          </button>
        </div>

        {/* Solo Practice */}
        <div className="mt-3 animate-slide-up" style={{ animationDelay: '0.45s' }}>
          <button
            onClick={onSolo}
            className="rounded-2xl px-6 py-3 font-nunito font-black text-sm transition-all duration-200 hover:scale-[1.03] hover:brightness-110 active:scale-95"
            style={{
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.35)',
              color: '#c4b5fd',
              boxShadow: '0 4px 20px rgba(124,58,237,0.2)',
            }}
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
            <button onClick={onLogin}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
              🔐 Host Login
            </button>
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

        {/* Kampus logo branding */}
        <div className="mt-5 flex items-center gap-2.5 opacity-50 hover:opacity-80 transition-opacity">
          <img src="/kampus-logo.jpeg" alt="Kampus" className="w-7 h-7 object-contain rounded-full" />
          <span className="text-white/60 text-xs font-semibold tracking-wide">A Kampus Event</span>
        </div>
      </div>

      {/* Global Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="relative z-10 w-full max-w-sm mt-8 mb-6 px-4">
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
    </div>
  );
}
