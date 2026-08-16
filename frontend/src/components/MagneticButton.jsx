import { useRef, useCallback } from 'react';

export default function MagneticButton({ children, className = '', ...props }) {
  const btnRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // Shift up to 6px toward the cursor
    const maxShift = 6;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const pullZone = 100; // pixels

    if (distance < pullZone) {
      const factor = (1 - distance / pullZone) * maxShift;
      const shiftX = (dx / distance) * factor || 0;
      const shiftY = (dy / distance) * factor || 0;
      btn.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = 'translate(0, 0)';
    btn.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
      if (btn) btn.style.transition = '';
    }, 300);
  }, []);

  return (
    <button
      ref={btnRef}
      className={`btn ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}
