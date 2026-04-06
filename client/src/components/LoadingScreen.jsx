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
      <span className="text-[8rem] sm:text-[10rem] font-bold font-serif text-[#FFB830] leading-none">
        B
      </span>
      <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">
        Bible Banter
      </h1>
      <p className="mt-1 text-base sm:text-lg text-slate-400">
        Live Bible Trivia
      </p>
    </div>
  );
}
