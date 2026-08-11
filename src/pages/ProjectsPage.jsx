import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import ProjectProgress from '../components/ProjectProgress';
import { ProjectPriorityBadge, ProjectStatusBadge } from '../components/ProjectStatusBadge';
import { SERVICE_TYPES } from '../lib/deals';
import { formatCurrencyAmount, formatCurrencyTotals, sumByCurrency } from '../lib/currency';
import { ACTIVE_PROJECT_STATUSES, getProjects, PROJECT_PRIORITIES, PROJECT_STATUSES } from '../lib/projects';

const emptyFilters = { search: '', status: 'All', service: 'All', owner: 'All', priority: 'All' };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    let active = true;
    getProjects()
      .then((data) => { if (active) setProjects(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const owners = useMemo(
    () => [...new Set(projects.map((project) => project.project_owner).filter(Boolean))].sort(),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return projects.filter((project) => {
      if (search && !`${project.project_name} ${project.client_company}`.toLowerCase().includes(search)) return false;
      if (filters.status !== 'All' && project.status !== filters.status) return false;
      if (filters.service !== 'All' && project.service_type !== filters.service) return false;
      if (filters.owner !== 'All' && project.project_owner !== filters.owner) return false;
      if (filters.priority !== 'All' && project.priority !== filters.priority) return false;
      return true;
    });
  }, [projects, filters]);

  const metrics = useMemo(() => {
    const active = projects.filter((project) => ACTIVE_PROJECT_STATUSES.includes(project.status));
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const deadline = new Date(todayStart);
    deadline.setDate(deadline.getDate() + 30);
    const upcoming = active.filter((project) => {
      if (!project.target_completion_date) return false;
      const target = new Date(`${project.target_completion_date}T00:00:00`);
      return target >= todayStart && target <= deadline;
    });

    return {
      activeCount: active.length,
      activeValue: sumByCurrency(active, 'project_value'),
      atRiskCount: active.filter((project) => project.status === 'At Risk').length,
      upcomingCount: upcoming.length
    };
  }, [projects]);

  function setFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <div>
      <div className="page-heading projects-heading">
        <div>
          <h2>Projects</h2>
          <p>EMCORD delivery portfolio, ownership, progress and deadlines.</p>
        </div>
        <Link to="/projects/new" className="btn btn-primary">+ New Project</Link>
      </div>

      <div className="metric-grid metric-grid-four projects-kpis">
        <MetricCard label="Active projects" value={loading ? '—' : metrics.activeCount} detail="Not started, in progress, on hold or at risk" />
        <MetricCard label="Total active project value" value={loading ? '—' : formatCurrencyTotals(metrics.activeValue)} detail="Grouped by project currency" tone="brand-cyan" />
        <MetricCard label="Projects at risk" value={loading ? '—' : metrics.atRiskCount} detail={metrics.atRiskCount ? 'Requires delivery attention' : 'No projects currently at risk'} tone="warning" />
        <MetricCard label="Upcoming deadlines" value={loading ? '—' : metrics.upcomingCount} detail="Target dates in the next 30 days" />
      </div>

      {error && <div className="form-alert page-alert" role="alert">{error}</div>}

      <div className="card project-filters">
        <label className="filter-search">
          <span className="field-label">Search</span>
          <input
            type="search"
            placeholder="Project or client name"
            value={filters.search}
            onChange={(event) => setFilter('search', event.target.value)}
          />
        </label>
        <FilterSelect label="Status" value={filters.status} options={PROJECT_STATUSES} onChange={(value) => setFilter('status', value)} />
        <FilterSelect label="Service" value={filters.service} options={SERVICE_TYPES} onChange={(value) => setFilter('service', value)} />
        <FilterSelect label="Owner" value={filters.owner} options={owners} onChange={(value) => setFilter('owner', value)} />
        <FilterSelect label="Priority" value={filters.priority} options={PROJECT_PRIORITIES} onChange={(value) => setFilter('priority', value)} />
        {Object.values(filters).some((value) => value && value !== 'All') && (
          <button type="button" className="btn filters-clear" onClick={() => setFilters(emptyFilters)}>Clear</button>
        )}
      </div>

      <div className="card table-card">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Project</th><th>Client</th><th>Service</th><th>Owner</th><th>Status</th>
              <th>Value</th><th>Progress</th><th>Target date</th><th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="9" className="table-message">Loading projects…</td></tr>}
            {!loading && !error && filteredProjects.length === 0 && (
              <tr>
                <td colSpan="9" className="table-empty-state">
                  <strong>{projects.length ? 'No projects match these filters' : 'No projects yet'}</strong>
                  <span>{projects.length ? 'Adjust or clear the filters above.' : 'Create the first EMCORD delivery project when you are ready.'}</span>
                </td>
              </tr>
            )}
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td><Link className="project-link" to={`/projects/${project.id}`}>{project.project_name}</Link></td>
                <td>{project.client_company}</td>
                <td><span className="badge">{project.service_type}</span></td>
                <td>{project.project_owner}</td>
                <td><ProjectStatusBadge status={project.status} /></td>
                <td className="mono">{formatCurrencyAmount(project.project_value, project.currency)}</td>
                <td><ProjectProgress value={project.progress_percentage} compact /></td>
                <td className="mono">{formatDate(project.target_completion_date)}</td>
                <td><ProjectPriorityBadge priority={project.priority} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option>All</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T00:00:00`));
}
