function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function normalizeType(value = '') {
    return String(value).trim().toLowerCase();
}

function getInvoiceType(invoice = {}) {
    const rawType = normalizeType(invoice.type || invoice.invoiceType);
    if (['subscription', 'recurring'].includes(rawType)) {
        return 'subscription';
    }
    if (['one-time', 'one_time', 'onetime'].includes(rawType)) {
        return 'one-time';
    }
    return 'mixed';
}

function getItemType(item = {}, fallbackType = 'mixed') {
    const rawType = normalizeType(item.type || item.itemType);
    if (['subscription', 'recurring'].includes(rawType)) {
        return 'subscription';
    }
    if (['one-time', 'one_time', 'onetime'].includes(rawType)) {
        return 'one-time';
    }
    if ((item.description || '').toLowerCase().includes('subscription')) {
        return 'subscription';
    }
    if (fallbackType === 'subscription' || fallbackType === 'one-time') {
        return fallbackType;
    }
    return 'one-time';
}

function round2(value) {
    return Number((Number.isFinite(value) ? value : 0).toFixed(2));
}

function getDiscountMeta(invoice, subtotal) {
    const discountType = invoice.discountType === 'percentage' ? 'percentage' : 'fixed';
    const fallbackValue = Number(invoice.discount) || 0;
    const rawValue = invoice.discountValue !== undefined && Number(invoice.discountValue) > 0
        ? Number(invoice.discountValue)
        : fallbackValue;
    const discountValue = Math.max(0, rawValue);
    const discountAmount = discountType === 'percentage'
        ? Math.min(subtotal, (subtotal * discountValue) / 100)
        : Math.min(subtotal, discountValue);
    return {
        discountType,
        discountValue,
        discountAmount: Math.max(0, discountAmount),
    };
}

function computeTotalsINR(invoice) {
    const items = Array.isArray(invoice?.items) ? invoice.items : [];
    const invoiceType = getInvoiceType(invoice);
    const taxMode = invoice?.taxMode || 'all';
    const taxRate = (() => {
        const candidates = [invoice?.taxRate, invoice?.tax_rate, invoice?.gstRate, invoice?.gst_rate, invoice?.igstRate];
        for (const candidate of candidates) {
            const value = parseFloat(candidate);
            if (Number.isFinite(value) && value >= 0) {
                return value;
            }
        }
        const itemRate = parseFloat(items[0]?.taxRate ?? items[0]?.gstRate);
        return Number.isFinite(itemRate) && itemRate >= 0 ? itemRate : 0;
    })();
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
    const discountableBase = items.reduce((sum, item) => (item.applyDiscount !== false ? sum + (item.quantity * item.amount) : sum), 0);
    const { discountType, discountValue, discountAmount } = getDiscountMeta(invoice, discountableBase);
    const discount = discountValue;
    const discountAmt = discountAmount;
    const afterDisc = Math.max(0, subtotal - discountAmt);
    const discountRatio = discountableBase > 0 ? discountAmt / discountableBase : 0;
    const taxableBase = items.reduce((sum, item) => {
        const lineAmt = item.quantity * item.amount;
        const itemDiscount = item.applyDiscount !== false ? lineAmt * discountRatio : 0;
        const lineAfterDiscount = lineAmt - itemDiscount;
        const includeInTax = taxMode === 'specific' ? item.applyTax !== false : true;
        return includeInTax ? sum + lineAfterDiscount : sum;
    }, 0);
    const backTax = parseFloat(invoice?.tax ?? invoice?.totalTax ?? invoice?.totalGst ?? invoice?.totalGST);
    const tax = items.length ? (taxableBase * taxRate) / 100 : (Number.isFinite(backTax) && backTax > 0 ? backTax : 0);
    const backTotal = parseFloat(invoice?.total ?? invoice?.grandTotal ?? invoice?.amount);
    const grandTotal = items.length ? (afterDisc + tax) : (Number.isFinite(backTotal) && backTotal > 0 ? backTotal : 0);
    const rounded = Math.round(grandTotal);
    const roundOff = Number((grandTotal - rounded).toFixed(2));
    const isPaid = invoice?.paymentStatus === 'paid';
    const received = isPaid ? rounded : (parseFloat(invoice?.paidAmount) || 0);
    const balance = rounded - received;
    const subCount = items.filter(item => getItemType(item, invoiceType) === 'subscription').length;
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
}

