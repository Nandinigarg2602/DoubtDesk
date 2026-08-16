import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card glass-panel">
      <div className="skeleton-card__header">
        <div className="skeleton skeleton-tag" />
        <div className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-desc" />
      <div className="skeleton skeleton-desc skeleton-desc--short" />
      <div className="skeleton-card__footer">
        <div className="skeleton skeleton-author" />
        <div className="skeleton skeleton-time" />
      </div>
    </div>
  );
}
