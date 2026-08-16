import { useEffect, useState, useRef } from 'react';
import './StatCounter.css';

export default function StatCounter({ label, value, color }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current || value === 0) {
      setDisplay(value);
      return;
    }

    animated.current = true;
    const duration = 1000;
    const start = performance.now();
    const startVal = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (value - startVal) * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div className="stat-counter" ref={ref}>
      <span className="stat-counter__value mono" style={{ color }}>
        {display}
      </span>
      <span className="stat-counter__label mono">{label}</span>
    </div>
  );
}
