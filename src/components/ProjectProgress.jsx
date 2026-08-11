export default function ProjectProgress({ value, compact = false }) {
  const progress = Math.min(100, Math.max(0, Number(value || 0)));

  return (
    <div className={`project-progress${compact ? ' project-progress-compact' : ''}`}>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="progress-value">{progress}%</span>
    </div>
  );
}
