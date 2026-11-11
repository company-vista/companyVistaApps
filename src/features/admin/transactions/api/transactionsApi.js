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

export async function fetchAdminTransactions({ token, filters }) {
  const params = {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
  if (filters.search) params.search = filters.search;
  if (filters.status !== 'all') params.status = filters.status;
  if (filters.type !== 'all') params.type = filters.type;
  if (filters.paymentMethod !== 'all') {
    params.paymentMethod = filters.paymentMethod;
  }
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const response = await request(
    { method: 'get', url: `${API_ROOT}/transactions/`, params },
    token,
  );
  const transactions = extractList(response, 'transactions', 'transactions');
  return {
    transactions,
    pagination: response.data?.pagination || {
      total: transactions.length,
      pages: Math.max(1, Math.ceil(transactions.length / filters.limit)),
      currentPage: filters.page,
    },
  };
}

export async function fetchTransactionCompanies(token) {
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

export async function fetchCompanyInvoices({ token, companyId }) {
  if (!companyId) return [];
  const response = await request(
    {
      method: 'get',
      url: `${API_ROOT}/invoices`,
      params: { company: companyId, limit: 100, sort: '-createdAt' },
    },
    token,
  );
  return extractList(response, 'invoices', 'invoices');
}

export async function fetchAdminTransaction({ token, id }) {
  if (!id) throw new Error('Transaction ID is missing.');
  const response = await request(
    { method: 'get', url: `${API_ROOT}/transactions/${encodeURIComponent(id)}` },
    token,
  );
  const transaction = response.data?.data || response.data;
  if (!transaction || typeof transaction !== 'object') {
    throw new Error('Invalid transaction response from the server.');
  }
  return transaction;
}

export async function createAdminTransaction({ token, payload }) {
  const response = await request(
    {
      method: 'post',
      url: `${API_ROOT}/transactions/`,
      data: payload,
    },
    token,
  );
  return response.data?.data || response.data;
}

export async function updateAdminTransaction({ token, id, payload }) {
  if (!id) throw new Error('Transaction ID is missing.');
  const response = await request(
    {
      method: 'put',
      url: `${API_ROOT}/transactions/${encodeURIComponent(id)}`,
      data: payload,
    },
    token,
  );
  return response.data?.data || response.data;
}

export async function deleteAdminTransaction({ token, id }) {
  if (!id) throw new Error('Transaction ID is missing.');
  const response = await request(
    {
      method: 'delete',
      url: `${API_ROOT}/transactions/${encodeURIComponent(id)}`,
    },
    token,
  );
  return response.data;
}
