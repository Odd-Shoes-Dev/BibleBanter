import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Automatically extract token directly from window.location.pathname rather than router dependencies
  const token = window.location.pathname.split('/reset-password/')[1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password) return setError('Password is required.');
    if (password.length < 6) return setError('Password must be at least 6 characters long.');
    if (!token) return setError('Invalid password reset link.');

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to process request.');
      
      setMessage(data.message || 'Password reset successfully.');
      setPassword('');
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#0d0e1a' }}>
        <p className="text-white/60 mb-4">Invalid password reset link.</p>
        <button onClick={() => window.location.href = '/'} className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, #0d0e1a 0%, #111228 60%, #0d0e1a 100%)' }}>
      <div className="w-full max-w-sm">

        {/* Back Link */}
        <button 
          onClick={() => window.location.href = '/'}
          className="mb-6 flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="font-anton text-3xl mb-1" style={{ color: '#f5a623', letterSpacing: '0.04em' }}>
            NEW PASSWORD
          </h1>
          <p className="text-white/40 text-sm">Create a new password for your account.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 rounded-xl text-white font-semibold outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-semibold animate-bounce-in"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          {message && (
             <div className="rounded-xl px-4 py-3 text-sm font-semibold animate-bounce-in flex flex-col gap-3"
              style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)', color: '#6ee7b7' }}>
              <span>✅ {message}</span>
              <button
                 type="button"
                 onClick={() => window.location.href = '/'}
                 className="py-2 rounded-lg bg-[#34d399] text-black font-bold text-center"
              >
                 Go to Login
              </button>
            </div>
          )}

          {!message && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-lg text-white font-nunito transition-all hover:brightness-110 disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', boxShadow: '0 6px 24px rgba(217,119,6,0.4)' }}
            >
              {loading ? '⏳ Saving...' : 'Reset Password'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}