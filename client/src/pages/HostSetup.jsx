import { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import UploadQuestions from './UploadQuestions';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const TESTAMENT_OPTIONS = [
  { id: 'Old Testament', label: 'Old Testament', emoji: '📜', desc: 'Genesis to Malachi', color: '#d97706', border: 'rgba(217,119,6,0.4)' },
  { id: 'New Testament', label: 'New Testament', emoji: '✝️', desc: 'Matthew to Revelation', color: '#3b82f6', border: 'rgba(59,130,246,0.4)' },
  { id: 'both', label: 'Mixed (Both)', emoji: '📖', desc: 'Full Bible', color: '#8b5cf6', border: 'rgba(139,92,246,0.4)' },
];

const TIMER_OPTIONS = [10, 15, 20, 30, 45, 60];
const ROUND_PRESETS = [
  { label: 'Mini', value: 10, desc: '~5 min', color: '#22c55e', border: 'rgba(34,197,94,0.5)' },
  { label: 'Maxi', value: 25, desc: '~12 min', color: '#f59e0b', border: 'rgba(245,158,11,0.5)' },
  { label: 'Pro',  value: 40, desc: '~20 min', color: '#ef4444', border: 'rgba(239,68,68,0.5)' },
  { label: 'Custom', value: null, desc: 'You set it', color: '#a78bfa', border: 'rgba(167,139,250,0.5)' },
];

export default function HostSetup({ onSelect, onBack, onEditSet, onAiGenerator, token }) {
  const [sets, setSets] = useState([]);
  const [tab, setTab] = useState('default');
  const [loading, setLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { id, name, count }
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [questionTime, setQuestionTime] = useState(20);
  const [rounds, setRounds] = useState(10);
  const [customRounds, setCustomRounds] = useState('');
  const [roundPreset, setRoundPreset] = useState('Mini');
  const [mode, setMode] = useState('Multiplayer');

  const loadSets = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${BACKEND}/api/sets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setSets((d.sets || []).filter(s => !s.isDefault)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { loadSets(); }, [loadSets]);

  const handleDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true); setDeleteErr('');
    try {
      const res = await fetch(`${BACKEND}/api/sets/${confirmTarget.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Delete failed');
      setSets(prev => prev.filter(s => s.id !== confirmTarget.id));
      setConfirmTarget(null);
    } catch (e) { setDeleteErr(e.message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(180deg, #0d0e1a 0%, #111228 60%, #0d0e1a 100%)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-6 animate-fade-in">
          <div className="text-4xl mb-3">⚔️</div>
          <h1 className="font-anton text-3xl mb-1" style={{ color: '#f5a623', letterSpacing: '0.04em' }}>
            CONFIGURE GAME
          </h1>
          <p className="text-white/40 text-sm">Set up your game and choose a question set</p>
        </div>

        {/* Game Settings */}
        <div className="rounded-2xl p-4 mb-5 animate-fade-in" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-3">⚙️ Game Settings</p>          
          {/* Mode Selection */}
          <div className="mb-4">
            <p className="text-white/60 text-xs font-semibold mb-2">🎮 Mode</p>
            <div className="flex gap-2">
              {['Multiplayer', 'Team mode'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-black transition-all"
                  style={{
                    background: mode === m ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.06)',
                    border: mode === m ? '1px solid rgba(56,189,248,0.6)' : '1px solid rgba(255,255,255,0.1)',
                    color: mode === m ? '#38bdf8' : '#ffffff60',
                  }}>
                  {m === 'Multiplayer' ? '👤 Multiplayer' : '🛡️ Team mode'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Timer */}
            <div>
              <p className="text-white/60 text-xs font-semibold mb-2">⏱ Time per question</p>
              <div className="flex flex-wrap gap-1.5">
                {TIMER_OPTIONS.map(t => (
                  <button key={t} onClick={() => setQuestionTime(t)}
                    className="px-2.5 py-1 rounded-lg text-xs font-black transition-all"
                    style={{
                      background: questionTime === t ? 'rgba(217,119,6,0.3)' : 'rgba(255,255,255,0.06)',
                      border: questionTime === t ? '1px solid rgba(217,119,6,0.6)' : '1px solid rgba(255,255,255,0.1)',
                      color: questionTime === t ? '#fbbf24' : '#ffffff60',
                    }}>
                    {t}s
                  </button>
                ))}
              </div>
            </div>
            {/* Rounds */}
            <div>
              <p className="text-white/60 text-xs font-semibold mb-2">🔢 Questions per round</p>
              <div className="flex flex-wrap gap-1.5">
                {ROUND_PRESETS.map(p => (
                  <button key={p.label}
                    onClick={() => { setRoundPreset(p.label); if (p.value) setRounds(p.value); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-black transition-all"
                    style={{
                      background: roundPreset === p.label ? `${p.border.replace('0.5)', '0.25)')}` : 'rgba(255,255,255,0.06)',
                      border: roundPreset === p.label ? `1px solid ${p.border}` : '1px solid rgba(255,255,255,0.1)',
                      color: roundPreset === p.label ? p.color : '#ffffff60',
                    }}>
                    {p.label}{p.value ? ` (${p.value})` : ''}
                  </button>
                ))}
              </div>
              {roundPreset === 'Custom' && (
                <input
                  type="number" min="1" max="100" placeholder="e.g. 15"
                  value={customRounds}
                  onChange={e => { setCustomRounds(e.target.value); const n = parseInt(e.target.value); if (n > 0) setRounds(n); }}
                  className="mt-2 w-full rounded-lg px-3 py-1.5 text-xs font-bold text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(167,139,250,0.4)' }}
                />
              )}
            </div>
          </div>
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
                {t === 'default' ? '📖 Default' : '📂 My Question sets'}
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
                onClick={() => onSelect({ testament: opt.id, setId: null, questionTime, rounds, mode })}
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

        {/* My Sets tab */}
        {tab === 'custom' && (
          <div className="space-y-3 mb-6">
            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAiGenerator && onAiGenerator()}
                className="py-3 rounded-2xl text-sm font-bold transition-all hover:brightness-110"
                style={{ background: 'rgba(217,119,6,0.15)', border: '1px dashed rgba(251,191,36,0.5)', color: '#fbbf24' }}
              >
                ✨ Generate with AI
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="py-3 rounded-2xl text-sm font-bold transition-all hover:brightness-110"
                style={{ background: 'rgba(124,58,237,0.15)', border: '1px dashed rgba(124,58,237,0.5)', color: '#a78bfa' }}
              >
                ＋ Upload New Set
              </button>
            </div>

            <div className="text-center py-2">
              <a 
                href="/Question_Upload_Guide.pdf" 
                download="Question Upload Guide.pdf"
                className="text-xs font-semibold underline underline-offset-2 transition-all hover:brightness-125 opacity-80 hover:opacity-100"
                style={{ color: '#93c5fd' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                📄 Download Question Upload Guide (PDF)
              </a>
            </div>

            {loading && <p className="text-white/40 text-sm text-center py-6">Loading sets...</p>}
            {!loading && sets.length === 0 && (
              <div className="text-center py-6">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-white/40 text-sm">No custom sets yet.</p>
                <p className="text-white/30 text-xs mt-1">Upload a set above to get started.</p>
              </div>
            )}
            {deleteErr && <p className="text-red-400 text-xs text-center">{deleteErr}</p>}

            {sets.map((set, i) => (
              <div
                key={set.id}
                className="rounded-2xl overflow-hidden animate-slide-up"
                style={{ border: '1px solid rgba(139,92,246,0.4)', animationDelay: `${i * 0.06}s` }}
              >
                {/* Clicking the card body prompts testament selection */}
                <button
                  onClick={() => onSelect({ testament: set.testament || 'both', setId: set.id, questionTime, rounds, mode })}
                  className="w-full px-5 py-4 text-left transition-all hover:brightness-110 flex items-center gap-4"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="text-3xl flex-shrink-0">📂</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-nunito font-black text-base text-purple-300 truncate">{set.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{set._count?.questions ?? 0} questions · {set.testament}</p>
                  </div>
                  <span className="text-white/20 text-lg">›</span>
                </button>
                <div className="flex border-t" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
                  <button
                    onClick={() => onEditSet(set.id)}
                    className="flex-1 py-2 text-xs font-bold text-purple-400 hover:bg-purple-500/10 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <div style={{ width: '1px', background: 'rgba(139,92,246,0.2)' }} />
                  <button
                    onClick={() => setConfirmTarget({ id: set.id, name: set.name, count: set._count?.questions ?? 0 })}
                    className="flex-1 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={onBack} className="w-full py-2.5 rounded-xl text-white/35 text-sm font-semibold hover:text-white/60 transition-colors">
          ← Back
        </button>
      </div>

      {/* Delete confirmation modal */}
      {confirmTarget && (
        <ConfirmModal
          title={`Delete "${confirmTarget.name}"?`}
          message={`This will permanently remove all ${confirmTarget.count} questions. This cannot be undone.`}
          confirmLabel={deleting ? 'Deleting...' : 'Delete'}
          onConfirm={handleDelete}
          onCancel={() => { setConfirmTarget(null); setDeleteErr(''); }}
        />
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadQuestions
          token={token}
          onClose={() => setShowUpload(false)}
          onImported={() => { setShowUpload(false); setTab('custom'); loadSets(); }}
          saveOnly
        />
      )}
    </div>
  );
}
