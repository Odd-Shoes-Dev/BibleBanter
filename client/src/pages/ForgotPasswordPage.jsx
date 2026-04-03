import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) return setError('Email is required.');

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to process request.');
      
      setMessage(data.message || 'If an account with that email exists, we have sent a password reset link. Please check your spam folder.');
      setEmail('');
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

        {/* Back Link */}
        <button 
          onClick={() => window.location.href = '/'}
          className="mb-6 flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-4xl mb-3">📬</div>
          <h1 className="font-anton text-3xl mb-1" style={{ color: '#f5a623', letterSpacing: '0.04em' }}>
            RESET PASSWORD
          </h1>
          <p className="text-white/40 text-sm mb-2">Enter your email address and we'll send you a link to reset your password.</p>
          <p className="text-white/30 text-xs">If you don't see the email in your inbox, please check your spam folder.</p>
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

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-semibold animate-bounce-in"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl px-4 py-3 text-sm font-semibold animate-bounce-in"
              style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)', color: '#6ee7b7' }}>
              ✅ {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-black text-lg text-white font-nunito transition-all hover:brightness-110 disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', boxShadow: '0 6px 24px rgba(217,119,6,0.4)' }}
          >
            {loading ? '⏳ Sending Link...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}