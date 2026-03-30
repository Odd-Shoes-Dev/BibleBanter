import { useState, useEffect } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function ReportsPage({ token, onBack, onViewReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${BACKEND}/api/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setReports(d.reports || []); })
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setLoading(false));
  }, [token]);

  const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const accuracy = (r) => {
    const d = r.data;
    return typeof d?.overallAccuracy === 'number' ? `${d.overallAccuracy}%` : '—';
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0d0e1a 0%, #111228 60%, #0d0e1a 100%)' }}>
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(13,14,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
        <button onClick={onBack} className="text-white/40 hover:text-white/70 transition-colors text-sm font-bold">← Back</button>
        <h1 className="font-anton text-lg text-white flex-1" style={{ letterSpacing: '0.04em' }}>📋 REPORT HISTORY</h1>
        <span className="text-white/30 text-xs">{reports.length} sessions</span>
      </div>

      <div className="flex-1 px-4 py-5 max-w-xl mx-auto w-full">
        {loading && <p className="text-white/40 text-sm text-center py-12">Loading reports...</p>}
        {error && <p className="text-red-400 text-sm text-center py-12">{error}</p>}

        {!loading && reports.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📊</p>
            <p className="text-white/40 text-sm">No reports yet.</p>
            <p className="text-white/25 text-xs mt-1">Reports are generated automatically after each game ends.</p>
          </div>
        )}

        <div className="space-y-3">
          {reports.map((r, i) => {
            const d = r.data;
            return (
              <button
                key={r.id}
                onClick={() => onViewReport(r.gameId)}
                className="w-full rounded-2xl px-4 py-4 text-left transition-all hover:brightness-110 animate-slide-up"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
                    📊
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{r.game?.set?.name || 'Unnamed Set'}</p>
                    <p className="text-white/40 text-xs mt-0.5">{fmt(r.game?.finishedAt || r.createdAt)}</p>
                    <div className="flex gap-3 mt-1.5">
                      <span className="text-xs" style={{ color: '#a78bfa' }}>👥 {r.game?._count?.players ?? d?.totalPlayers ?? 0} players</span>
                      <span className="text-xs" style={{ color: '#4ade80' }}>🎯 {accuracy(r)} accuracy</span>
                    </div>
                  </div>
                  <span className="text-white/20 text-lg flex-shrink-0">›</span>
                </div>
                {r.summary && (
                  <p className="text-white/35 text-xs mt-2 ml-13 line-clamp-2 leading-relaxed pl-13" style={{ paddingLeft: '52px' }}>
                    {r.summary.slice(0, 120)}{r.summary.length > 120 ? '...' : ''}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