function getItemNetUSD(item, invoice) {
    const gross = (Number(item?.quantity) || 0) * (Number(item?.amount) || 0);
    const isSpecificDiscount = invoice?.discountMode === 'specific';
    return Math.max(0, gross - (isSpecificDiscount ? (Number(item?.discount) || 0) : 0));
}

function computeTotalsUSD(invoice) {
    const items = Array.isArray(invoice?.items) ? invoice.items : [];
    const taxRate = Math.max(0, Number(invoice?.taxRate) || 0);
    const isSpecificDiscount = invoice?.discountMode === 'specific';
    const subtotal = round2(items.reduce((sum, item) => sum + getItemNetUSD(item, invoice), 0));
    const { discountType, discountValue, discountAmount } = isSpecificDiscount
        ? { discountType: invoice?.discountType || 'fixed', discountValue: 0, discountAmount: 0 }
        : getDiscountMeta(invoice, subtotal);
    const discount = round2(discountAmount);
    const taxable = round2(Math.max(0, subtotal - discount));
    const tax = round2((taxable * taxRate) / 100);
    const total = round2(taxable + tax);
    const isPaid = invoice?.paymentStatus === 'paid';
    const received = isPaid ? total : round2(Number(invoice?.paidAmount) || 0);
    const balance = round2(total - received);
    return {
        subtotal,
        discount,
        discountType,
        discountValue,
        taxable,
        tax,
        taxRate,
        total,
        received,
        balance,
        isPaid,
    };
}

export function computeInvoiceGrandTotal(invoice) {
    const isINR = (invoice?.currency || 'INR') !== 'USD';
    return isINR ? computeTotalsINR(invoice).rounded : computeTotalsUSD(invoice).total;
}

export function getStringValue(...values) {
    const value = values.find(candidate => typeof candidate === 'string' && candidate.trim().length > 0) ??
        values.find(candidate => typeof candidate === 'number' && Number.isFinite(candidate));
    return value === undefined || value === null ? '' : String(value).trim();
}

export function getNumberValue(...values) {
    for (const value of values) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = Number(value.replace(/[^0-9.-]/g, ''));
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }
    return 0;
}

export function getInvoiceCompanyId(invoice) {
    const company = asRecord(invoice?.company);
    const companyId = asRecord(invoice?.companyId);
    return getStringValue(company?._id, company?.id, invoice?.companyId?._id, invoice?.companyId?.id, invoice?.companyId, invoice?.clientCompanyId, invoice?.clientId, companyId?._id, companyId?.id);
}

export function getInvoiceCompanyName(invoice) {
    const company = asRecord(invoice?.company);
    return getStringValue(company?.companyName, company?.businessName, company?.legalName, company?.name, invoice?.companyName, invoice?.businessName, invoice?.clientName);
}

export function getInvoicePaymentStatus(invoice) {
    return getStringValue(invoice?.paymentStatus).toLowerCase();
}

export function getInvoiceCurrency(invoice) {
    return getStringValue(invoice?.currency, invoice?.currencyCode, 'USD').toUpperCase();
}

export function getInvoiceTotal(invoice) {
    return computeInvoiceGrandTotal(invoice);
}

export function getInvoiceOutstanding(invoice) {
    if (getInvoicePaymentStatus(invoice) === 'paid') {
        return 0;
    }
    const total = computeInvoiceGrandTotal(invoice);
    const paid = getNumberValue(invoice?.paidAmount);
    return Math.max(total - paid, 0);
}

export function getInvoiceBillingOutstanding(invoice) {
    if (getInvoicePaymentStatus(invoice) === 'paid') {
        return 0;
    }
    const explicitOutstanding = getNumberValue(invoice?.outstanding);
    if (explicitOutstanding > 0) {
        return explicitOutstanding;
    }
    return getInvoiceOutstanding(invoice);
}

