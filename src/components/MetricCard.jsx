export default function MetricCard({ label, value, detail, tone }) {
  return (
    <div className="card metric-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={tone ? { color: `var(--${tone})` } : undefined}>
        {value}
      </div>
      {detail && <div className="metric-detail">{detail}</div>}
    </div>
  );
}
