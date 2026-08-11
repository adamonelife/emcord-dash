import { useEffect, useState } from 'react';
import { SERVICE_TYPES } from '../lib/deals';
import { CURRENCIES } from '../lib/finance';
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from '../lib/projects';

const emptyProject = {
  project_name: '',
  client_company: '',
  primary_contact: '',
  service_type: SERVICE_TYPES[0],
  project_value: '',
  currency: 'USD',
  project_owner: '',
  status: PROJECT_STATUSES[0],
  start_date: '',
  target_completion_date: '',
  progress_percentage: 0,
  priority: 'Normal',
  description: '',
  ghl_opportunity_id: ''
};

function initialValues(project) {
  if (!project) return emptyProject;
  return Object.fromEntries(
    Object.entries(emptyProject).map(([key, fallback]) => [key, project[key] ?? fallback])
  );
}

export default function ProjectForm({ project, onSubmit, onCancel, saving = false }) {
  const [form, setForm] = useState(() => initialValues(project));
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setForm(initialValues(project));
    setValidationError(null);
  }, [project]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setValidationError(null);

    if (!form.project_name.trim() || !form.client_company.trim() || !form.project_owner.trim()) {
      setValidationError('Project name, client/company and project owner are required.');
      return;
    }

    const value = Number(form.project_value || 0);
    const progress = Number(form.progress_percentage || 0);
    if (value < 0) {
      setValidationError('Project value cannot be negative.');
      return;
    }
    if (progress < 0 || progress > 100) {
      setValidationError('Progress must be between 0 and 100.');
      return;
    }
    if (form.start_date && form.target_completion_date && form.target_completion_date < form.start_date) {
      setValidationError('Target completion cannot be before the start date.');
      return;
    }

    onSubmit({
      ...form,
      project_name: form.project_name.trim(),
      client_company: form.client_company.trim(),
      primary_contact: form.primary_contact.trim() || null,
      project_owner: form.project_owner.trim(),
      project_value: value,
      progress_percentage: progress,
      start_date: form.start_date || null,
      target_completion_date: form.target_completion_date || null,
      description: form.description.trim() || null,
      ghl_opportunity_id: form.ghl_opportunity_id.trim() || null
    });
  }

  return (
    <form className="card project-form" onSubmit={handleSubmit}>
      {validationError && <div className="form-alert" role="alert">{validationError}</div>}

      <div className="form-section">
        <div className="form-section-heading">
          <h3>Project information</h3>
          <p>Core delivery and ownership details.</p>
        </div>
        <div className="form-grid form-grid-three">
          <Field label="Project name" required>
            <input value={form.project_name} onChange={(e) => setField('project_name', e.target.value)} required />
          </Field>
          <Field label="Client / company" required>
            <input value={form.client_company} onChange={(e) => setField('client_company', e.target.value)} required />
          </Field>
          <Field label="Primary contact">
            <input value={form.primary_contact} onChange={(e) => setField('primary_contact', e.target.value)} />
          </Field>
          <Field label="Service type" required>
            <select value={form.service_type} onChange={(e) => setField('service_type', e.target.value)}>
              {SERVICE_TYPES.map((service) => <option key={service}>{service}</option>)}
            </select>
          </Field>
          <Field label="Project owner" required>
            <input value={form.project_owner} onChange={(e) => setField('project_owner', e.target.value)} required />
          </Field>
          <Field label="Priority" required>
            <select value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
              {PROJECT_PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading">
          <h3>Schedule and commercial</h3>
          <p>Status, timing, value and delivery progress.</p>
        </div>
        <div className="form-grid form-grid-three">
          <Field label="Status" required>
            <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
              {PROJECT_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </Field>
          <Field label="Start date">
            <input type="date" value={form.start_date} onChange={(e) => setField('start_date', e.target.value)} />
          </Field>
          <Field label="Target completion">
            <input type="date" value={form.target_completion_date} onChange={(e) => setField('target_completion_date', e.target.value)} />
          </Field>
          <Field label="Project value">
            <input type="number" min="0" step="0.01" value={form.project_value} onChange={(e) => setField('project_value', e.target.value)} />
          </Field>
          <Field label="Currency">
            <select value={form.currency} onChange={(e) => setField('currency', e.target.value)}>
              {CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </Field>
          <Field label="Progress percentage">
            <div className="progress-input">
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress_percentage}
                onChange={(e) => setField('progress_percentage', e.target.value)}
              />
              <input
                className="progress-number"
                type="number"
                min="0"
                max="100"
                value={form.progress_percentage}
                onChange={(e) => setField('progress_percentage', e.target.value)}
                aria-label="Progress percentage value"
              />
            </div>
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading">
          <h3>Context</h3>
          <p>Delivery notes and optional future sales-system linkage.</p>
        </div>
        <div className="form-grid form-grid-two">
          <Field label="Description / notes">
            <textarea rows="5" value={form.description} onChange={(e) => setField('description', e.target.value)} />
          </Field>
          <Field label="GHL opportunity ID" hint="Optional — reserved for future GHL integration">
            <input value={form.ghl_opportunity_id} onChange={(e) => setField('ghl_opportunity_id', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : project ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <label className="form-field">
      <span className="field-label">{label}{required && <span aria-hidden="true"> *</span>}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
