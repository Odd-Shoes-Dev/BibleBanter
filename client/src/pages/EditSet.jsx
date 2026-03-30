import { useState, useEffect } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const LABELS = ['A', 'B', 'C', 'D'];
const DIFF_COLORS = { easy: '#4ade80', medium: '#fbbf24', hard: '#f97316', expert: '#f87171' };

const BLANK_Q = { question: '', options: ['', '', '', ''], answer: 0, category: 'General', difficulty: 'medium', scripture: '' };

function QuestionCard({ q, idx, token, setId, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startEdit = () => { setDraft({ ...q, options: [...q.options] }); setEditing(true); setErr(''); };
  const cancel = () => { setEditing(false); setDraft(null); setErr(''); };

  const setOpt = (i, v) => setDraft(d => { const opts = [...d.options]; opts[i] = v; return { ...d, options: opts }; });

  const save = async () => {
    if (!draft.question.trim()) return setErr('Question text is required.');
    if (draft.options.slice(0, 2).some(o => !o.trim())) return setErr('At least options A and B are required.');
    setSaving(true); setErr('');
    try {
      const url = q.id ? `${BACKEND}/api/questions/${q.id}` : `${BACKEND}/api/sets/${setId}/questions`;
      const method = q.id ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      onSaved(data.question);
      setEditing(false); setDraft(null);
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const del = async () => {
    if (!q.id) { onDeleted(null); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND}/api/questions/${q.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      onDeleted(q.id);
    } catch (e) { setErr(e.message); setSaving(false); }
  };

  if (editing && draft) {
    return (
      <div className="rounded-2xl p-4 animate-fade-in" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.4)' }}>
        <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-3">Editing #{idx + 1}</p>

        <textarea value={draft.question} onChange={e => setDraft(d => ({ ...d, question: e.target.value }))}
          placeholder="Question text..."
          rows={2}
          className="w-full rounded-xl px-3 py-2 text-sm text-white resize-none outline-none mb-3"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }} />

        <div className="grid grid-cols-1 gap-2 mb-3">
          {[0,1,2,3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => setDraft(d => ({ ...d, answer: i }))}
                className="w-7 h-7 rounded-full flex-shrink-0 text-xs font-black transition-all"
                style={{
                  background: draft.answer === i ? '#4ade80' : 'rgba(255,255,255,0.08)',
                  color: draft.answer === i ? '#000' : '#ffffff60',
                  border: draft.answer === i ? 'none' : '1px solid rgba(255,255,255,0.15)',
                }}>{LABELS[i]}</button>
              <input value={draft.options[i]} onChange={e => setOpt(i, e.target.value)}
                placeholder={`Option ${LABELS[i]}${i < 2 ? ' (required)' : ' (optional)'}`}
                className="flex-1 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: draft.answer === i ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          ))}
        </div>
        <p className="text-white/30 text-xs mb-3">Click a letter button to set the correct answer (highlighted green)</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <input value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
            placeholder="Category"
            className="rounded-lg px-3 py-1.5 text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <select value={draft.difficulty} onChange={e => setDraft(d => ({ ...d, difficulty: e.target.value }))}
            className="rounded-lg px-3 py-1.5 text-sm text-white outline-none"
            style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            {['easy','medium','hard','expert'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <input value={draft.scripture} onChange={e => setDraft(d => ({ ...d, scripture: e.target.value }))}
          placeholder="📖 Scripture reference (e.g. John 3:16 — 'For God so loved...')"
          className="w-full rounded-lg px-3 py-1.5 text-sm text-white outline-none mb-3"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(251,191,36,0.25)' }} />

        {err && <p className="text-red-400 text-xs mb-2">⚠ {err}</p>}

        <div className="flex gap-2">
          <button onClick={save} disabled={saving}
            className="flex-1 py-2 rounded-xl text-sm font-black text-white disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
            {saving ? 'Saving...' : '✓ Save'}
          </button>
          <button onClick={cancel} className="px-4 py-2 rounded-xl text-sm font-bold text-white/50 hover:text-white/80 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl px-4 py-3 flex items-start gap-3 group" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span className="text-white/25 text-xs font-bold w-6 flex-shrink-0 mt-0.5">{idx + 1}.</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold leading-snug">{q.question}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {(q.options || []).map((opt, j) => opt ? (
            <span key={j} className="text-xs" style={{ color: j === q.answer ? '#4ade80' : '#ffffff40', fontWeight: j === q.answer ? 800 : 400 }}>
              {LABELS[j]}{j === q.answer ? ' ✓' : ''}: {opt}
            </span>
          ) : null)}
        </div>
        <div className="flex flex-wrap gap-2 mt-1.5">
          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.07)', color: '#ffffff50' }}>{q.category}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md font-bold" style={{ color: DIFF_COLORS[q.difficulty] || '#fff', background: 'rgba(255,255,255,0.05)' }}>{q.difficulty}</span>
          {q.scripture
            ? <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>📖 {q.scripture}</span>
            : <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>⚠ No scripture</span>}
        </div>
        {err && <p className="text-red-400 text-xs mt-1">⚠ {err}</p>}
      </div>
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={startEdit} className="p-1.5 rounded-lg text-white/40 hover:text-purple-300 hover:bg-purple-500/15 transition-all" title="Edit">✏️</button>
        <button onClick={() => q.id ? setConfirmDelete(true) : onDeleted(null)} disabled={saving} className="p-1.5 rounded-lg text-white/40 hover:text-red-300 hover:bg-red-500/15 transition-all" title="Delete">🗑</button>
      </div>
      {confirmDelete && (
        <ConfirmModal
          title={`Delete question ${idx + 1}?`}
          message="This question will be permanently removed from the set."
          confirmLabel="Delete"
          onConfirm={() => { setConfirmDelete(false); del(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

export default function EditSet({ setId, token, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [setName, setSetName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND}/api/sets/${setId}/questions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setQuestions(d.questions || []); setSetName(d.setName || ''); })
      .catch(() => setErr('Failed to load questions.'))
      .finally(() => setLoading(false));
  }, [setId, token]);

  const handleSaved = (updated) => {
    setQuestions(qs => {
      const idx = qs.findIndex(q => q.id === updated.id);
      if (idx >= 0) { const copy = [...qs]; copy[idx] = updated; return copy; }
      return [...qs, updated];
    });
    setAddingNew(false);
  };

  const handleDeleted = (id) => {
    if (id) setQuestions(qs => qs.filter(q => q.id !== id));
    else setAddingNew(false);
  };

  const saveName = async () => {
    if (!nameDraft.trim()) return;
    try {
      const res = await fetch(`${BACKEND}/api/sets/${setId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: nameDraft.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setSetName(nameDraft.trim());
      setEditingName(false);
    } catch (e) { setErr(e.message); }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0d0e1a 0%, #111228 60%, #0d0e1a 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(13,14,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
        <button onClick={onBack} className="text-white/40 hover:text-white/70 transition-colors text-sm font-bold">← Back</button>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input value={nameDraft} onChange={e => setNameDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="flex-1 rounded-lg px-3 py-1 text-sm text-white outline-none font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(124,58,237,0.5)' }}
                autoFocus />
              <button onClick={saveName} className="text-green-400 text-xs font-black px-2 py-1 rounded-lg hover:bg-green-500/15">Save</button>
              <button onClick={() => setEditingName(false)} className="text-white/40 text-xs px-2 py-1 rounded-lg hover:bg-white/08">✕</button>
            </div>
          ) : (
            <button onClick={() => { setNameDraft(setName); setEditingName(true); }}
              className="flex items-center gap-2 group">
              <span className="font-nunito font-black text-white truncate">{setName}</span>
              <span className="text-white/20 text-xs group-hover:text-purple-400 transition-colors">✏️</span>
            </button>
          )}
        </div>
        <span className="text-white/30 text-xs flex-shrink-0">{questions.length} questions</span>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-4 max-w-xl mx-auto w-full">
        {loading && <p className="text-white/40 text-sm text-center py-10">Loading...</p>}
        {err && <p className="text-red-400 text-sm text-center py-4">⚠ {err}</p>}

        <div className="space-y-2">
          {questions.map((q, i) => (
            <QuestionCard key={q.id} q={q} idx={i} token={token} setId={setId} onSaved={handleSaved} onDeleted={handleDeleted} />
          ))}
        </div>

        {/* Add new question */}
        {addingNew ? (
          <div className="mt-3">
            <QuestionCard q={{ ...BLANK_Q }} idx={questions.length} token={token} setId={setId} onSaved={handleSaved} onDeleted={handleDeleted} />
          </div>
        ) : (
          <button onClick={() => setAddingNew(true)}
            className="w-full mt-4 py-3 rounded-2xl text-sm font-bold text-purple-300 hover:brightness-110 transition-all"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px dashed rgba(124,58,237,0.4)' }}>
            + Add Question
          </button>
        )}
      </div>
    </div>
  );
}
