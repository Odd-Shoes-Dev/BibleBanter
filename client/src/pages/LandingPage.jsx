import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const MEDALS = ['🥇', '🥈', '🥉'];
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Clean SVG icons for feature cards
const FeatureIcon = ({ type }) => {
  const icons = {
    quiz: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    ai: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    report: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
      </svg>
    ),
    trophy: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  };
  return icons[type] || null;
};

const FEATURES = [
  { iconType: 'quiz', title: 'Live Quizzes', desc: 'Real-time multiplayer trivia powered by your own content', color: '#fbbf24' },
  { iconType: 'ai', title: 'AI-Powered', desc: 'Generate quizzes from sermons, PDFs, or any Bible study material', color: '#a78bfa' },
  { iconType: 'report', title: 'Insight Reports', desc: 'See what stuck and what needs follow-up, per question', color: '#34d399' },
  { iconType: 'trophy', title: 'Leaderboards', desc: 'Streaks, speed bonuses, and rankings keep it competitive', color: '#f97316' },
];

const FLOATING_EMOJIS = ['✝️', '📖', '⚔️', '🕊️', '🔥', '💎', '⭐', '🛡️'];

export default function LandingPage({ onHost, onJoin, onSolo, hostUser, onLogin, onLogout, onHistory, onReports, onGoogleLogin }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: FLOATING_EMOJIS[i % FLOATING_EMOJIS.length],
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 12 + Math.random() * 16,
    }))
  );

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
    } catch { }
  };

  useEffect(() => {
    fetch(`${BACKEND}/api/leaderboard`)
      .then(r => r.json())
      .then(d => setLeaderboard(d.leaderboard || []))
      .catch(() => { });
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#06060f' }}>

      {/* ── Animated background particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <span key={p.id}
            className="absolute opacity-0"
            style={{
              left: `${p.left}%`,
              bottom: '-40px',
              fontSize: `${p.size}px`,
              animation: `floatUp ${p.duration}s ${p.delay}s infinite ease-out`,
            }}
          >{p.emoji}</span>
        ))}
      </div>

      {/* ── Gradient orbs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[40%] w-[600px] h-[400px] rounded-full blur-[130px] opacity-15"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
      </div>

      {/* ── Grid overlay ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 flex flex-col items-center px-4 py-8 min-h-screen">

        {/* ── Top bar ── */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px rgba(245,166,35,0.6))' }}>📖</span>
            <span style={{ fontFamily: 'Bangers, cursive', fontSize: '1.1rem', color: '#f5a623', letterSpacing: '0.08em' }}>BIBLE BANTER</span>
          </div>
          <div className="flex items-center gap-2">
            {hostUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-white/70 text-xs">👤 {hostUser.name}</span>
                <button onClick={onLogout}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={onLogin}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:brightness-125"
                style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',marginRight:'5px',verticalAlign:'middle'}}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>Login
              </button>
            )}
          </div>
        </div>

        {/* ── HERO section ── */}
        <div className="text-center flex flex-col items-center w-full max-w-2xl mb-12">

          {/* Glowing icon */}
          <div className="mb-5 relative" style={{ animation: 'sword-hover 4s ease-in-out infinite' }}>
            <span className="text-7xl sm:text-8xl block" style={{ filter: 'drop-shadow(0 0 30px rgba(245,166,35,0.5))' }}>📖</span>
            <div className="absolute inset-0 blur-2xl opacity-30 rounded-full" style={{ background: 'radial-gradient(circle, #f5a623, transparent)' }} />
          </div>

          {/* Title — gaming font */}
          <h1 className="animate-fade-in leading-none mb-4"
            style={{
              fontFamily: 'Bangers, cursive',
              fontSize: 'clamp(3rem, 12vw, 6rem)',
              letterSpacing: '0.06em',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 30%, #ff6b35 60%, #fbbf24 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'fadeIn 0.4s ease-out, shimmer 3s linear infinite',
              filter: 'drop-shadow(0 4px 20px rgba(245,166,35,0.3))',
            }}>
            BIBLE BANTER
          </h1>

          {/* Tagline */}
          <p className="font-nunito font-black text-white animate-fade-in mb-2"
            style={{ fontSize: 'clamp(1.15rem, 4vw, 1.6rem)', animationDelay: '0.1s', lineHeight: 1.3 }}>
            You preached. But did they <span style={{ color: '#fbbf24' }}>get it</span>?
          </p>

          {/* Sub-copy */}
          <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-3 max-w-md animate-fade-in"
            style={{ animationDelay: '0.18s' }}>
            You filled the room. But did the message land?<br />
            Or did the seed fall on rocky ground?
          </p>
          <p className="text-white/50 italic text-xs mb-6 animate-fade-in" style={{ animationDelay: '0.22s' }}>
            Attendance is visible. Understanding isn't.
          </p>

          {/* Value prop card */}
          <div className="rounded-2xl px-5 py-4 max-w-md mb-8 animate-fade-in text-left sm:text-center"
            style={{ animationDelay: '0.28s', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
            <p className="text-white/70 text-sm leading-relaxed">
              <span style={{ fontFamily: 'Bangers, cursive', color: '#fbbf24', fontSize: '1rem', letterSpacing: '0.04em', marginRight: '0.35em' }}>Bible Banter</span> turns sermons, Bible studies, and fellowship notes into
              <strong className="text-white/90"> live interactive quizzes</strong> - with leaderboards for the room and <strong className="text-white/90">instant reports</strong> for leaders.
            </p>
          </div>

          {/* Free badge */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.32s' }}>
            <span className="px-5 py-2 rounded-full text-xs font-black tracking-wider uppercase"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
                border: '1px solid rgba(34,197,94,0.35)',
                color: '#4ade80',
                boxShadow: '0 0 20px rgba(34,197,94,0.1)',
              }}>
              ✝️ Free for churches — always
            </span>
          </div>

          {/* ── CTA Buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-md animate-slide-up" style={{ animationDelay: '0.38s' }}>
            <button
              onClick={onHost}
              className="group relative overflow-hidden rounded-2xl px-7 py-4 font-black text-white text-base transition-all duration-300 hover:scale-[1.04] active:scale-95 flex-1"
              style={{ fontFamily: 'Nunito, sans-serif', minWidth: '170px' }}
            >
              <div className="absolute inset-0 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #f5a623 0%, #e8920d 50%, #d97706 100%)' }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f5a623 50%, #e8920d 100%)' }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: 'inset 0 0 30px rgba(255,255,255,0.15)' }} />
              <span className="relative z-10 flex items-center justify-center gap-2">
                🎙️ Host a Game
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
            </button>

            <button
              onClick={onJoin}
              className="group relative overflow-hidden rounded-2xl px-7 py-4 font-black text-white text-base transition-all duration-300 hover:scale-[1.04] active:scale-95 flex-1"
              style={{ fontFamily: 'Nunito, sans-serif', minWidth: '170px' }}
            >
              <div className="absolute inset-0 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)' }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)' }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: 'inset 0 0 30px rgba(255,255,255,0.15)' }} />
              <span className="relative z-10 flex items-center justify-center gap-2">
                🎮 Join a Game
              </span>
            </button>
          </div>

          {/* Secondary actions */}
          <div className="flex gap-3 mt-3 animate-slide-up flex-wrap justify-center" style={{ animationDelay: '0.45s' }}>
            <button
              onClick={onSolo}
              className="rounded-xl px-5 py-2.5 font-nunito font-black text-sm transition-all duration-200 hover:scale-[1.03] hover:brightness-125 active:scale-95"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}
            >
              🎯 Solo Practice
            </button>
            <a
              href="https://betweenhisshoulders.org/services/kingdom-tech-hubs/kc-labs-software-development"
              target="_blank" rel="noopener noreferrer"
              className="rounded-xl px-5 py-2.5 font-nunito font-black text-sm transition-all duration-200 hover:scale-[1.03] hover:brightness-125 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.6)' }}
            >
              🙏 Support the Mission
            </a>
          </div>

          {/* Google / Auth */}
          {!hostUser && (
            <div className="mt-6 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              {GOOGLE_CLIENT_ID && (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => { }}
                  theme="filled_black" shape="pill" text="signin_with" size="medium"
                />
              )}
            </div>
          )}

          {/* Logged-in actions */}
          {hostUser && (
            <div className="mt-5 flex items-center gap-2 flex-wrap justify-center animate-fade-in">
              <button onClick={onHistory}
                className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.03] hover:brightness-125"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' }}>
                📋 Game History
              </button>
              <button onClick={onReports}
                className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.03] hover:brightness-125"
                style={{ background: 'rgba(13,148,136,0.1)', color: '#2dd4bf', border: '1px solid rgba(13,148,136,0.25)' }}>
                📊 Reports
              </button>
            </div>
          )}
        </div>

        {/* ── Feature cards ── */}
        <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12 px-2">
          {FEATURES.map((f, i) => (
            <div key={f.title}
              className="rounded-2xl p-4 text-center transition-all duration-300 hover:scale-[1.03] hover:border-white/15 animate-slide-up group"
              style={{
                animationDelay: `${0.5 + i * 0.08}s`,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(4px)',
              }}>
              <div className="mb-3 flex justify-center transition-transform duration-300 group-hover:scale-110" style={{ color: f.color }}>
                <FeatureIcon type={f.iconType} />
              </div>
              <p className="text-sm sm:text-base font-black text-white mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{f.title}</p>
              <p className="text-xs sm:text-sm text-white/80 leading-snug hidden sm:block">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── How it works ── */}
        <div className="w-full max-w-2xl mb-12 px-2">
          <h2 className="text-center mb-6 animate-fade-in"
            style={{ fontFamily: 'Bangers, cursive', fontSize: 'clamp(1.4rem, 5vw, 2rem)', color: '#c4b5fd', letterSpacing: '0.04em' }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Upload Content', desc: 'Paste your sermon text, upload a PDF/DOCX, or let AI generate questions from any Bible topic', color: '#fbbf24' },
              { step: '02', title: 'Play Live', desc: 'Share the PIN. Players join on their phones. Questions appear in real-time with speed bonuses', color: '#60a5fa' },
              { step: '03', title: 'Get Insights', desc: 'Instant reports show what stuck: question-by-question accuracy, common mistakes, and follow-up suggestions', color: '#4ade80' },
            ].map((s, i) => (
              <div key={s.step}
                className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] animate-slide-up relative overflow-hidden"
                style={{
                  animationDelay: `${0.6 + i * 0.1}s`,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}>
                <div className="absolute top-3 right-3 opacity-5" style={{ fontFamily: 'Bangers, cursive', fontSize: '4rem', color: s.color }}>{s.step}</div>
                <div className="text-xs font-black mb-2 tracking-widest" style={{ fontFamily: 'Orbitron, sans-serif', color: s.color, fontSize: '0.65rem' }}>STEP {s.step}</div>
                <p className="font-nunito font-black text-white text-base mb-1">{s.title}</p>
                <p className="text-sm text-white/80 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Global Leaderboard ── */}
        {leaderboard.length > 0 && (
          <div className="w-full max-w-sm mb-12 px-4">
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="px-4 py-3 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-black uppercase tracking-[0.2em]"
                  style={{ fontFamily: 'Orbitron, sans-serif', color: '#fbbf24', fontSize: '0.8rem' }}>
                  🏆 Hall of Fame
                </p>
              </div>
              <div className="p-3 space-y-1.5">
                {leaderboard.map((p, i) => {
                  const score = Number(p.totalScore ?? 0);
                  return (
                    <div key={p.name}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-white/[0.04]"
                      style={{
                        background: i === 0 ? 'rgba(251,191,36,0.08)' : 'transparent',
                        border: i === 0 ? '1px solid rgba(251,191,36,0.15)' : '1px solid transparent',
                      }}>
                      <span className="text-base w-7 text-center flex-shrink-0">{MEDALS[i] || `#${p.rank}`}</span>
                      <span className="flex-1 text-sm font-bold truncate" style={{ color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.95)' }}>{p.name}</span>
                      <span className="text-xs font-black flex-shrink-0 tabular-nums" style={{
                        fontFamily: score > 0 ? 'Orbitron, monospace, sans-serif' : 'Nunito, sans-serif',
                        fontSize: '0.75rem',
                        color: i === 0 ? '#fbbf24' : score > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
                        minWidth: '2.5rem',
                        textAlign: 'right',
                      }}>
                        {score > 0 ? score.toLocaleString() : '—'}
                      </span>
                      <span className="text-white/70 text-xs flex-shrink-0 w-6 text-right">{p.gamesPlayed}g</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-auto pt-8 pb-4 text-center px-4">
          <div className="inline-flex flex-col items-center gap-3">
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Built by{' '}
              <a href="https://www.oddshoes.dev" target="_blank" rel="noopener noreferrer"
                className="text-white/80 hover:text-white underline underline-offset-2 transition-colors font-semibold">
                Odd Shoes
              </a>
              {' '}in partnership with{' '}
              <a href="https://betweenhisshoulders.org/services/kingdom-tech-hubs/kc-labs-software-development"
                target="_blank" rel="noopener noreferrer"
                className="text-white/80 hover:text-white underline underline-offset-2 transition-colors font-semibold">
                Kingdom Chaplain
              </a>
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.oddshoes.dev" target="_blank" rel="noopener noreferrer"
                className="text-white/65 hover:text-white text-sm transition-colors">oddshoes.dev</a>
              <span className="text-white/50">·</span>
              <a href="https://betweenhisshoulders.org" target="_blank" rel="noopener noreferrer"
                className="text-white/65 hover:text-white text-sm transition-colors">betweenhisshoulders.org</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inline keyframes ── */}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(0) rotate(0deg) scale(0.5); }
          10%  { opacity: 0.15; }
          50%  { opacity: 0.08; }
          100% { opacity: 0; transform: translateY(-100vh) rotate(360deg) scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}
