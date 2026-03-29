import { useState } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function RegisterPage({ onLogin, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) return setError('All fields are required.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');
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

        <div className="text-center mb-8 animate-fade-in">
          <div className="text-4xl mb-3">📖</div>
          <h1 className="font-anton text-3xl mb-1" style={{ color: '#f5a623', letterSpacing: '0.04em' }}>
            CREATE ACCOUNT
          </h1>
          <p className="text-white/40 text-sm">Register to host games and save your question sets</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Name', value: name, set: setName, type: 'text', placeholder: 'Your name', auto: 'name' },
            { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'you@example.com', auto: 'email' },
            { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: '8+ characters', auto: 'new-password' },
            { label: 'Confirm Password', value: confirm, set: setConfirm, type: 'password', placeholder: 'Repeat password', auto: 'new-password' },
          ].map(({ label, value, set, type, placeholder, auto }) => (
            <div key={label}>
              <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type={type}
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                autoComplete={auto}
                className="w-full px-4 py-3 rounded-xl text-white font-semibold outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>
          ))}

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
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 6px 24px rgba(124,58,237,0.4)' }}
          >
            {loading ? '⏳ Creating...' : '✝️ Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-white/40 text-sm hover:text-white/70 transition-colors">
            ← Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
