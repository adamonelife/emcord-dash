import { supabase } from './supabaseClient';

// Invoice fields mirror Xero's invoice shape (Contact, Total, CurrencyCode,
// Status, Date, DueDate, InvoiceNumber) so swapping to the Xero API later
// only means rewriting the function bodies below, not any consuming page.

export const INVOICE_STATUSES = ['Draft', 'Sent', 'Paid', 'Overdue', 'Void'];
export const CURRENCIES = ['USD', 'GBP', 'AUD', 'IDR'];
export const EXPENSE_CATEGORIES = [
  'Software & Tools',
  'Hardware',
  'Payroll',
  'Contractors',
  'Marketing',
  'Office & Ops',
  'Travel',
  'Other'
];

export async function getInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('issue_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createInvoice(invoice) {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInvoice(id, patch) {
  const { data, error } = await supabase
    .from('invoices')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInvoice(id) {
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) throw error;
}

export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createExpense(expense) {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expense])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}
