import { useState, useEffect, useRef } from 'react';

export default function Timer({ duration, onTimeUp, paused, questionIndex, hostMode = false }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setTimeLeft(duration);
    startTimeRef.current = Date.now();
  }, [questionIndex, duration]);

  useEffect(() => {
    if (paused) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        onTimeUp?.();
      }
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [paused, questionIndex, duration, onTimeUp]);

  const percent = (timeLeft / duration) * 100;
  const isUrgent = timeLeft <= 5;
  const isMid = timeLeft <= 10;

  const barColor = isUrgent
    ? 'from-red-500 to-red-600'
    : isMid
    ? 'from-amber-400 to-orange-500'
    : 'from-green-400 to-emerald-500';

  const textColor = isUrgent ? 'text-red-400' : isMid ? 'text-amber-400' : 'text-green-400';

  if (hostMode) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/40 text-sm font-semibold uppercase tracking-wider">Time Remaining</span>
          <span className={`font-nunito text-5xl font-black ${textColor} transition-colors ${isUrgent ? 'animate-pulse' : ''}`}
            style={isUrgent ? { textShadow: '0 0 20px rgba(239,68,68,0.8)' } : {}}>
            {Math.ceil(timeLeft)}s
          </span>
        </div>
        <div className="h-6 bg-white/10 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-100 ease-linear`}
            style={{ width: `${percent}%`, boxShadow: isUrgent ? '0 0 12px rgba(239,68,68,0.6)' : '' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Time</span>
        <span className={`font-nunito text-2xl font-black ${textColor} transition-colors ${isUrgent ? 'animate-pulse' : ''}`}>
          {Math.ceil(timeLeft)}s
        </span>
      </div>
      <div className="h-4 bg-white/10 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-100 ease-linear`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
