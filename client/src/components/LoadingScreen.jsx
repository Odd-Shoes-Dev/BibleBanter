import { useState, useEffect } from 'react';

export default function LoadingScreen({ onFinished }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1500);
    const remove = setTimeout(() => onFinished(), 2000);
    return () => { clearTimeout(timer); clearTimeout(remove); };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1a2744] transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      <div className="relative">
        <span
          className="text-[8rem] sm:text-[10rem] font-bold font-serif leading-none inline-block"
          style={{
            background: 'linear-gradient(105deg, #E89B00 0%, #FFB830 35%, #FFF2C0 50%, #FFB830 65%, #E89B00 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 2.5s ease-in-out infinite',
          }}
        >
          B
        </span>
        <svg className="absolute -top-2 -right-4 w-10 h-10" viewBox="0 0 40 40" fill="white"
          style={{ animation: 'sparkle 1.5s ease-in-out infinite' }}>
          <polygon points="20,2 23,15 36,18 23,21 20,34 17,21 4,18 17,15" />
        </svg>
        <svg className="absolute top-4 -right-10 w-5 h-5" viewBox="0 0 40 40" fill="white"
          style={{ animation: 'sparkle 1.5s ease-in-out infinite 0.4s' }}>
          <polygon points="20,2 23,15 36,18 23,21 20,34 17,21 4,18 17,15" />
        </svg>
        <svg className="absolute -top-6 right-6 w-3 h-3" viewBox="0 0 40 40" fill="white"
          style={{ animation: 'sparkle 1.5s ease-in-out infinite 0.8s' }}>
          <polygon points="20,2 23,15 36,18 23,21 20,34 17,21 4,18 17,15" />
        </svg>
      </div>

      <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">
        Bible Banter
      </h1>
      <p className="mt-1 text-base sm:text-lg text-slate-400">
        Live Bible Trivia
      </p>
    </div>
  );
}
