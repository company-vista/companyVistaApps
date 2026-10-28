const normalizeType = (value = '') => String(value).trim().toLowerCase();

export const getInvoiceType = (invoice = {}) => {
  const rawType = normalizeType(invoice.type || invoice.invoiceType);
  if (['subscription', 'recurring'].includes(rawType)) return 'subscription';
  if (['one-time', 'one_time', 'onetime'].includes(rawType)) return 'one-time';
  return 'mixed';
};

export const getItemType = (item = {}, fallbackType = 'mixed') => {
  const rawType = normalizeType(item.type || item.itemType);
  if (['subscription', 'recurring'].includes(rawType)) return 'subscription';
  if (['one-time', 'one_time', 'onetime'].includes(rawType)) return 'one-time';
  if ((item.description || '').toLowerCase().includes('subscription')) {
    return 'subscription';
  }
  if (fallbackType === 'subscription' || fallbackType === 'one-time') {
    return fallbackType;
  }
  return 'one-time';
};

export const round2 = value => Number((Number.isFinite(value) ? value : 0).toFixed(2));

export const getDiscountMeta = (invoice, subtotal) => {
  const discountType =
    invoice.discountType === 'percentage' ? 'percentage' : 'fixed';
  const fallbackValue = Number(invoice.discount) || 0;
  const rawValue =
    invoice.discountValue !== undefined && Number(invoice.discountValue) > 0
      ? Number(invoice.discountValue)
      : fallbackValue;
  const discountValue = Math.max(0, rawValue);
  const discountAmount =
    discountType === 'percentage'
      ? Math.min(subtotal, (subtotal * discountValue) / 100)
      : Math.min(subtotal, discountValue);

  return {
    discountType,
    discountValue,
    discountAmount: Math.max(0, discountAmount),
  };
};

export const computeTotalsINR = invoice => {
  const items = invoice.items || [];
  const invoiceType = getInvoiceType(invoice);
  const taxMode = invoice.taxMode || 'all';
  const taxRate = (() => {
    const candidates = [
      invoice.taxRate,
      invoice.tax_rate,
      invoice.gstRate,
      invoice.gst_rate,
      invoice.igstRate,
    ];
    for (const candidate of candidates) {
      const parsed = parseFloat(candidate);
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }
    const itemRate = parseFloat(items[0]?.taxRate ?? items[0]?.gstRate);
    return Number.isFinite(itemRate) && itemRate >= 0 ? itemRate : 0;
  })();
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.amount,
    0,
  );
  const { discountType, discountValue, discountAmount } = getDiscountMeta(
    invoice,
    subtotal,
  );
  const discount = discountValue;
  const discountAmt = discountAmount;
  const afterDisc = Math.max(0, subtotal - discountAmt);
  const discountRatio = subtotal > 0 ? discountAmt / subtotal : 0;
  const taxableBase =
    taxMode === 'specific'
      ? items.reduce(
          (sum, item) =>
            item.applyTax !== false
              ? sum + item.quantity * item.amount
              : sum,
          0,
        ) *
        (1 - discountRatio)
      : afterDisc;
  const backTax = parseFloat(
    invoice.tax ?? invoice.totalTax ?? invoice.totalGst ?? invoice.totalGST,
  );
  const tax = items.length
    ? (taxableBase * taxRate) / 100
    : Number.isFinite(backTax) && backTax > 0
      ? backTax
      : 0;
  const backTotal = parseFloat(
    invoice.total ?? invoice.grandTotal ?? invoice.amount,
  );
  const grandTotal = items.length
    ? afterDisc + tax
    : Number.isFinite(backTotal) && backTotal > 0
      ? backTotal
      : 0;
  const rounded = Math.round(grandTotal);
  const roundOff = Number((grandTotal - rounded).toFixed(2));
  const isPaid = invoice.paymentStatus === 'paid';
  const received = isPaid ? rounded : parseFloat(invoice.paidAmount) || 0;
  const balance = rounded - received;
  const subCount = items.filter(
    item => getItemType(item, invoiceType) === 'subscription',
  ).length;
  return {
    subtotal,
    taxableBase,
    discount,
    discountType,
    discountValue,
    discountAmt,
    discountRatio,
    afterDisc,
    taxRate,
    taxMode,
    tax,
    grandTotal,
    rounded,
    roundOff,
    received,
    balance,
    isPaid,
    subCount,
  };
};

export const getItemNetUSD = (item, invoice) => {
  const gross = (Number(item?.quantity) || 0) * (Number(item?.amount) || 0);
  const isSpecificDiscount = invoice?.discountMode === 'specific';
  return Math.max(
    0,
    gross - (isSpecificDiscount ? Number(item?.discount) || 0 : 0),
  );
};

export const computeTotalsUSD = invoice => {
  const items = invoice.items || [];
  const invoiceType = getInvoiceType(invoice);
  const taxRate = Math.max(0, Number(invoice.taxRate) || 0);
  const isSpecificDiscount = invoice.discountMode === 'specific';
  const itemNet = item => getItemNetUSD(item, invoice);
  const subtotal = round2(
    items.reduce((sum, item) => sum + itemNet(item), 0),
  );
  const { discountType, discountValue, discountAmount } = isSpecificDiscount
    ? {
        discountType: invoice.discountType || 'fixed',
        discountValue: 0,
        discountAmount: 0,
      }
    : getDiscountMeta(invoice, subtotal);
  const discount = round2(discountAmount);

  const taxable = round2(Math.max(0, subtotal - discount));
  const tax = round2((taxable * taxRate) / 100);
  const total = round2(taxable + tax);
  const oneTime = round2(
    items
      .filter(item => getItemType(item, invoiceType) === 'one-time')
      .reduce((sum, item) => sum + itemNet(item), 0),
  );
  const recurring = round2(
    items
      .filter(item => getItemType(item, invoiceType) === 'subscription')
      .reduce((sum, item) => sum + itemNet(item), 0),
  );
  const isPaid = invoice.paymentStatus === 'paid';
  const received = isPaid ? total : round2(Number(invoice.paidAmount) || 0);
  const balance = round2(total - received);
  const subCount = items.filter(
    item => getItemType(item, invoiceType) === 'subscription',
  ).length;
  return {
    subtotal,
    discount,
    discountType,
    discountValue,
    taxable,
    tax,
    taxRate,
    total,
    oneTime,
    recurring,
    received,
    balance,
    isPaid,
    subCount,
  };
};

export const computeInvoiceGrandTotal = invoice => {
  const isINR = (invoice?.currency || 'INR') !== 'USD';
  return isINR
    ? computeTotalsINR(invoice).rounded
    : computeTotalsUSD(invoice).total;
};
