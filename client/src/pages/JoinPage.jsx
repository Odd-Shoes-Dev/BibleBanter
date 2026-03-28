import { useState } from 'react';

export default function JoinPage({ onJoin, onBack }) {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!pin.trim() || pin.length !== 6) {
      setError('Enter a valid 6-digit PIN');
      return;
    }
    if (!name.trim() || name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setLoading(true);
    onJoin(pin.trim(), name.trim());
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-md animate-bounce-in relative z-10">
        <button
          onClick={onBack}
          className="mb-6 text-white/60 hover:text-white flex items-center gap-2 transition-colors font-medium"
        >
          ← Back
        </button>

        <div className="bg-glass-dark rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎮</div>
            <h2 className="font-cinzel text-3xl font-black text-white mb-1">JOIN GAME</h2>
            <p className="text-white/50 text-sm">Enter your PIN and pick a name</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-amber-400 mb-2 tracking-wide uppercase">
                Game PIN
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit PIN"
                maxLength={6}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white text-2xl font-bold text-center tracking-widest placeholder-white/30 focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-400 mb-2 tracking-wide uppercase">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg font-semibold placeholder-white/30 focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm font-medium animate-bounce-in">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-xl text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 font-cinzel tracking-wide"
              style={{
                background: loading ? 'rgba(100,100,100,0.5)' : 'linear-gradient(135deg, #d97706, #b45309)',
                boxShadow: loading ? 'none' : '0 8px 30px rgba(217, 119, 6, 0.4)',
              }}
            >
              {loading ? '⏳ Joining...' : '⚔️ JOIN BATTLE'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
