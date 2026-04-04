import { useState, useRef } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { getFriendlyError } from "../utils/errors";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const LABELS = ["A", "B", "C", "D"];
const DIFF_COLORS = {
  easy: "#4ade80",
  medium: "#fbbf24",
  hard: "#f97316",
  expert: "#f87171",
};

const AUDIENCES = ["General Church", "Gen Z", "Youth", "Adults", "Children"];
const TONES = ["Conversational", "Playful", "Energetic", "Formal", "Simple"];
const TESTAMENT_OPTS = [
  { id: "both", label: "Mixed", emoji: "📖" },
  { id: "Old Testament", label: "Old Testament", emoji: "📜" },
  { id: "New Testament", label: "New Testament", emoji: "✝️" },
];

function StepIndicator({ step }) {
  const steps = ["Content", "Settings", "Review", "Save"];
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all"
              style={{
                background:
                  i < step
                    ? "#7c3aed"
                    : i === step
                      ? "rgba(124,58,237,0.3)"
                      : "rgba(255,255,255,0.08)",
                border:
                  i === step
                    ? "2px solid #a78bfa"
                    : i < step
                      ? "2px solid #7c3aed"
                      : "2px solid rgba(255,255,255,0.1)",
                color: i <= step ? "#fff" : "#ffffff40",
              }}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className="text-xs mt-0.5"
              style={{ color: i === step ? "#a78bfa" : "#ffffff30" }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-6 h-px mb-4"
              style={{
                background: i < step ? "#7c3aed" : "rgba(255,255,255,0.1)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function QuestionReviewCard({
  q,
  idx,
  total,
  content,
  audience,
  tone,
  token,
  onUpdate,
  onRemove,
}) {
  const [expanded, setExpanded] = useState(false);
  const [regenerating, setRegen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const regen = async () => {
    setRegen(true);
    try {
      const res = await fetch(`${BACKEND}/api/ai/regenerate-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          audience,
          tone,
          existingQuestions: [],
          index: idx,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      onUpdate(idx, d.question);
    } catch (e) {
      console.error(e);
    } finally {
      setRegen(false);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="px-4 py-3 flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="text-white/25 text-xs font-bold w-6 flex-shrink-0 mt-0.5">
          {idx + 1}.
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-snug">
            {q.question}
          </p>
          {!expanded && (
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
              {q.options.map((opt, j) => (
                <span
                  key={j}
                  className="text-xs"
                  style={{
                    color: j === q.answer ? "#4ade80" : "#ffffff35",
                    fontWeight: j === q.answer ? 800 : 400,
                  }}
                >
                  {LABELS[j]}
                  {j === q.answer ? " ✓" : ""}: {opt}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              regen();
            }}
            disabled={regenerating}
            className="p-1.5 rounded-lg text-white/30 hover:text-amber-400 hover:bg-amber-500/10 transition-all text-sm disabled:opacity-40"
            title="Regenerate"
          >
            {regenerating ? "⏳" : "♻"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmRemove(true);
            }}
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
            title="Remove"
          >
            🗑
          </button>
          <span className="p-1.5 text-white/20 text-xs">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {expanded && (
        <div
          className="px-4 pb-3 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="space-y-1 mt-2">
            {q.options.map((opt, j) => (
              <div key={j} className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      j === q.answer ? "#4ade80" : "rgba(255,255,255,0.08)",
                    color: j === q.answer ? "#000" : "#ffffff50",
                  }}
                >
                  {LABELS[j]}
                </span>
                <span
                  className="text-sm"
                  style={{
                    color: j === q.answer ? "#4ade80" : "#ffffff70",
                    fontWeight: j === q.answer ? 700 : 400,
                  }}
                >
                  {opt} {j === q.answer ? "✓" : ""}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className="text-xs px-1.5 py-0.5 rounded-md"
              style={{
                background: "rgba(255,255,255,0.07)",
                color: "#ffffff50",
              }}
            >
              {q.category}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-md font-bold"
              style={{
                color: DIFF_COLORS[q.difficulty] || "#fff",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              {q.difficulty}
            </span>
            {q.scripture && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}
              >
                📖 {q.scripture}
              </span>
            )}
          </div>
        </div>
      )}

      {confirmRemove && (
        <ConfirmModal
          title={`Remove question ${idx + 1}?`}
          message="This question will be removed from the generated set."
          confirmLabel="Remove"
          onConfirm={() => {
            setConfirmRemove(false);
            onRemove(idx);
          }}
          onCancel={() => setConfirmRemove(false)}
        />
      )}
    </div>
  );
}

export default function AiQuizGenerator({ token, onBack, onSaved }) {
  const [step, setStep] = useState(0);

  // Step 0 — Content
  const [inputType, setInputType] = useState("notes"); // 'notes' | 'reference'
  const [content, setContent] = useState("");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const fileRef = useRef();

  // Step 1 — Settings
  const [audience, setAudience] = useState("General Church");
  const [tone, setTone] = useState("Conversational");
  const [customPrompt, setCustomPrompt] = useState("");
  const [count, setCount] = useState(10);
  const [testament, setTestament] = useState("both");

  // Step 2 — Review
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  // Step 3 — Save
  const [setName, setSetName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleFileUpload = async (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext)) {
      setGenError("Only PDF, DOCX, or TXT files for content.");
      return;
    }
    setFile(f);
    setFileLoading(true);
    setGenError("");
    try {
      const form = new FormData();
      form.append("file", f);
      const res = await fetch(`${BACKEND}/api/parse-questions`, {
        method: "POST",
        body: form,
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.rawText) {
        setContent(d.rawText);
      } else if (d.questions?.length) {
        setContent(
          d.questions
            .map(
              (q) =>
                `${q.question}\n${q.options.map((o, i) => `${LABELS[i]}: ${o}`).join("\n")}`,
            )
            .join("\n\n"),
        );
      }
    } catch (e) {
      setGenError("Could not extract text from file. Paste content manually.");
    } finally {
      setFileLoading(false);
    }
  };

  const generate = async () => {
    if (inputType === "notes" && !content.trim()) {
      setGenError("Please add some sermon notes or content first.");
      return;
    }
    if (inputType === "reference" && !reference.trim()) {
      setGenError("Please enter a Bible reference.");
      return;
    }

    setGenerating(true);
    setGenError("");
    try {
      const endpoint =
        inputType === "notes"
          ? "/api/ai/generate-quiz"
          : "/api/ai/generate-from-reference";
      const bodyPayload =
        inputType === "notes"
          ? { content, audience, tone, customPrompt, count, testament }
          : { reference, audience, tone, count };

      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Generation failed");

      if (inputType === "reference" && d.referenceText) {
        setContent(
          `Scripture Reference: ${d.resolvedReference}\n\n${d.referenceText}`,
        );
      }

      setQuestions(d.questions);
      setStep(2);
    } catch (e) {
      setGenError(getFriendlyError(e));
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdate = (idx, updated) => {
    setQuestions((qs) => {
      const copy = [...qs];
      copy[idx] = updated;
      return copy;
    });
  };

  const handleRemove = (idx) => {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  };

  const saveSet = async () => {
    if (!setName.trim()) {
      setSaveError("Please enter a name for this set.");
      return;
    }
    if (questions.length === 0) {
      setSaveError("No questions to save.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const setRes = await fetch(`${BACKEND}/api/sets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: setName.trim(), testament }),
      });
      const setData = await setRes.json();
      if (!setRes.ok) throw new Error(setData.error || "Failed to create set");
      const newSetId = setData.set.id;

      await Promise.all(
        questions.map((q) =>
          fetch(`${BACKEND}/api/sets/${newSetId}/questions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(q),
          }),
        ),
      );
      onSaved();
    } catch (e) {
      setSaveError(getFriendlyError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, #0d0e1a 0%, #111228 60%, #0d0e1a 100%)",
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{
          background: "rgba(13,14,26,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          onClick={onBack}
          className="text-white/40 hover:text-white/70 transition-colors text-sm font-bold"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1
            className="font-anton text-lg text-white"
            style={{ letterSpacing: "0.05em" }}
          >
            ✨ AI QUIZ GENERATOR
          </h1>
        </div>
        {step === 2 && (
          <span className="text-white/30 text-xs">
            {questions.length} questions
          </span>
        )}
      </div>

      <div className="flex-1 px-4 py-5 max-w-xl mx-auto w-full">
        <StepIndicator step={step} />

        {/* ── STEP 0: Content ── */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div
              className="flex gap-2 p-1 rounded-2xl mb-4"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <button
                onClick={() => setInputType("notes")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${inputType === "notes" ? "bg-purple-600 text-white" : "text-white/50"}`}
              >
                Paste Notes
              </button>
              <button
                onClick={() => setInputType("reference")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${inputType === "reference" ? "bg-purple-600 text-white" : "text-white/50"}`}
              >
                Bible Reference
              </button>
            </div>

            {inputType === "notes" ? (
              <>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your sermon notes, Bible study outline, or fellowship notes here...&#10;&#10;Example:&#10;Today's sermon focused on John 3:16 and the meaning of God's love for humanity. Key points: 1) God's love is unconditional, 2) Jesus came to save not to judge, 3) Eternal life is a gift..."
                  rows={10}
                  className="w-full rounded-2xl px-4 py-3 text-sm text-white resize-none outline-none leading-relaxed"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />

                <div className="text-center text-white/30 text-xs">
                  — or upload a file —
                </div>

                <div
                  onClick={() => fileRef.current.click()}
                  className="rounded-2xl border-dashed border-2 py-4 flex flex-col items-center cursor-pointer transition-all hover:brightness-110"
                  style={{
                    borderColor: "rgba(124,58,237,0.35)",
                    background: "rgba(124,58,237,0.05)",
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                  {fileLoading ? (
                    <p className="text-purple-300 text-sm">
                      Extracting text...
                    </p>
                  ) : (
                    <>
                      <p className="text-purple-400 font-bold text-sm">
                        {file
                          ? `✓ ${file.name}`
                          : "📄 Upload PDF, DOCX, or TXT"}
                      </p>
                      <p className="text-white/30 text-xs mt-0.5">
                        Text will be extracted automatically
                      </p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-white/60 text-sm text-center">
                  Generate questions directly from a Bible passage.
                </p>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. John 3:16-21, Psalm 23, Genesis 1"
                  className="w-full rounded-2xl px-4 py-3 text-sm text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            )}

            {genError && (
              <p className="text-red-400 text-sm text-center">⚠ {genError}</p>
            )}

            <button
              onClick={() => {
                if (inputType === "notes" && !content.trim()) {
                  setGenError("Please add content first.");
                  return;
                }
                if (inputType === "reference" && !reference.trim()) {
                  setGenError("Please add a reference first.");
                  return;
                }
                setGenError("");
                setStep(1);
              }}
              className="w-full py-3 rounded-2xl font-black text-white text-sm transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
              }}
            >
              Next: Settings →
            </button>
          </div>
        )}

        {/* ── STEP 1: Settings ── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                Audience
              </label>
              <div className="grid grid-cols-3 gap-2">
                {AUDIENCES.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAudience(a)}
                    className="py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background:
                        audience === a
                          ? "rgba(124,58,237,0.3)"
                          : "rgba(255,255,255,0.05)",
                      border:
                        audience === a
                          ? "1px solid rgba(167,139,250,0.6)"
                          : "1px solid rgba(255,255,255,0.08)",
                      color: audience === a ? "#a78bfa" : "#ffffff50",
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                Tone / Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className="py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background:
                        tone === t
                          ? "rgba(217,119,6,0.25)"
                          : "rgba(255,255,255,0.05)",
                      border:
                        tone === t
                          ? "1px solid rgba(251,191,36,0.5)"
                          : "1px solid rgba(255,255,255,0.08)",
                      color: tone === t ? "#fbbf24" : "#ffffff50",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                Question Count
              </label>
              <div className="flex gap-3">
                {[5, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all"
                    style={{
                      background:
                        count === n
                          ? "rgba(251,191,36,0.2)"
                          : "rgba(255,255,255,0.05)",
                      border:
                        count === n
                          ? "1px solid rgba(251,191,36,0.5)"
                          : "1px solid rgba(255,255,255,0.08)",
                      color: count === n ? "#fbbf24" : "#ffffff50",
                    }}
                  >
                    {n} Questions
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                Testament
              </label>
              <div className="flex gap-2">
                {TESTAMENT_OPTS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTestament(opt.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background:
                        testament === opt.id
                          ? "rgba(251,191,36,0.2)"
                          : "rgba(255,255,255,0.05)",
                      border:
                        testament === opt.id
                          ? "1px solid rgba(251,191,36,0.5)"
                          : "1px solid rgba(255,255,255,0.08)",
                      color: testament === opt.id ? "#fbbf24" : "#ffffff50",
                    }}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                Custom Instruction{" "}
                <span className="text-white/25 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <input
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Make it extra relatable for university students"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>

            {genError && (
              <p className="text-red-400 text-sm text-center">⚠ {genError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                ← Back
              </button>
              <button
                onClick={generate}
                disabled={generating}
                className="flex-1 py-3 rounded-2xl font-black text-white text-sm transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                }}
              >
                {generating ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    Generating with Gemini AI...
                  </>
                ) : (
                  "✨ Generate Quiz"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Review ── */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div
              className="mb-4 p-3 rounded-xl text-xs"
              style={{
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.25)",
              }}
            >
              <span className="text-purple-300 font-bold">
                ✨ {audience} · {tone}
              </span>
              <span className="text-white/30 ml-2">
                {count} questions generated
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {questions.map((q, i) => (
                <QuestionReviewCard
                  key={i}
                  q={q}
                  idx={i}
                  total={questions.length}
                  content={content}
                  audience={audience}
                  tone={tone}
                  token={token}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {questions.length === 0 && (
              <div className="text-center py-6">
                <p className="text-red-400 text-sm">All questions removed.</p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-2 text-purple-400 text-sm underline"
                >
                  Regenerate
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                ← Redo
              </button>
              <button
                onClick={() => {
                  if (questions.length > 0) setStep(3);
                }}
                disabled={questions.length === 0}
                className="flex-1 py-3 rounded-2xl font-black text-white text-sm transition-all hover:brightness-110 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #d97706, #b45309)",
                }}
              >
                Save Set ({questions.length} questions) →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Save ── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-2">
              <p className="text-5xl mb-2">🎉</p>
              <p className="text-white font-bold text-lg">
                {questions.length} questions ready!
              </p>
              <p className="text-white/40 text-sm mt-1">
                Give this set a name to save it to your library
              </p>
            </div>

            <div>
              <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                Set Name
              </label>
              <input
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                placeholder="e.g. Sunday Sermon — John 3:16"
                className="w-full rounded-xl px-4 py-3 text-white font-semibold outline-none text-sm"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && saveSet()}
              />
            </div>

            <div
              className="rounded-xl p-3 text-xs"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex justify-between text-white/40 mb-1">
                <span>Questions</span>
                <span className="text-white/70 font-bold">
                  {questions.length}
                </span>
              </div>
              <div className="flex justify-between text-white/40 mb-1">
                <span>Audience</span>
                <span className="text-white/70 font-bold">{audience}</span>
              </div>
              <div className="flex justify-between text-white/40 mb-1">
                <span>Tone</span>
                <span className="text-white/70 font-bold">{tone}</span>
              </div>
              <div className="flex justify-between text-white/40">
                <span>Testament</span>
                <span className="text-white/70 font-bold">{testament}</span>
              </div>
            </div>

            {saveError && (
              <p className="text-red-400 text-sm text-center">⚠ {saveError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                ← Back
              </button>
              <button
                onClick={saveSet}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl font-black text-white text-sm transition-all hover:brightness-110 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #059669, #047857)",
                  boxShadow: "0 6px 20px rgba(5,150,105,0.35)",
                }}
              >
                {saving ? "⏳ Saving..." : "✅ Save to My Sets"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
