import { useServiceType } from '../context/ServiceTypeContext';

export default function ServiceTypeFilter() {
  const { serviceType, setServiceType, options } = useServiceType();
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setServiceType(opt)}
          className="btn"
          style={{
            padding: '5px 12px',
            fontSize: 12,
            background: serviceType === opt ? 'var(--accent)' : 'var(--surface-raised)',
            color: serviceType === opt ? '#06110f' : 'var(--text-muted)',
            borderColor: serviceType === opt ? 'var(--accent)' : 'var(--border-strong)'
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
