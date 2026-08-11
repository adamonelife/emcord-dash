function classSuffix(value) {
  return value.toLowerCase().replaceAll(' ', '-');
}

export function ProjectStatusBadge({ status }) {
  return <span className={`badge status-${classSuffix(status)}`}>{status}</span>;
}

export function ProjectPriorityBadge({ priority }) {
  return <span className={`badge priority-${classSuffix(priority)}`}>{priority}</span>;
}
