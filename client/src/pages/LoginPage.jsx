import { useState } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function LoginPage({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Email and password are required.');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      localStorage.setItem('bb_token', data.token);
      localStorage.setItem('bb_host', JSON.stringify(data.host));
      onLogin(data.host, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, #0d0e1a 0%, #111228 60%, #0d0e1a 100%)' }}>
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-4xl mb-3">⚔️</div>
          <h1 className="font-anton text-3xl mb-1" style={{ color: '#f5a623', letterSpacing: '0.04em' }}>
            HOST LOGIN
          </h1>
          <p className="text-white/40 text-sm">Sign in to manage your question sets and game history</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-white font-semibold outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-white font-semibold outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-semibold animate-bounce-in"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-black text-lg text-white font-nunito transition-all hover:brightness-110 disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', boxShadow: '0 6px 24px rgba(217,119,6,0.4)' }}
          >
            {loading ? '⏳ Signing in...' : '⚔️ Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={onRegister}
            className="text-white/40 text-sm hover:text-white/70 transition-colors"
          >
            No account? <span className="text-amber-400 font-bold">Create one →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
