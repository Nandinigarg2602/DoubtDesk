import { Link } from 'react-router-dom';
import './DoubtCard.css';

export default function DoubtCard({ doubt, index = 0 }) {
  const statusClass =
    doubt.status === 'Open'
      ? 'open'
      : doubt.status === 'In Progress'
      ? 'in-progress'
      : 'resolved';

  const timeAgo = getTimeAgo(doubt.createdAt);

  // SLA Calculation
  let slaRemainingText = '';
  let isBreached = doubt.isEscalated;
  if (doubt.status === 'Open') {
    if (doubt.slaDeadline) {
      const diffMs = new Date(doubt.slaDeadline).getTime() - Date.now();
      if (diffMs <= 0 || doubt.isEscalated) {
        isBreached = true;
        slaRemainingText = '🚨 SLA Breached';
      } else {
        const minsLeft = Math.ceil(diffMs / 60000);
        slaRemainingText = `⏳ SLA: ${minsLeft}m left`;
      }
    }
  }

  return (
    <Link
      to={`/doubts/${doubt._id}`}
      className={`doubt-card glass-panel ${isBreached ? 'doubt-card--escalated' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="doubt-card__header">
        <span className="subject-tag">{doubt.subject}</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {isBreached && doubt.status === 'Open' && (
            <span className="sla-escalated-pill mono">
              🔥 PRIORITY ESCALATED
            </span>
          )}
          {doubt.status === 'Open' && !isBreached && slaRemainingText && (
            <span className="sla-timer-pill mono faint">
              {slaRemainingText}
            </span>
          )}
          <span className={`status-badge ${statusClass}`}>{doubt.status}</span>
        </div>
      </div>
      <h3 className="doubt-card__title">{doubt.title}</h3>
      <p className="doubt-card__desc">
        {doubt.description.length > 120
          ? doubt.description.slice(0, 120) + '...'
          : doubt.description}
      </p>
      <div className="doubt-card__footer">
        <span className="doubt-card__author dim">
          {doubt.student?.name || 'Student'}
        </span>
        <span className="doubt-card__time faint mono">{timeAgo}</span>
      </div>
    </Link>
  );
}

function getTimeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