export function getDaysUntilDue(value) {
    if (!value) {
        return null;
    }
    const dueDate = new Date(value);
    if (Number.isNaN(dueDate.getTime())) {
        return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return Math.round((dueDate.getTime() - today.getTime()) / 86400000);
}

export function isInvoiceOverdue(invoice) {
    if (getInvoicePaymentStatus(invoice) === 'paid') {
        return false;
    }
    if (!invoice?.dueDate) {
        return false;
    }
    const dueDate = new Date(invoice.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
        return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
}

export function isClientVisibleInvoice(invoice) {
    return getStringValue(invoice?.status).toLowerCase() !== 'draft';
}

export function filterInvoicesForCompany(invoices, companyId) {
    if (!Array.isArray(invoices)) {
        return [];
    }
    const visibleInvoices = invoices.filter(isClientVisibleInvoice);
    if (!companyId) {
        return visibleInvoices;
    }
    const normalizedCompanyId = String(companyId);
    return visibleInvoices.filter(invoice => getInvoiceCompanyId(invoice) === normalizedCompanyId);
}

export function sortInvoicesForDashboard(invoices) {
    return [...invoices].sort((a, b) => {
        const aDate = new Date(a?.invoiceDate ?? a?.createdAt ?? a?.dueDate ?? 0).getTime();
        const bDate = new Date(b?.invoiceDate ?? b?.createdAt ?? b?.dueDate ?? 0).getTime();
        return bDate - aDate;
    });
}

export function mapRecentInvoice(invoice) {
    const paymentStatus = getInvoicePaymentStatus(invoice);
    const overdue = isInvoiceOverdue(invoice);
    const status = paymentStatus === 'paid'
        ? 'paid'
        : overdue
            ? 'overdue'
            : paymentStatus === 'partial'
                ? 'partial'
                : 'unpaid';
    const statusText = status === 'paid'
        ? 'Paid'
        : status === 'overdue'
            ? 'Overdue'
            : status === 'partial'
                ? 'Partial'
                : 'Unpaid';
    const items = Array.isArray(invoice?.items) ? invoice.items : [];
    const firstItem = asRecord(items[0]);
    return {
        id: getStringValue(invoice?._id, invoice?.id, invoice?.invoiceNumber, invoice?.invoiceNo, invoice?.number),
        invoiceNumber: getStringValue(invoice?.invoiceNumber, invoice?.invoiceNo, invoice?.number, invoice?._id, invoice?.id) || 'Invoice',
        company: getInvoiceCompanyName(invoice) || 'Unknown Company',
        service: getStringValue(firstItem?.description, firstItem?.name, firstItem?.title, invoice?.service, 'Invoice Services'),
        amount: computeInvoiceGrandTotal(invoice),
        outstanding: getInvoiceOutstanding(invoice),
        currency: getInvoiceCurrency(invoice),
        invoiceDate: getStringValue(invoice?.invoiceDate, invoice?.createdAt, invoice?.created_at),
        dueDate: getStringValue(invoice?.dueDate, invoice?.due),
        status,
        statusText,
        daysUntilDue: paymentStatus === 'paid' ? null : getDaysUntilDue(invoice?.dueDate),
        raw: invoice,
    };
}

export function computeBillingTotals(invoices) {
    const totals = {
        paidUSD: 0,
        paidINR: 0,
        unpaidUSD: 0,
        unpaidINR: 0,
        totalUSD: 0,
        totalINR: 0,
    };
    (Array.isArray(invoices) ? invoices : []).forEach(invoice => {
        const currency = getInvoiceCurrency(invoice);
        const total = computeInvoiceGrandTotal(invoice);
        const unpaid = getInvoiceBillingOutstanding(invoice);
        const paid = Math.max(total - unpaid, 0);
        if (currency === 'INR') {
            totals.paidINR += paid;
            totals.unpaidINR += unpaid;
            totals.totalINR += total;
        }
        else {
            totals.paidUSD += paid;
            totals.unpaidUSD += unpaid;
            totals.totalUSD += total;
        }
    });
    return totals;
}

export function formatCurrency(value, currency = 'USD') {
    const amount = getNumberValue(value);
    const minimumFractionDigits = currency === 'INR' ? 0 : 2;
    try {
        return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits,
            maximumFractionDigits: 2,
        }).format(amount);
    }
    catch {
        return `${currency === 'INR' ? '₹' : '$'}${amount.toFixed(2)}`;
    }
}
