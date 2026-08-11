import { useEffect, useState } from 'react';
import { getDeals, STAGES } from '../lib/deals';
import { getInvoices, getExpenses } from '../lib/finance';

export default function OverviewPage() {
  const [deals, setDeals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [d, i, e] = await Promise.all([getDeals(), getInvoices(), getExpenses()]);
        setDeals(d); setInvoices(i); setExpenses(e);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openDeals = deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost');
  const outstanding = invoices.filter((i) => i.status !== 'Paid' && i.status !== 'Void');
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Overview</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
          Digital twin / AR / MR / VR studio — early build, manual data entry.
        </p>
      </div>

      {error && (
        <div className="card" style={{ padding: 12, marginBottom: 16, borderColor: 'var(--warn)', color: 'var(--warn)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <Kpi label="Open deals" value={loading ? '—' : openDeals.length} />
        <Kpi label="Outstanding invoices" value={loading ? '—' : outstanding.length} />
        <Kpi label="Total logged expenses" value={loading ? '—' : totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
        <Kpi label="All deals tracked" value={loading ? '—' : deals.length} />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 14 }}>
          Pipeline by stage
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STAGES.map((stage) => {
            const count = deals.filter((d) => d.stage === stage).length;
            const max = Math.max(...STAGES.map((s) => deals.filter((d) => d.stage === s).length), 1);
            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 110, fontSize: 12, color: 'var(--text-muted)' }}>{stage}</div>
                <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 3, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${(count / max) * 100}%`, background: 'var(--accent)', height: '100%' }} />
                </div>
                <div className="mono" style={{ width: 24, textAlign: 'right', fontSize: 12 }}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ marginTop: 6 }}>{value}</div>
    </div>
  );
}
