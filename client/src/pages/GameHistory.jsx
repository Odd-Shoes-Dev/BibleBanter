import { useState, useEffect } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export default function GameHistory({ token, onBack }) {
  const [games, setGames] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${BACKEND}/api/games`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setGames(d.games || []); setLoading(false); })
      .catch(() => { setError('Failed to load game history.'); setLoading(false); });
  }, [token]);

  const loadDetail = async (id) => {
    const res = await fetch(`${BACKEND}/api/games/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setSelected(data.game);
  };

  const statusColor = (s) => s === 'finished' ? '#4ade80' : s === 'playing' ? '#fbbf24' : '#94a3b8';
  const statusLabel = (s) => s === 'finished' ? '✅ Finished' : s === 'playing' ? '🟡 In Progress' : '⏳ Lobby';

  if (selected) {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6 overflow-y-auto" style={{ background: '#0d0918' }}>
        <div className="w-full max-w-2xl mx-auto">
          <button onClick={() => setSelected(null)} className="text-white/40 text-sm hover:text-white/70 mb-6 transition-colors">
            ← Back to history
          </button>
          <div className="text-center mb-6">
            <p className="text-white/40 text-xs uppercase tracking-widest">Game PIN</p>
            <p className="font-anton text-4xl" style={{ color: '#f5a623' }}>{selected.pin}</p>
            <p className="text-white/40 text-sm mt-1">{selected.set?.name || 'Default Questions'} · {new Date(selected.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-white/50 text-xs font-black uppercase tracking-widest mb-3 text-center">Final Leaderboard</h3>
            <div className="space-y-2">
              {selected.players?.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: i === 0 ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)', border: i === 0 ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent' }}>
                  <span className="text-lg w-7 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                  <span className="flex-1 font-bold text-sm truncate" style={{ color: i === 0 ? '#fbbf24' : '#ffffffcc' }}>{p.name}</span>
                  {p.streak >= 3 && <span className="text-orange-400 text-xs">🔥{p.streak}</span>}
                  <span className="font-nunito font-black text-base" style={{ color: i === 0 ? '#fbbf24' : '#ffffff70' }}>{p.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 overflow-y-auto" style={{ background: '#0d0918' }}>
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-anton text-2xl text-white" style={{ letterSpacing: '0.04em' }}>GAME HISTORY</h1>
            <p className="text-white/40 text-sm">Your past Bible Battle sessions</p>
          </div>
          <button onClick={onBack} className="text-white/40 text-sm hover:text-white/70 transition-colors">← Back</button>
        </div>

        {loading && <p className="text-white/40 text-center py-12">Loading...</p>}
        {error && <p className="text-red-400 text-center py-12">{error}</p>}

        {!loading && games.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-white/40">No games played yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => loadDetail(g.id)}
              className="w-full rounded-2xl px-5 py-4 text-left transition-all hover:brightness-110 hover:scale-[1.01]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-nunito font-black text-white text-base">PIN: {g.pin}</p>
                  <p className="text-white/40 text-xs mt-0.5">{g.set?.name || 'Default Questions'} · {g._count?.players ?? 0} players</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: statusColor(g.status) }}>{statusLabel(g.status)}</p>
                  <p className="text-white/30 text-xs mt-0.5">{new Date(g.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
