import { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check for touch / coarse pointer support
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouch();

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseOver = (e) => {
      const interactiveEl = e.target.closest(
        'button, a, input, select, textarea, [role="button"], .doubt-card, .landing__arrow, .interactive-hover'
      );
      setIsHovering(!!interactiveEl);
    };

    // Smooth animation loop for lagging trailing ring
    let animationFrameId;
    const updateRingPosition = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updateRingPosition);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    animationFrameId = requestAnimationFrame(updateRingPosition);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <div className="custom-cursor-container" aria-hidden="true">
      {/* 1. Precise leading solid center dot */}
      <div ref={dotRef} className="cursor-dot" />

      {/* 2. Lagging smoothed outer trailing ring */}
      <div
        ref={ringRef}
        className={`cursor-ring ${isHovering ? 'cursor-ring--hover' : ''}`}
      />
    </div>
  );
}
