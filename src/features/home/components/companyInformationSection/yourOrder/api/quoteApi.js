import axios from 'axios';
import { API_BASE_URL } from '../../../../../../config/api';

const API_REQUEST_TIMEOUT_MS = 10000;

function getAuthHeaders(token) {
  return token
    ? { Authorization: `Bearer ${token}`, 'x-auth-token': token }
    : {};
}

/**
 * Admin se quote fetch - GET /api/company-signup/quote/:companyId (primary)
 * Dummy hata diya gaya - sirf real API data return hoga, nahi to null/error
 */
export async function fetchQuote({ companyId, token, invoiceId } = {}) {
  if (!companyId && !invoiceId) {
    return { quote: null, isSuccess: false, error: 'companyId required' };
  }

  const endpoints = [
    companyId ? `${API_BASE_URL}/api/company-signup/quote/${companyId}` : null,
    companyId ? `${API_BASE_URL}/api/quotes/${companyId}` : null,
    invoiceId ? `${API_BASE_URL}/api/quotes/invoice/${invoiceId}` : null,
    companyId ? `${API_BASE_URL}/api/admin/quote/${companyId}` : null,
  ].filter(Boolean);

  let lastError = '';
  for (const url of endpoints) {
    try {
      const { data } = await axios.get(url, {
        timeout: API_REQUEST_TIMEOUT_MS,
        headers: { ...getAuthHeaders(token) },
      });
      const raw = data?.quote || data?.data?.quote || data?.data || data?.result || data || null;
      const isQuoteObject =
        raw && typeof raw === 'object' && (raw.total != null || raw.totalAmount != null || raw.amount != null || raw.companyVista || raw.quoteId || raw._id || raw.companyId);
      if (isQuoteObject) {
        return {
          quote: normalizeQuote(raw, companyId),
          isSuccess: true,
          error: '',
        };
      }
      lastError = data?.message || 'Quote not found';
    } catch (err) {
      lastError = err?.response?.data?.message || err?.message || 'Network error';
    }
  }

  return {
    quote: null,
    isSuccess: false,
    error: lastError || 'Quote not available',
  };
}

function normalizeQuote(raw, companyId) {
  const companyVistaTotal = Number(raw.companyVistaTotal ?? raw.companyVista?.total ?? raw.serviceAmount ?? raw.serviceFee ?? 0);
  const thirdPartyTotal = Number(raw.thirdPartyTotal ?? raw.thirdParty?.total ?? raw.governmentAmount ?? raw.govtFee ?? 0);
  const total = Number(raw.total ?? raw.totalAmount ?? raw.amount ?? raw.grandTotal ?? raw.finalAmount ?? companyVistaTotal + thirdPartyTotal) || 0;

  const normalizeItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) return [];
    return items.map((it) => ({
      label: it.label || it.title || it.name || 'Item',
      desc: it.desc || it.description || it.detail || '',
      amount: Number(it.amount ?? it.price ?? it.fee ?? 0),
      included: it.included ?? Number(it.amount ?? it.price ?? 0) === 0,
    }));
  };

  const cvItems = normalizeItems(raw.companyVista?.items || raw.serviceItems || raw.breakdown?.companyVista);
  const tpItems = normalizeItems(raw.thirdParty?.items || raw.govtItems || raw.breakdown?.thirdParty);

  return {
    quoteId: raw.quoteId || raw.id || raw._id || '',
    companyId: companyId || raw.companyId || raw.company_id || null,
    currency: raw.currency || raw.baseCurrency || 'EUR',
    validUntil: raw.validUntil || raw.validTill || raw.expiryDate || '',
    daysRemaining: raw.daysRemaining ?? raw.daysLeft ?? null,
    preparedBy: raw.preparedBy || raw.prepared_by || '',
    preparedByRole: raw.preparedByRole || raw.prepared_by_role || '',
    preparedAt: raw.preparedAt || raw.createdAt || '',
    companyVista: { total: companyVistaTotal, items: cvItems },
    thirdParty: { total: thirdPartyTotal, items: tpItems },
    total,
    vat: raw.vat ?? raw.tax ?? 0,
    vatNote: raw.vatNote || raw.taxNote || 'reverse charge',
    whatsIncluded: raw.whatsIncluded || raw.included || [],
    noteForCustomer: raw.noteForCustomer || raw.note || raw.customerNote || '',
    status: raw.status || (total > 0 ? 'ready' : 'preparing'),
    raw,
  };
}

