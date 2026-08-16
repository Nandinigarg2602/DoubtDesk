import { useEffect, useRef } from 'react';
import './RevealText.css';

/**
 * RevealText — Scroll/visibility-triggered text reveal.
 * Words slide up with staggered delays, replacing the old typewriter effect.
 */
export default function RevealText({
  text = '',
  tag: Tag = 'h1',
  className = '',
  isActive = true,
  staggerMs = 60,
}) {
  const containerRef = useRef(null);
  const words = text.split(' ');

  return (
    <Tag
      ref={containerRef}
      className={`reveal-text ${isActive ? 'reveal-text--active' : ''} ${className}`}
    >
      {words.map((word, i) => (
        <span key={i} className="reveal-text__word-wrap">
          <span
            className="reveal-text__word"
            style={{ transitionDelay: isActive ? `${i * staggerMs}ms` : '0ms' }}
          >
            {word}
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  );
}
