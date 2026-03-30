import { THEMES, saveTheme } from '../utils/themes';

export default function ThemePicker({ current, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-5 animate-slide-up"
        style={{ background: '#151625', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-nunito font-black text-lg text-white">🎨 Choose Theme</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-xl leading-none">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(theme => {
            const active = current === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  if (!theme.free) return;
                  saveTheme(theme.id);
                  onSelect(theme);
                }}
                className="relative rounded-2xl p-3 text-left transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: theme.bg,
                  border: active ? `2px solid ${theme.accent}` : '2px solid rgba(255,255,255,0.08)',
                  boxShadow: active ? `0 0 16px ${theme.accent}55` : 'none',
                  opacity: theme.free ? 1 : 0.7,
                  cursor: theme.free ? 'pointer' : 'default',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{theme.emoji}</span>
                  <span className="font-nunito font-black text-sm text-white">{theme.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: theme.accent }} />
                  {theme.free ? (
                    active && <span className="text-xs font-bold" style={{ color: theme.accent }}>Active</span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">🔒 Premium</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-white/25 text-xs text-center mt-4">Premium themes coming soon</p>
      </div>
    </div>
  );
}
