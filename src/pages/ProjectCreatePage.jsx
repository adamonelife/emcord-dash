import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProjectForm from '../components/ProjectForm';
import { createProject } from '../lib/projects';

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleCreate(payload) {
    setSaving(true);
    setError(null);
    try {
      const project = await createProject(payload);
      navigate(`/projects/${project.id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-heading detail-heading">
        <div>
          <Link to="/projects" className="back-link">← Projects</Link>
          <h2>New project</h2>
          <p>Create a delivery record owned by the EMCORD Dashboard.</p>
        </div>
      </div>
      {error && <div className="form-alert page-alert" role="alert">{error}</div>}
      <ProjectForm onSubmit={handleCreate} onCancel={() => navigate('/projects')} saving={saving} />
    </div>
  );
}