/**
 * Check if quote is filled (admin ne amount bheja hai)
 */
export function isQuoteReady(quote) {
  return Boolean(quote && (Number(quote.total) > 0 || Number(quote.totalAmount) > 0));
}

/**
 * Quote change request - POST /quote/:companyId/messages
 * Router: router.post('/quote/:companyId/messages', requestQuoteChange)
 * Backend expects: { clientId, text, reasons[] }
 * - text: required string
 * - clientId: required, must belong to company
 * - reasons: optional array of strings (category)
 */
export async function requestQuoteChange({ companyId, token, clientId, text, reasons, message, category } = {}) {
  // backward compat: allow `message` as `text`, `category` as single reason
  const finalText = text ?? message ?? '';
  const finalReasons = Array.isArray(reasons) ? reasons : category ? [category] : [];

  if (!companyId) {
    return { isSuccess: false, error: 'companyId required', data: null };
  }
  if (!clientId) {
    return { isSuccess: false, error: 'clientId required', data: null };
  }
  if (!finalText || !String(finalText).trim()) {
    return { isSuccess: false, error: 'Message is required', data: null };
  }

  const body = {
    clientId: String(clientId),
    text: String(finalText).trim(),
    reasons: finalReasons.map(r => String(r).trim()).filter(Boolean),
  };

  const endpoints = [
    `${API_BASE_URL}/api/quote/${companyId}/messages`,
    `${API_BASE_URL}/quote/${companyId}/messages`,
    `${API_BASE_URL}/api/company-signup/quote/${companyId}/messages`,
    `${API_BASE_URL}/api/quotes/${companyId}/messages`,
  ];

  let lastError = '';
  for (const url of endpoints) {
    try {
      const { data } = await axios.post(url, body, {
        timeout: API_REQUEST_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(token) },
      });
      // success if 2xx
      return {
        isSuccess: true,
        error: '',
        data: data?.data || data?.result || data || null,
        message: data?.message || 'Message sent successfully',
      };
    } catch (err) {
      const status = err?.response?.status;
      // if 404, try next endpoint; otherwise return error immediately for 400/401/403
      lastError = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Network error';
      // continue to next endpoint only on 404, else break
      if (status && status !== 404) {
        return { isSuccess: false, error: lastError, data: null };
      }
    }
  }

  return { isSuccess: false, error: lastError || 'Failed to send message', data: null };
}

/**
 * Accept quote - POST /quote/:companyId/accept
 * Router: router.post('/quote/:companyId/accept', acceptQuote)
 * Body: { clientId }
 * Success: { success: true, message: 'Quote accepted, proceed to payment', totalAmount }
 */
export async function acceptQuote({ companyId, token, clientId } = {}) {
  if (!companyId) {
    return { isSuccess: false, error: 'companyId required', data: null };
  }

  const body = clientId ? { clientId: String(clientId) } : {};

  const endpoints = [
    `${API_BASE_URL}/api/quote/${companyId}/accept`,
    `${API_BASE_URL}/quote/${companyId}/accept`,
    `${API_BASE_URL}/api/company-signup/quote/${companyId}/accept`,
    `${API_BASE_URL}/api/quotes/${companyId}/accept`,
  ];

  let lastError = '';
  for (const url of endpoints) {
    try {
      const { data } = await axios.post(url, body, {
        timeout: API_REQUEST_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(token) },
      });
      const success = data?.success ?? data?.isSuccess ?? true;
      if (success || data?.success === true) {
        return {
          isSuccess: true,
          error: '',
          data: data?.data || data || null,
          message: data?.message || 'Quote accepted, proceed to payment',
          totalAmount: data?.totalAmount ?? data?.data?.totalAmount ?? null,
        };
      }
      lastError = data?.message || 'Failed to accept quote';
    } catch (err) {
      const status = err?.response?.status;
      lastError = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Network error';
      if (status && status !== 404) {
        return { isSuccess: false, error: lastError, data: null };
      }
    }
  }

  return { isSuccess: false, error: lastError || 'Failed to accept quote', data: null };
}

