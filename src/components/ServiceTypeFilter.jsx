import { useServiceType } from '../context/ServiceTypeContext';

export default function ServiceTypeFilter() {
  const { serviceType, setServiceType, options } = useServiceType();
  return (
    <div className="filter-group" aria-label="Filter by service type">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setServiceType(option)}
          className={`btn filter-button${serviceType === option ? ' filter-button-active' : ''}`}
          aria-pressed={serviceType === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
