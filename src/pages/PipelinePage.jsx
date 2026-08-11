import { useEffect, useMemo, useState } from 'react';
import { getDeals, createDeal, updateDeal, deleteDeal, STAGES, SERVICE_TYPES } from '../lib/deals';
import { CURRENCIES } from '../lib/finance';
import { useServiceType } from '../context/ServiceTypeContext';
import ServiceTypeFilter from '../components/ServiceTypeFilter';

const emptyDeal = {
  company: '',
  contact_name: '',
  contact_email: '',
  service_type: SERVICE_TYPES[0],
  stage: STAGES[0],
  amount: '',
  currency: 'USD',
  expected_close: '',
  owner: '',
  source: '',
  notes: ''
};

const stageColor = {
  'New Lead': 'var(--text-muted)',
  'Qualified': 'var(--accent-2)',
  'Proposal Sent': 'var(--warn)',
  'Negotiation': 'var(--warn)',
  'Won': 'var(--good)',
  'Lost': 'var(--danger)'
};

export default function PipelinePage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyDeal);
  const [saving, setSaving] = useState(false);
  const { serviceType } = useServiceType();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setDeals(await getDeals());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => (serviceType === 'All' ? deals : deals.filter((d) => d.service_type === serviceType)),
    [deals, serviceType]
  );

  const totals = useMemo(() => {
    const open = filtered.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost');
    const won = filtered.filter((d) => d.stage === 'Won');
    return {
      openCount: open.length,
      openValue: open.reduce((s, d) => s + Number(d.amount || 0), 0),
      wonValue: won.reduce((s, d) => s + Number(d.amount || 0), 0)
    };
  }, [filtered]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.company.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, amount: form.amount === '' ? 0 : Number(form.amount) };
      const created = await createDeal(payload);
      setDeals((prev) => [created, ...prev]);
      setForm(emptyDeal);
      setShowForm(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStageChange(deal, stage) {
    const prev = deals;
    setDeals((d) => d.map((x) => (x.id === deal.id ? { ...x, stage } : x)));
    try {
      await updateDeal(deal.id, { stage });
    } catch (e) {
      setError(e.message);
      setDeals(prev);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this deal?')) return;
    const prev = deals;
    setDeals((d) => d.filter((x) => x.id !== id));
    try {
      await deleteDeal(id);
    } catch (e) {
      setError(e.message);
      setDeals(prev);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>Pipeline</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Leads and deals — manual entry for now, shaped to map onto GoHighLevel later.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New deal'}
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <ServiceTypeFilter />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="kpi-label">Open deals</div>
          <div className="kpi-value">{totals.openCount}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="kpi-label">Open pipeline value</div>
          <div className="kpi-value">{totals.openValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="kpi-label">Won value</div>
          <div className="kpi-value" style={{ color: 'var(--good)' }}>
            {totals.wonValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: 12, marginBottom: 16, borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <Field label="Company">
              <input type="text" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </Field>
            <Field label="Contact name">
              <input type="text" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            </Field>
            <Field label="Contact email">
              <input type="text" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </Field>
            <Field label="Service type">
              <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}>
                {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Stage">
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Owner">
              <input type="text" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </Field>
            <Field label="Amount">
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </Field>
            <Field label="Currency">
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Expected close">
              <input type="date" value={form.expected_close} onChange={(e) => setForm({ ...form, expected_close: e.target.value })} />
            </Field>
            <Field label="Source">
              <input type="text" placeholder="Referral, inbound, event…" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </Field>
          </div>
          <div style={{ marginTop: 12 }}>
            <Field label="Notes">
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save deal'}
            </button>
          </div>
        </form>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact</th>
              <th>Service type</th>
              <th>Stage</th>
              <th>Amount</th>
              <th>Expected close</th>
              <th>Owner</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} style={{ color: 'var(--text-muted)' }}>Loading…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} style={{ color: 'var(--text-muted)' }}>No deals yet — add your first one above.</td></tr>
            )}
            {filtered.map((d) => (
              <tr key={d.id}>
                <td>{d.company}</td>
                <td style={{ color: 'var(--text-muted)' }}>{d.contact_name || '—'}</td>
                <td>
                  <span className="badge" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}>
                    {d.service_type}
                  </span>
                </td>
                <td>
                  <select
                    value={d.stage}
                    onChange={(e) => handleStageChange(d, e.target.value)}
                    style={{
                      width: 'auto',
                      padding: '4px 8px',
                      fontSize: 12,
                      color: stageColor[d.stage],
                      borderColor: 'var(--border-strong)'
                    }}
                  >
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="mono">{Number(d.amount || 0).toLocaleString()} {d.currency}</td>
                <td className="mono" style={{ color: 'var(--text-muted)' }}>{d.expected_close || '—'}</td>
                <td>{d.owner || '—'}</td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(d.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      {children}
    </label>
  );
}
