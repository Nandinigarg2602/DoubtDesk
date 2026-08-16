import { useState, useEffect, useRef } from 'react';
import './TypewriterText.css';

/**
 * TypewriterText:
 * Types out the signature headline:
 * "Hello, [accent word/phrase]" where accent is #d8a33d, followed by the rest in #e9e6df,
 * ending with a blinking block/pipe cursor that auto-hides after typing.
 */
export default function TypewriterText({
  accentText = '',
  restText = '',
  speed = 28,
  isActive = true,
  className = '',
}) {
  const [displayedAccent, setDisplayedAccent] = useState('');
  const [displayedRest, setDisplayedRest] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Reset state whenever the section leaves or re-enters
    if (!isActive) {
      setDisplayedAccent('');
      setDisplayedRest('');
      setShowCursor(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setDisplayedAccent('');
    setDisplayedRest('');
    setShowCursor(true);

    const fullAccent = accentText;
    const fullRest = restText;
    let charIndex = 0;

    // Brief 150ms pause before starting typing for cinematic pacing
    const startDelay = setTimeout(() => {
      timerRef.current = setInterval(() => {
        if (charIndex < fullAccent.length) {
          setDisplayedAccent(fullAccent.slice(0, charIndex + 1));
        } else if (charIndex < fullAccent.length + fullRest.length) {
          const restIdx = charIndex - fullAccent.length;
          setDisplayedRest(fullRest.slice(0, restIdx + 1));
        } else {
          clearInterval(timerRef.current);
          // Auto dismiss cursor ~1.2s after completing
          setTimeout(() => setShowCursor(false), 1200);
        }
        charIndex++;
      }, speed);
    }, 150);

    return () => {
      clearTimeout(startDelay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, accentText, restText, speed]);

  return (
    <h1 className={`typewriter-headline ${className}`}>
      <span className="accent">{displayedAccent}</span>
      <span className="rest-text">{displayedRest}</span>
      {showCursor && <span className="typewriter-cursor">_</span>}
    </h1>
  );
}
