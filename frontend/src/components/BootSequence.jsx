import { useState, useEffect } from 'react';
import './BootSequence.css';

/**
 * BootSequence — Podium-inspired minimal loader.
 * White screen, centered black dot, percentage counter top-right.
 */
export default function BootSequence({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      // Ease-out curve for natural feel
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setHiding(true);
        setTimeout(() => {
          sessionStorage.setItem('dd_booted', '1');
          onComplete?.();
        }, 500);
      }
    };

    requestAnimationFrame(tick);
  }, [onComplete]);

  return (
    <div className={`boot-screen ${hiding ? 'boot-screen--exit' : ''}`}>
      <div className="boot-dot" />
      <span className="boot-counter">{progress}%</span>
    </div>
  );
}
