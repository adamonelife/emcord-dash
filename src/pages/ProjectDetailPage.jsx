import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProjectForm from '../components/ProjectForm';
import ProjectProgress from '../components/ProjectProgress';
import { ProjectPriorityBadge, ProjectStatusBadge } from '../components/ProjectStatusBadge';
import { formatCurrencyAmount } from '../lib/currency';
import { getProject, updateProject } from '../lib/projects';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getProject(projectId)
      .then((data) => { if (active) setProject(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projectId]);

  async function handleUpdate(payload) {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProject(project.id, payload);
      setProject(updated);
      setEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card detail-loading">Loading project…</div>;

  if (!project) {
    return (
      <div>
        <Link to="/projects" className="back-link">← Projects</Link>
        <div className="form-alert page-alert" role="alert">{error || 'Project not found.'}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading detail-heading">
        <div>
          <Link to="/projects" className="back-link">← Projects</Link>
          <h2>{project.project_name}</h2>
          <p>{project.client_company} · {project.service_type}</p>
        </div>
        {!editing && <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>Edit project</button>}
      </div>

      {error && <div className="form-alert page-alert" role="alert">{error}</div>}

      {editing ? (
        <ProjectForm project={project} onSubmit={handleUpdate} onCancel={() => setEditing(false)} saving={saving} />
      ) : (
        <div className="project-detail-layout">
          <section className="card detail-card detail-summary">
            <div className="detail-card-heading">
              <div>
                <div className="detail-label">Delivery progress</div>
                <h3>{project.progress_percentage}% complete</h3>
              </div>
              <ProjectStatusBadge status={project.status} />
            </div>
            <ProjectProgress value={project.progress_percentage} />
          </section>

          <section className="card detail-card">
            <h3>Project details</h3>
            <dl className="detail-grid">
              <Detail label="Client" value={project.client_company} />
              <Detail label="Primary contact" value={project.primary_contact} />
              <Detail label="Service" value={project.service_type} />
              <Detail label="Owner" value={project.project_owner} />
              <Detail label="Project value" value={formatCurrencyAmount(project.project_value, project.currency)} />
              <Detail label="Priority" value={<ProjectPriorityBadge priority={project.priority} />} />
              <Detail label="Start date" value={formatDate(project.start_date)} />
              <Detail label="Target completion" value={formatDate(project.target_completion_date)} />
            </dl>
          </section>

          <section className="card detail-card detail-notes">
            <h3>Description / notes</h3>
            <p>{project.description || 'No project description or notes have been added.'}</p>
          </section>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(`${value}T00:00:00`));
}
