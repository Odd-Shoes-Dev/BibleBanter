import { useState, useEffect } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const TESTAMENT_OPTIONS = [
  { id: 'Old Testament', label: 'Old Testament', emoji: '📜', desc: 'Genesis to Malachi', color: '#d97706', border: 'rgba(217,119,6,0.4)' },
  { id: 'New Testament', label: 'New Testament', emoji: '✝️', desc: 'Matthew to Revelation', color: '#3b82f6', border: 'rgba(59,130,246,0.4)' },
  { id: 'both', label: 'Mixed (Both)', emoji: '📖', desc: 'Full Bible', color: '#8b5cf6', border: 'rgba(139,92,246,0.4)' },
];

export default function HostSetup({ onSelect, onBack, token }) {
  const [sets, setSets] = useState([]);
  const [tab, setTab] = useState('default'); // 'default' | 'custom'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${BACKEND}/api/sets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setSets((d.sets || []).filter(s => !s.isDefault)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(180deg, #0d0e1a 0%, #111228 60%, #0d0e1a 100%)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-6 animate-fade-in">
          <div className="text-4xl mb-3">⚔️</div>
          <h1 className="font-anton text-3xl mb-1" style={{ color: '#f5a623', letterSpacing: '0.04em' }}>
            CHOOSE QUESTIONS
          </h1>
          <p className="text-white/40 text-sm">Select the question set for this battle</p>
        </div>

        {/* Tab switcher */}
        {token && (
          <div className="flex rounded-xl p-1 mb-5" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {['default', 'custom'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: tab === t ? 'rgba(251,191,36,0.2)' : 'transparent',
                  color: tab === t ? '#fbbf24' : '#ffffff60',
                  border: tab === t ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent',
                }}>
                {t === 'default' ? '📖 Default' : '📂 My Sets'}
              </button>
            ))}
          </div>
        )}

        {/* Default tab: testament filter */}
        {tab === 'default' && (
          <div className="space-y-3 mb-6">
            {TESTAMENT_OPTIONS.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => onSelect({ testament: opt.id, setId: null })}
                className="w-full rounded-2xl px-5 py-4 text-left transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] animate-slide-up flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${opt.border}`, animationDelay: `${i * 0.08}s` }}
              >
                <span className="text-3xl flex-shrink-0">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="font-nunito font-black text-base" style={{ color: opt.color }}>{opt.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{opt.desc}</p>
                </div>
                <span className="text-white/20 text-lg">›</span>
              </button>
            ))}
          </div>
        )}

        {/* Custom sets tab */}
        {tab === 'custom' && (
          <div className="space-y-3 mb-6">
            {loading && <p className="text-white/40 text-sm text-center py-6">Loading sets...</p>}
            {!loading && sets.length === 0 && (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-white/40 text-sm">No custom sets yet.</p>
                <p className="text-white/30 text-xs mt-1">Upload questions from the lobby screen.</p>
              </div>
            )}
            {sets.map((set, i) => (
              <button
                key={set.id}
                onClick={() => onSelect({ testament: 'both', setId: set.id })}
                className="w-full rounded-2xl px-5 py-4 text-left transition-all hover:scale-[1.02] hover:brightness-110 flex items-center gap-4 animate-slide-up"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.4)', animationDelay: `${i * 0.06}s` }}
              >
                <span className="text-3xl flex-shrink-0">📂</span>
                <div className="flex-1">
                  <p className="font-nunito font-black text-base text-purple-300">{set.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{set._count?.questions ?? 0} questions · {set.testament}</p>
                </div>
                <span className="text-white/20 text-lg">›</span>
              </button>
            ))}
          </div>
        )}

        <button onClick={onBack} className="w-full py-2.5 rounded-xl text-white/35 text-sm font-semibold hover:text-white/60 transition-colors">
          ← Back
        </button>
      </div>
    </div>
  );
}
