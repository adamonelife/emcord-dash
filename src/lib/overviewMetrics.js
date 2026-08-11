const OPEN_STAGES = new Set(['New Lead', 'Qualified', 'Proposal Sent', 'Negotiation']);

function addByCurrency(rows) {
  return rows.reduce((totals, row) => {
    const currency = row.currency || 'USD';
    totals[currency] = (totals[currency] || 0) + Number(row.amount || 0);
    return totals;
  }, {});
}

export function formatCurrencyTotals(totals) {
  const entries = Object.entries(totals);
  if (entries.length === 0) return '0';
  return entries
    .map(([currency, amount]) => `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
    .join(' · ');
}

export function buildCommercialMetrics(deals = [], invoices = []) {
  const openDeals = deals.filter((deal) => OPEN_STAGES.has(deal.stage));
  const wonDeals = deals.filter((deal) => deal.stage === 'Won');
  const outstandingInvoices = invoices.filter(
    (invoice) => invoice.status !== 'Paid' && invoice.status !== 'Void'
  );

  return {
    openPipeline: addByCurrency(openDeals),
    wonRevenue: addByCurrency(wonDeals),
    outstandingInvoices: addByCurrency(outstandingInvoices)
  };
}
