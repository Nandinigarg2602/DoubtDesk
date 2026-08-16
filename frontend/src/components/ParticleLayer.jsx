import { useMemo } from 'react';
import './ParticleLayer.css';

const PARTICLE_COUNT = 45;

export default function ParticleLayer() {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      char: Math.random() > 0.5 ? '0' : '1',
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 10,
      fontSize: 10 + Math.random() * 6,
    }));
  }, []);

  return (
    <div className="particle-layer" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle-glyph"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.fontSize}px`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
