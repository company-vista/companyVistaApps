import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const API_ROOT = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT_MS = 20000;

function getHeaders(token) {
  if (!token) {
    throw new Error('Auth token missing. Please login again.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'x-auth-token': token,
  };
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}

async function request(config, token) {
  try {
    return await axios({
      timeout: REQUEST_TIMEOUT_MS,
      ...config,
      headers: {
        ...getHeaders(token),
        ...(config.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

function extractList(response, key, label) {
  const data = response.data?.data || response.data?.[key] || response.data;
  if (!Array.isArray(data)) {
    throw new Error(`Invalid ${label} response from the server.`);
  }
  return data;
}

export async function fetchInvoiceCompanies(token) {
  const response = await request(
    {
      method: 'get',
      url: `${API_ROOT}/companies`,
      params: { limit: 1000, sort: 'companyName' },
    },
    token,
  );
  return extractList(response, 'companies', 'companies');
}

export async function fetchInvoicePlans(token) {
  const response = await request(
    { method: 'get', url: `${API_ROOT}/plans` },
    token,
  );
  return extractList(response, 'plans', 'plans').filter(
    plan => plan.isActive !== false,
  );
}

export async function fetchAdminInvoices({ token, filters }) {
  const params = {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
  [
    'search',
    'status',
    'paymentStatus',
    'currency',
    'invoiceKind',
    'dateRange',
    'company',
    'companyName',
  ].forEach(key => {
    if (filters[key] && filters[key] !== 'all') params[key] = filters[key];
  });

  const response = await request(
    {
      method: 'get',
      url: `${API_ROOT}/invoices`,
      params,
    },
    token,
  );
  const data = response.data?.data;
  if (!Array.isArray(data)) {
    throw new Error('Invalid invoices response from the server.');
  }

  const responsePagination = response.data?.pagination || {};
  const responseStats = response.data?.stats || {};
  const total =
    response.data?.total ??
    responsePagination.total ??
    responseStats.totalInvoices ??
    response.data?.count ??
    data.length;
  const pages =
    response.data?.pages ??
    responsePagination.pages ??
    Math.max(1, Math.ceil(Number(total) / filters.limit));

  return {
    invoices: data,
    stats: responseStats,
    pagination: {
      total: Number(total) || 0,
      pages: Number(pages) || 1,
      currentPage:
        Number(response.data?.page ?? responsePagination.currentPage) ||
        filters.page,
    },
  };
}

export async function fetchAdminInvoice({ token, id }) {
  if (!id) throw new Error('Invoice ID is missing.');
  const response = await request(
    {
      method: 'get',
      url: `${API_ROOT}/invoices/${encodeURIComponent(id)}`,
    },
    token,
  );
  const invoice = response.data?.data || response.data;
  if (!invoice || typeof invoice !== 'object' || Array.isArray(invoice)) {
    throw new Error('Invalid invoice response from the server.');
  }
  return invoice;
}

export async function updateAdminInvoice({ id, payload, token }) {
  if (!id) throw new Error('Invoice ID is missing.');
  const response = await request(
    {
      method: 'put',
      url: `${API_ROOT}/invoices/${encodeURIComponent(id)}`,
      data: payload,
    },
    token,
  );
  return response.data;
}

export async function saveAdminInvoice({ payload, token }) {
  const response = await request(
    {
      method: 'post',
      url: `${API_ROOT}/invoices`,
      data: payload,
    },
    token,
  );
  return response.data;
}
