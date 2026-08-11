export default function PlaceholderPage({ title, description, next }) {
  return (
    <div>
      <div className="page-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="card placeholder-card">
        <div className="placeholder-status">V1 foundation</div>
        <h3>{title} workspace coming next</h3>
        <p>{next}</p>
        <div className="empty-state">No {title.toLowerCase()} data configured.</div>
      </div>
    </div>
  );
}
