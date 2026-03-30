import { useState, useEffect } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const LABEL_CONFIG = {
  well_understood:  { icon: '✅', text: 'Well understood',    color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  bar: '#4ade80' },
  partly_understood:{ icon: '🟡', text: 'Partly understood',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', bar: '#fbbf24' },
  needs_followup:   { icon: '🔴', text: 'Needs follow-up',    color: '#f87171', bg: 'rgba(248,113,113,0.1)', bar: '#f87171' },
};

function AccuracyBar({ pct, label }) {
  const cfg = LABEL_CONFIG[label] || LABEL_CONFIG.partly_understood;
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.icon} {cfg.text}</span>
        <span className="text-xs font-black" style={{ color: cfg.color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg.bar }} />
      </div>
    </div>
  );
}

export default function SessionReport({ gameId, token, onBack }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${BACKEND}/api/games/${gameId}/report`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.report) setReport(d.report);
        else setError(d.error || 'Could not load report.');
      })
      .catch(() => setError('Failed to load report.'))
      .finally(() => setLoading(false));
  }, [gameId, token]);

  const data = report?.data;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0d0e1a 0%, #111228 60%, #0d0e1a 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(13,14,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
        <button onClick={onBack} className="text-white/40 hover:text-white/70 transition-colors text-sm font-bold">← Back</button>
        <div className="flex-1">
          <h1 className="font-anton text-lg text-white" style={{ letterSpacing: '0.04em' }}>📊 UNDERSTANDING REPORT</h1>
          {data && <p className="text-white/35 text-xs">{data.setName}</p>}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 max-w-xl mx-auto w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-4xl animate-spin mb-3">⏳</div>
            <p className="text-white/40 text-sm">Generating AI report...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-4 animate-fade-in">

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Players', value: data.totalPlayers, icon: '👥' },
                { label: 'Accuracy', value: `${data.overallAccuracy}%`, icon: '🎯' },
                { label: 'Avg Score', value: data.avgScore?.toLocaleString(), icon: '⭐' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-xl mb-1">{s.icon}</div>
                  <p className="font-nunito font-black text-white text-lg leading-none">{s.value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* AI Summary */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">✨ AI Summary</p>
              <p className="text-white/80 text-sm leading-relaxed">{report.summary}</p>
            </div>

            {/* Highlights */}
            {(data.best || data.worst) && (
              <div className="grid grid-cols-2 gap-3">
                {data.best && (
                  <div className="rounded-2xl p-3" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                    <p className="text-green-400 text-xs font-bold mb-1">✅ Strongest</p>
                    <p className="text-white text-xs leading-snug line-clamp-2">{data.best.question}</p>
                    <p className="text-green-400 font-black text-sm mt-1">{data.best.pct}% correct</p>
                  </div>
                )}
                {data.worst && (
                  <div className="rounded-2xl p-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <p className="text-red-400 text-xs font-bold mb-1">🔴 Needs Follow-up</p>
                    <p className="text-white text-xs leading-snug line-clamp-2">{data.worst.question}</p>
                    <p className="text-red-400 font-black text-sm mt-1">{data.worst.pct}% correct</p>
                  </div>
                )}
              </div>
            )}

            {/* Per-question breakdown */}
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Question Breakdown</p>
              <div className="space-y-3">
                {(data.questions || []).map((q, i) => {
                  const cfg = LABEL_CONFIG[q.label] || LABEL_CONFIG.partly_understood;
                  return (
                    <div key={i} className="rounded-2xl p-4"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-white/30 text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                        <p className="text-white text-sm font-semibold leading-snug flex-1">{q.question}</p>
                      </div>
                      <p className="text-xs ml-4 mb-2" style={{ color: '#4ade80' }}>
                        ✓ Correct answer: {q.correctAnswer}
                      </p>
                      {q.scripture && (
                        <p className="text-xs ml-4 mb-2" style={{ color: '#fbbf24' }}>📖 {q.scripture}</p>
                      )}
                      <div className="ml-4">
                        <AccuracyBar pct={q.pct} label={q.label} />
                        <div className="flex gap-4 mt-1.5">
                          <span className="text-white/30 text-xs">{q.correct}/{q.total} answered correctly</span>
                          {q.avgTimeSec > 0 && <span className="text-white/30 text-xs">avg {q.avgTimeSec}s</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Follow-up list */}
            {(data.questions || []).some(q => q.label === 'needs_followup') && (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">🔁 Topics to Revisit</p>
                <ul className="space-y-1">
                  {(data.questions || []).filter(q => q.label === 'needs_followup').map((q, i) => (
                    <li key={i} className="text-white/70 text-xs flex items-start gap-1.5">
                      <span className="text-red-400 flex-shrink-0">•</span>
                      {q.question}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-white/20 text-xs text-center pb-4">
              Report generated {report.createdAt ? new Date(report.createdAt).toLocaleString() : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
