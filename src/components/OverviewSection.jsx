export default function OverviewSection({ title, description, children }) {
  return (
    <section className="overview-section">
      <div className="section-heading">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}
