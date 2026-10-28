import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const API_ROOT = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT_MS = 20000;

function buildHeaders(token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['x-auth-token'] = token;
  }
  return headers;
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
  if (!token) {
    throw new Error('Auth token missing. Please login again.');
  }
  try {
    const response = await axios({
      timeout: REQUEST_TIMEOUT_MS,
      ...config,
      headers: {
        ...buildHeaders(token),
        ...(config.headers || {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export function fetchDashboardStats(token) {
  return request({ method: 'get', url: `${API_ROOT}/dashboard/stats` }, token);
}

export function fetchDashboardInvoices(token) {
  return request(
    {
      method: 'get',
      url: `${API_ROOT}/invoices`,
      params: {
        limit: 1000,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    },
    token,
  );
}

export function fetchDashboardCompanies(token) {
  return request({ method: 'get', url: `${API_ROOT}/companies` }, token);
}

export async function fetchAdminOverview(token) {
  const [statsResult, invoicesResult, companiesResult] = await Promise.allSettled(
    [
      fetchDashboardStats(token),
      fetchDashboardInvoices(token),
      fetchDashboardCompanies(token),
    ],
  );

  const errors = [statsResult, invoicesResult, companiesResult]
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);

  return {
    stats: statsResult.status === 'fulfilled' ? statsResult.value : null,
    invoices:
      invoicesResult.status === 'fulfilled' ? invoicesResult.value : null,
    companies:
      companiesResult.status === 'fulfilled' ? companiesResult.value : null,
    errors,
  };
}
