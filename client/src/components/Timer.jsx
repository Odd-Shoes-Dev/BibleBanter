import { useState, useEffect, useRef } from 'react';
import { sounds } from '../utils/sound';

export default function Timer({ duration, onTimeUp, paused, questionIndex, hostMode = false, circular = false }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const totalPausedTimeRef = useRef(0);
  const lastPausedAtRef = useRef(null);

  useEffect(() => {
    setTimeLeft(duration);
    startTimeRef.current = Date.now();
    totalPausedTimeRef.current = 0;
    if (paused) {
      lastPausedAtRef.current = Date.now();
    } else {
      lastPausedAtRef.current = null;
    }
  }, [questionIndex, duration]);

  const lastTickRef = useRef(-1);

  useEffect(() => {
    lastTickRef.current = -1;
  }, [questionIndex]);

  useEffect(() => {
    if (paused) {
      if (!lastPausedAtRef.current) {
        lastPausedAtRef.current = Date.now();
      }
      clearInterval(intervalRef.current);
      return;
    } else {
      if (lastPausedAtRef.current) {
        totalPausedTimeRef.current += (Date.now() - lastPausedAtRef.current);
        lastPausedAtRef.current = null;
      }
    }

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      const secLeft = Math.ceil(remaining);
      if (secLeft !== lastTickRef.current && remaining > 0) {
        lastTickRef.current = secLeft;
        if (secLeft <= 5) sounds.urgentTick();
        else if (secLeft <= 10) sounds.tick();
      }

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

  if (circular) {
    const R = 38;
    const circ = 2 * Math.PI * R;
    const offset = circ * (1 - percent / 100);
    const strokeColor = isUrgent ? '#ef4444' : isMid ? '#f59e0b' : '#d97706';
    return (
      <div className="relative w-24 h-24 mx-auto">
        <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
          <circle cx="50" cy="50" r={R} fill="none" stroke={strokeColor} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-nunito font-black text-3xl ${isUrgent ? 'animate-pulse' : ''}`}
            style={{ color: strokeColor }}>{Math.ceil(timeLeft)}</span>
        </div>
      </div>
    );
  }

  if (hostMode) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Time Remaining</span>
          <span className={`font-nunito text-3xl font-black ${textColor} transition-colors ${isUrgent ? 'animate-pulse' : ''}`}
            style={isUrgent ? { textShadow: '0 0 20px rgba(239,68,68,0.8)' } : {}}>
            {Math.ceil(timeLeft)}s
          </span>
        </div>
        <div className="h-4 bg-white/10 rounded-full overflow-hidden shadow-inner">
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
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Time</span>
        <span className={`font-nunito text-lg font-black ${textColor} transition-colors ${isUrgent ? 'animate-pulse' : ''}`}>
          {Math.ceil(timeLeft)}s
        </span>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-100 ease-linear`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
