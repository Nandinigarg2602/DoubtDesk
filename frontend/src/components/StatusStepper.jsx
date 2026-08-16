import { useEffect, useState } from 'react';
import './StatusStepper.css';

const STAGES = ['Open', 'In Progress', 'Resolved'];

export default function StatusStepper({ currentStatus }) {
  const [animatedIndex, setAnimatedIndex] = useState(-1);
  const currentIndex = STAGES.indexOf(currentStatus);

  useEffect(() => {
    // Animate stages in sequence
    let i = 0;
    const interval = setInterval(() => {
      if (i <= currentIndex) {
        setAnimatedIndex(i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="status-stepper">
      {STAGES.map((stage, i) => {
        const isCompleted = i < currentIndex;
        const isActive = i === currentIndex;
        const isAnimated = i <= animatedIndex;

        return (
          <div key={stage} className="stepper-stage-wrapper">
            {/* Connecting line (before dot, except first) */}
            {i > 0 && (
              <div className="stepper-line-container">
                <div
                  className={`stepper-line ${isAnimated ? 'stepper-line--filled' : ''}`}
                />
              </div>
            )}

            <div className="stepper-stage">
              <div
                className={`stepper-dot ${
                  isCompleted
                    ? 'stepper-dot--completed'
                    : isActive
                    ? 'stepper-dot--active'
                    : ''
                }`}
              />
              <span
                className={`stepper-label mono ${
                  isCompleted
                    ? 'stepper-label--completed'
                    : isActive
                    ? 'stepper-label--active'
                    : ''
                }`}
              >
                {stage}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
