export default function HostSetup({ onSelect, onBack }) {
  const options = [
    {
      id: 'Old Testament',
      label: 'Old Testament',
      emoji: '📜',
      desc: 'Genesis to Malachi — Law, History, Poetry & Prophets',
      color: '#d97706',
      glow: 'rgba(217,119,6,0.35)',
      border: 'rgba(217,119,6,0.4)',
    },
    {
      id: 'New Testament',
      label: 'New Testament',
      emoji: '✝️',
      desc: 'Matthew to Revelation — Gospels, Acts & Epistles',
      color: '#3b82f6',
      glow: 'rgba(59,130,246,0.35)',
      border: 'rgba(59,130,246,0.4)',
    },
    {
      id: 'both',
      label: 'Mixed (Both)',
      emoji: '📖',
      desc: 'Questions from the entire Bible — Old & New Testament',
      color: '#8b5cf6',
      glow: 'rgba(139,92,246,0.35)',
      border: 'rgba(139,92,246,0.4)',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(180deg, #0d0e1a 0%, #111228 60%, #0d0e1a 100%)' }}>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-4xl mb-3">⚔️</div>
          <h1 className="font-anton text-3xl mb-2" style={{ color: '#f5a623', letterSpacing: '0.04em' }}>
            CHOOSE CATEGORY
          </h1>
          <p className="text-white/40 text-sm">Select which part of the Bible to battle with</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {options.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className="w-full rounded-2xl px-5 py-4 text-left transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] animate-slide-up flex items-center gap-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${opt.border}`,
                boxShadow: `0 4px 20px ${opt.glow}`,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <span className="text-3xl flex-shrink-0">{opt.emoji}</span>
              <div className="flex-1">
                <p className="font-nunito font-black text-base" style={{ color: opt.color }}>{opt.label}</p>
                <p className="text-white/40 text-xs mt-0.5 leading-snug">{opt.desc}</p>
              </div>
              <span className="text-white/20 text-lg">›</span>
            </button>
          ))}
        </div>

        {/* Back */}
        <button
          onClick={onBack}
          className="w-full py-2.5 rounded-xl text-white/35 text-sm font-semibold hover:text-white/60 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
