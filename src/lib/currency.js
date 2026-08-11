export function sumByCurrency(rows, amountField = 'amount') {
  return rows.reduce((totals, row) => {
    const currency = row.currency || 'USD';
    totals[currency] = (totals[currency] || 0) + Number(row[amountField] || 0);
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

export function formatCurrencyAmount(amount, currency = 'USD') {
  return `${currency} ${Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