/**
 * Decline quote - POST /quote/:companyId/decline
 * Router: router.post('/quote/:companyId/decline', declineQuote)
 * Body: { clientId, reason }
 * Success: { success: true, message: 'Quote declined' }
 */
export async function declineQuote({ companyId, token, clientId, reason } = {}) {
  if (!companyId) {
    return { isSuccess: false, error: 'companyId required', data: null };
  }

  const body = {};
  if (clientId) body.clientId = String(clientId);
  if (reason && String(reason).trim()) body.reason = String(reason).trim();

  const endpoints = [
    `${API_BASE_URL}/api/quote/${companyId}/decline`,
    `${API_BASE_URL}/quote/${companyId}/decline`,
    `${API_BASE_URL}/api/company-signup/quote/${companyId}/decline`,
    `${API_BASE_URL}/api/quotes/${companyId}/decline`,
  ];

  let lastError = '';
  for (const url of endpoints) {
    try {
      const { data } = await axios.post(url, body, {
        timeout: API_REQUEST_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(token) },
      });
      const success = data?.success ?? data?.isSuccess ?? true;
      if (success || data?.success === true) {
        // backend may return quote in data
        const returnedQuote = data?.data?.quote || data?.quote || data?.data || null;
        return {
          isSuccess: true,
          error: '',
          data: data?.data || data || null,
          quote: returnedQuote ? normalizeQuote(returnedQuote, companyId) : null,
          message: data?.message || 'Quote declined',
        };
      }
      lastError = data?.message || 'Failed to decline quote';
    } catch (err) {
      const status = err?.response?.status;
      lastError = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Network error';
      if (status && status !== 404) {
        return { isSuccess: false, error: lastError, data: null };
      }
    }
  }

  return { isSuccess: false, error: lastError || 'Failed to decline quote', data: null };
}

// ---- Currency helpers: jo currency admin bhejega usi se convert hoga ----
export const RATES = { EUR_TO_USD: 1.08, EUR_TO_INR: 90.16 };
const SYMBOL = { EUR: '€', USD: '$', INR: '₹' };
const LOCALE = { EUR: 'de-DE', USD: 'en-US', INR: 'en-IN' };

function toEUR(amount, from) {
  const c = String(from || 'EUR').toUpperCase();
  if (c === 'USD') return amount / RATES.EUR_TO_USD;
  if (c === 'INR') return amount / RATES.EUR_TO_INR;
  return amount;
}
function fromEUR(eur, to) {
  const c = String(to || 'EUR').toUpperCase();
  if (c === 'USD') return eur * RATES.EUR_TO_USD;
  if (c === 'INR') return eur * RATES.EUR_TO_INR;
  return eur;
}

export function convertAmount(amount, fromCurrency, toCurrency) {
  const from = String(fromCurrency || 'EUR').toUpperCase();
  const to = String(toCurrency || 'EUR').toUpperCase();
  if (from === to) return amount;
  const eur = toEUR(Number(amount) || 0, from);
  return fromEUR(eur, to);
}

export function formatCurrency(amount, currency) {
  const cur = String(currency || 'EUR').toUpperCase();
  const sym = SYMBOL[cur] || '€';
  const locale = LOCALE[cur] || 'de-DE';
  return `${sym}${Math.round(amount).toLocaleString(locale)}`;
}

export function formatConverted(amount, fromCurrency, toCurrency) {
  return formatCurrency(convertAmount(amount, fromCurrency, toCurrency), toCurrency);
}


