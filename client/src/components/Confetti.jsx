import { useEffect, useState } from 'react';

const COLORS = ['#fbbf24', '#f59e0b', '#8b5cf6', '#3b82f6', '#22c55e', '#ef4444', '#ec4899', '#06b6d4'];

export default function Confetti() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const count = 60;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 0.8,
      size: 8 + Math.random() * 10,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
