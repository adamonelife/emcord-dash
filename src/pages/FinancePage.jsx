import { useEffect, useMemo, useState } from 'react';
import {
  getInvoices, createInvoice, updateInvoice, deleteInvoice,
  getExpenses, createExpense, deleteExpense,
  INVOICE_STATUSES, CURRENCIES, EXPENSE_CATEGORIES
} from '../lib/finance';

const emptyInvoice = {
  contact: '', invoice_number: '', amount: '', currency: 'USD',
  status: 'Draft', issue_date: '', due_date: '', reference: '', notes: ''
};
const emptyExpense = {
  description: '', category: EXPENSE_CATEGORIES[0], amount: '', currency: 'USD', date: '', notes: ''
};

const statusColor = {
  Draft: 'var(--text-muted)',
  Sent: 'var(--accent-2)',
  Paid: 'var(--good)',
  Overdue: 'var(--danger)',
  Void: 'var(--text-faint)'
};

export default function FinancePage() {
  const [tab, setTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoice);
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [inv, exp] = await Promise.all([getInvoices(), getExpenses()]);
      setInvoices(inv);
      setExpenses(exp);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const summary = useMemo(() => {
    const byCurrency = {};
    for (const inv of invoices) {
      const c = inv.currency;
      byCurrency[c] = byCurrency[c] || { outstanding: 0, paid: 0, expenses: 0 };
      if (inv.status === 'Paid') byCurrency[c].paid += Number(inv.amount || 0);
      else if (inv.status !== 'Void') byCurrency[c].outstanding += Number(inv.amount || 0);
    }
    for (const exp of expenses) {
      const c = exp.currency;
      byCurrency[c] = byCurrency[c] || { outstanding: 0, paid: 0, expenses: 0 };
      byCurrency[c].expenses += Number(exp.amount || 0);
    }
    return byCurrency;
  }, [invoices, expenses]);

  async function submitInvoice(e) {
    e.preventDefault();
    if (!invoiceForm.contact.trim()) return;
    setSaving(true);
    try {
      const payload = { ...invoiceForm, amount: invoiceForm.amount === '' ? 0 : Number(invoiceForm.amount) };
      if (!payload.issue_date) delete payload.issue_date;
      const created = await createInvoice(payload);
      setInvoices((prev) => [created, ...prev]);
      setInvoiceForm(emptyInvoice);
      setShowInvoiceForm(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function submitExpense(e) {
    e.preventDefault();
    if (!expenseForm.description.trim()) return;
    setSaving(true);
    try {
      const payload = { ...expenseForm, amount: expenseForm.amount === '' ? 0 : Number(expenseForm.amount) };
      if (!payload.date) delete payload.date;
      const created = await createExpense(payload);
      setExpenses((prev) => [created, ...prev]);
      setExpenseForm(emptyExpense);
      setShowExpenseForm(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(inv, status) {
    const prev = invoices;
    setInvoices((list) => list.map((x) => (x.id === inv.id ? { ...x, status } : x)));
    try {
      await updateInvoice(inv.id, { status });
    } catch (e) {
      setError(e.message);
      setInvoices(prev);
    }
  }

  async function handleDeleteInvoice(id) {
    if (!confirm('Delete this invoice?')) return;
    const prev = invoices;
    setInvoices((list) => list.filter((x) => x.id !== id));
    try { await deleteInvoice(id); } catch (e) { setError(e.message); setInvoices(prev); }
  }

  async function handleDeleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    const prev = expenses;
    setExpenses((list) => list.filter((x) => x.id !== id));
    try { await deleteExpense(id); } catch (e) { setError(e.message); setExpenses(prev); }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Finance</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
          Manual invoice and expense entry — shaped to map onto Xero later.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(Object.keys(summary).length, 1)}, 1fr)`, gap: 12, marginBottom: 20 }}>
        {Object.keys(summary).length === 0 && (
          <div className="card" style={{ padding: 16 }}>
            <div className="kpi-label">No data yet</div>
            <div className="kpi-value" style={{ fontSize: 15, color: 'var(--text-muted)' }}>Add an invoice or expense to see totals</div>
          </div>
        )}
        {Object.entries(summary).map(([currency, s]) => (
          <div key={currency} className="card" style={{ padding: 16 }}>
            <div className="kpi-label">{currency}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              <Row label="Outstanding" value={s.outstanding} color="var(--warn)" />
              <Row label="Paid" value={s.paid} color="var(--good)" />
              <Row label="Expenses" value={s.expenses} color="var(--danger)" />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="card" style={{ padding: 12, marginBottom: 16, borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <TabBtn active={tab === 'invoices'} onClick={() => setTab('invoices')}>Invoices</TabBtn>
        <TabBtn active={tab === 'expenses'} onClick={() => setTab('expenses')}>Expenses</TabBtn>
      </div>

      {tab === 'invoices' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={() => setShowInvoiceForm((s) => !s)}>
              {showInvoiceForm ? 'Cancel' : '+ New invoice'}
            </button>
          </div>

          {showInvoiceForm && (
            <form onSubmit={submitInvoice} className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <Field label="Contact / client">
                  <input type="text" required value={invoiceForm.contact} onChange={(e) => setInvoiceForm({ ...invoiceForm, contact: e.target.value })} />
                </Field>
                <Field label="Invoice number">
                  <input type="text" value={invoiceForm.invoice_number} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })} />
                </Field>
                <Field label="Reference">
                  <input type="text" value={invoiceForm.reference} onChange={(e) => setInvoiceForm({ ...invoiceForm, reference: e.target.value })} />
                </Field>
                <Field label="Amount">
                  <input type="number" min="0" step="0.01" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} />
                </Field>
                <Field label="Currency">
                  <select value={invoiceForm.currency} onChange={(e) => setInvoiceForm({ ...invoiceForm, currency: e.target.value })}>
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={invoiceForm.status} onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })}>
                    {INVOICE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Issue date">
                  <input type="date" value={invoiceForm.issue_date} onChange={(e) => setInvoiceForm({ ...invoiceForm, issue_date: e.target.value })} />
                </Field>
                <Field label="Due date">
                  <input type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })} />
                </Field>
              </div>
              <div style={{ marginTop: 12 }}>
                <Field label="Notes">
                  <textarea rows={2} value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} />
                </Field>
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save invoice'}</button>
              </div>
            </form>
          )}

          <div className="card" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Contact</th><th>Invoice #</th><th>Status</th><th>Amount</th><th>Issue date</th><th>Due date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7} style={{ color: 'var(--text-muted)' }}>Loading…</td></tr>}
                {!loading && invoices.length === 0 && <tr><td colSpan={7} style={{ color: 'var(--text-muted)' }}>No invoices yet.</td></tr>}
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.contact}</td>
                    <td className="mono" style={{ color: 'var(--text-muted)' }}>{inv.invoice_number || '—'}</td>
                    <td>
                      <select
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv, e.target.value)}
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 12, color: statusColor[inv.status], borderColor: 'var(--border-strong)' }}
                      >
                        {INVOICE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="mono">{Number(inv.amount || 0).toLocaleString()} {inv.currency}</td>
                    <td className="mono" style={{ color: 'var(--text-muted)' }}>{inv.issue_date || '—'}</td>
                    <td className="mono" style={{ color: 'var(--text-muted)' }}>{inv.due_date || '—'}</td>
                    <td><button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDeleteInvoice(inv.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'expenses' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={() => setShowExpenseForm((s) => !s)}>
              {showExpenseForm ? 'Cancel' : '+ New expense'}
            </button>
          </div>

          {showExpenseForm && (
            <form onSubmit={submitExpense} className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <Field label="Description">
                  <input type="text" required value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                </Field>
                <Field label="Category">
                  <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                    {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Amount">
                  <input type="number" min="0" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                </Field>
                <Field label="Currency">
                  <select value={expenseForm.currency} onChange={(e) => setExpenseForm({ ...expenseForm, currency: e.target.value })}>
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Date">
                  <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                </Field>
              </div>
              <div style={{ marginTop: 12 }}>
                <Field label="Notes">
                  <textarea rows={2} value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
                </Field>
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save expense'}</button>
              </div>
            </form>
          )}

          <div className="card" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr><th>Description</th><th>Category</th><th>Amount</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} style={{ color: 'var(--text-muted)' }}>Loading…</td></tr>}
                {!loading && expenses.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--text-muted)' }}>No expenses yet.</td></tr>}
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.description}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{exp.category}</td>
                    <td className="mono">{Number(exp.amount || 0).toLocaleString()} {exp.currency}</td>
                    <td className="mono" style={{ color: 'var(--text-muted)' }}>{exp.date || '—'}</td>
                    <td><button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDeleteExpense(exp.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="mono" style={{ color }}>{Number(value).toLocaleString()}</span>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="btn"
      style={{
        background: active ? 'var(--surface-raised)' : 'transparent',
        color: active ? 'var(--text)' : 'var(--text-muted)',
        borderColor: active ? 'var(--border-strong)' : 'transparent'
      }}
    >
      {children}
    </button>
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
