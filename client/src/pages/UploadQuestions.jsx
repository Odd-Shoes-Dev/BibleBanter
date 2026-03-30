import { useState, useRef } from 'react';
import { socket } from '../socket';

const TESTAMENT_OPTS = [
  { id: 'Old Testament', label: 'Old Testament', emoji: '📜' },
  { id: 'New Testament', label: 'New Testament', emoji: '✝️' },
  { id: 'both', label: 'Mixed (Both)', emoji: '📖' },
];

export default function UploadQuestions({ onClose, onImported, token, saveOnly = false }) {
  const [file, setFile] = useState(null);
  const [setName, setSetName] = useState('');
  const [testament, setTestament] = useState('both');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState('');
  const inputRef = useRef();

  const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const handleFile = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'pdf', 'docx'].includes(ext)) {
      setError('Only CSV, PDF, or DOCX files are supported.');
      return;
    }
    setFile(f);
    setError('');
    setPreview(null);
    setSuccess('');
    setLoading(true);

    try {
      const form = new FormData();
      form.append('file', f);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BACKEND}/api/parse-questions`, { method: 'POST', body: form, headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parse failed');
      setPreview(data.questions);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!preview?.length) return;
    if (saveOnly && !setName.trim()) { setError('Please enter a name for this set.'); return; }
    setImporting(true); setError('');
    try {
      if (token && setName.trim()) {
        const form = new FormData();
        form.append('file', file);
        form.append('setName', setName.trim());
        form.append('testament', testament);
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch(`${BACKEND}/api/parse-questions`, { method: 'POST', body: form, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save.');
        if (!data.savedSetId) throw new Error('Set was not saved — please log in again and retry.');
        setSuccess(`✅ "${setName.trim()}" saved with ${data.count} questions!`);
        setTimeout(() => { onImported(data.savedSetId); onClose(); }, 1400);
        return;
      }
      if (saveOnly) { setError('You must be logged in to save a set.'); setImporting(false); return; }
      // In-game: push via socket
      socket.emit('set-questions', preview, ({ success: ok, count }) => {
        if (ok) {
          setSuccess(`✅ ${count} questions imported!`);
          setTimeout(() => { onImported(count); onClose(); }, 1200);
        } else {
          setError('Failed to import questions.');
        }
        setImporting(false);
      });
    } catch (e) {
      setError(e.message);
      setImporting(false);
    }
  };

  const diffColor = (d) => {
    if (d === 'easy') return '#4ade80';
    if (d === 'medium') return '#fbbf24';
    if (d === 'hard') return '#f87171';
    return '#c084fc';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden animate-bounce-in"
        style={{ background: '#151626', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h2 className="font-anton text-xl text-white" style={{ letterSpacing: '0.04em' }}>UPLOAD QUESTIONS</h2>
            <p className="text-white/40 text-xs mt-0.5">CSV · PDF · Word (.docx)</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${BACKEND}/api/question-template.csv`}
              download
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
            >
              ⬇ Template
            </a>
            <button onClick={onClose} className="text-white/40 hover:text-white text-xl transition-colors">✕</button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Set name + testament (authenticated hosts only) */}
          {token && (
            <div className="space-y-3">
              <div>
                <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Set Name {saveOnly && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="text"
                  value={setName}
                  onChange={e => setSetName(e.target.value)}
                  placeholder="e.g. Youth Group Set 1"
                  className="w-full px-4 py-2.5 rounded-xl text-white font-semibold outline-none text-sm"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5">Testament / Category</label>
                <div className="flex gap-2">
                  {TESTAMENT_OPTS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTestament(opt.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: testament === opt.id ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)',
                        border: testament === opt.id ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color: testament === opt.id ? '#fbbf24' : '#ffffff50',
                      }}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current.click()}
            className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-8 cursor-pointer transition-all hover:brightness-110"
            style={{ borderColor: file ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.15)', background: file ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.03)' }}
          >
            <input ref={inputRef} type="file" accept=".csv,.pdf,.docx" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            {loading ? (
              <>
                <div className="text-3xl animate-spin mb-2">⏳</div>
                <p className="text-white/50 text-sm">Parsing file...</p>
              </>
            ) : file ? (
              <>
                <div className="text-3xl mb-2">📄</div>
                <p className="text-amber-300 font-bold text-sm">{file.name}</p>
                <p className="text-white/30 text-xs mt-1">Click to change file</p>
              </>
            ) : (
              <>
                <div className="text-3xl mb-2">📂</div>
                <p className="text-white/60 font-semibold text-sm">Drop file here or click to browse</p>
                <p className="text-white/30 text-xs mt-1">CSV · PDF · Word (.docx) — max 10 MB</p>
              </>
            )}
          </div>

          {/* Format hint */}
          {!preview && !error && (
            <div className="rounded-xl px-4 py-3 text-xs text-white/40 leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-bold text-white/50 mb-1">PDF / Word format (one block per question):</p>
              <pre className="font-mono text-xs whitespace-pre-wrap">{`Q: Who built the ark?\nA: Moses\nB: Noah\nC: Abraham\nD: David\nAnswer: B\nCategory: Old Testament\nDifficulty: easy\nScripture: Genesis 6:14 — 'So make yourself an ark of cypress wood.'`}</pre>
              <p className="mt-1.5 text-amber-400/70 text-xs">📖 <strong>Scripture is required</strong> — it shows to players after the answer is revealed.</p>
              <p className="mt-2">For CSV, download the template ↑ to see the required columns.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-semibold animate-bounce-in"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-xl px-4 py-3 text-sm font-semibold animate-bounce-in text-center"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#86efac' }}>
              {success}
            </div>
          )}

          {/* Preview table */}
          {preview && preview.length > 0 && (
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                Preview — {preview.length} question{preview.length !== 1 ? 's' : ''} found
              </p>
              <div className="space-y-2">
                {preview.slice(0, 20).map((q, i) => (
                  <div key={i} className="rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start gap-2">
                      <span className="text-white/30 text-xs font-bold w-5 flex-shrink-0 mt-0.5">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm leading-snug">{q.question}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          {q.options.filter(Boolean).map((opt, j) => (
                            <span key={j} className={`text-xs ${j === q.answer ? 'font-black' : 'text-white/40'}`}
                              style={{ color: j === q.answer ? '#4ade80' : undefined }}>
                              {['A','B','C','D'][j]}{j === q.answer ? ' ✓' : ''}: {opt}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff60' }}>{q.category}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                            style={{ color: diffColor(q.difficulty), background: 'rgba(255,255,255,0.06)' }}>{q.difficulty}</span>
                          {q.scripture
                            ? <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>📖 {q.scripture}</span>
                            : <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>⚠ No scripture</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {preview.length > 20 && (
                  <p className="text-white/30 text-xs text-center">... and {preview.length - 20} more</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {preview && preview.length > 0 && (
          <div className="px-6 py-4 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full py-3 rounded-2xl font-black text-lg text-white font-nunito transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', boxShadow: '0 6px 24px rgba(217,119,6,0.4)' }}
            >
              {importing ? '⏳ Importing...' : `⚔️ Use These ${preview.length} Questions`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
