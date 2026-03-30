export default function ConfirmModal({ title, message, confirmLabel = 'Delete', confirmDanger = true, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 animate-bounce-in" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        <p className="font-nunito font-black text-white text-lg mb-2">{title}</p>
        <p className="text-white/50 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white/90 transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:brightness-110"
            style={{
              background: confirmDanger ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              boxShadow: confirmDanger ? '0 4px 20px rgba(220,38,38,0.4)' : '0 4px 20px rgba(124,58,237,0.4)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
