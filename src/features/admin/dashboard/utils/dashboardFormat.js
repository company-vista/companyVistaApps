export const formatCurrency = (amount, currency = 'INR') => {
  const safeAmount = Number(amount) || 0;
  const resolvedCurrency = (currency || 'INR').toUpperCase();
  const locale = resolvedCurrency === 'INR' ? 'en-IN' : 'en-US';
  const minimumFractionDigits = resolvedCurrency === 'INR' ? 0 : 2;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: resolvedCurrency,
      minimumFractionDigits,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch (error) {
    return resolvedCurrency === 'INR'
      ? `₹${safeAmount.toFixed(0)}`
      : `$${safeAmount.toFixed(2)}`;
  }
};

export const formatShortDate = value =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

export const formatStatusLabel = status =>
  String(status || 'pending')
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const getCompanyStatusType = status => {
  const normalized = String(status || '').toLowerCase();
  if (
    [
      'active',
      'completed',
      'delivered',
      'company_registered',
      'setup_completed',
    ].includes(normalized)
  ) {
    return 'success';
  }
  if (['rejected', 'inactive'].includes(normalized)) {
    return 'danger';
  }
  if (['action_required'].includes(normalized)) {
    return 'action';
  }
  return 'warning';
};

export const getInvoiceStatusType = status => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'paid') return 'paid';
  if (normalized === 'overdue') return 'overdue';
  if (normalized === 'partial') return 'partial';
  if (normalized === 'unpaid' || normalized === 'pending') return 'pending';
  return 'default';
};
