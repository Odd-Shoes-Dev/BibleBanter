import { QRCodeSVG } from 'qrcode.react';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #7c3aed, #5b21b6)',
  'linear-gradient(135deg, #d97706, #b45309)',
  'linear-gradient(135deg, #dc2626, #991b1b)',
  'linear-gradient(135deg, #2563eb, #1d4ed8)',
  'linear-gradient(135deg, #059669, #047857)',
  'linear-gradient(135deg, #db2777, #be185d)',
  'linear-gradient(135deg, #0891b2, #0e7490)',
  'linear-gradient(135deg, #65a30d, #4d7c0f)',
];

export default function HostLobby({ pin, players, onStart }) {
  const joinUrl = `${window.location.origin}/?pin=${pin}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0918' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <img src="/kampus-logo.jpeg" alt="logo" className="w-8 h-8 object-contain" />
          <span className="font-cinzel font-black text-base gradient-text tracking-wider">BIBLE BATTLE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span className="text-white/50">PIN: </span>
            <span className="text-amber-300 font-black tracking-wider">{pin}</span>
          </div>
          <div className="px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5"
            style={{ background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.4)' }}>
            <span className="text-purple-300">👥</span>
            <span className="text-purple-200 font-black">{players.length} players</span>
          </div>
        </div>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 gap-6">

        {players.length === 0 ? (
          <>
            {/* Waiting animation */}
            <div className="flex gap-2 mb-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-purple-400/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
            <h2 className="font-nunito font-black text-3xl md:text-4xl lg:text-5xl text-white text-center">
              Waiting for Players...
            </h2>
            <p className="text-white/50 text-base md:text-lg text-center">
              Share the PIN <span className="text-amber-300 font-black text-2xl md:text-3xl tracking-widest">{pin}</span> with your players
            </p>
            <p className="text-white/30 text-sm md:text-base">
              Join at <span className="text-purple-300">{window.location.origin}</span>
            </p>

            {/* QR code */}
            <div className="rounded-2xl p-4 flex flex-col items-center gap-3 animate-fade-in"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="rounded-xl p-3 bg-white">
                <QRCodeSVG
                  value={joinUrl}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#0d0918"
                  level="M"
                />
              </div>
              <p className="text-white/40 text-xs text-center">Scan to join instantly</p>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-nunito font-black text-2xl md:text-3xl text-white text-center">
              {players.length} Player{players.length !== 1 ? 's' : ''} Ready!
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 md:gap-4 w-full max-w-4xl">
              {players.map((p, i) => (
                <div key={p.id} className="flex flex-col items-center gap-1.5 animate-bounce-in"
                  style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-black text-white shadow-lg"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="text-white/70 text-xs font-semibold truncate w-full text-center">{p.name}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={players.length === 0}
          className="mt-2 px-10 py-3.5 md:px-16 md:py-4 rounded-2xl font-black text-lg md:text-xl text-white transition-all duration-300 hover:scale-[1.03] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed font-nunito"
          style={{
            background: players.length > 0
              ? 'linear-gradient(135deg, #d97706, #b45309)'
              : 'rgba(100,100,100,0.3)',
            boxShadow: players.length > 0
              ? '0 8px 30px rgba(217,119,6,0.5)'
              : 'none',
          }}
        >
          🚀 Start Game ({players.length} players)
        </button>
      </div>
    </div>
  );
}
