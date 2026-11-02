import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const API_ROOT = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT_MS = 20000;

const getHeaders = token => {
  if (!token) throw new Error('Auth token missing. Please login again.');
  return {
    Authorization: `Bearer ${token}`,
    'x-auth-token': token,
  };
};

const getErrorMessage = error =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'Something went wrong. Please try again.';

const request = async (config, token) => {
  try {
    return await axios({
      timeout: REQUEST_TIMEOUT_MS,
      ...config,
      headers: { ...getHeaders(token), ...(config.headers || {}) },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

const extractData = (response, label) => {
  const data = response.data?.data;
  if (!Array.isArray(data)) {
    throw new Error(`Invalid ${label} response from the server.`);
  }
  return data;
};

export async function fetchAdminExpenses({ token, filters = {} }) {
  const params = { limit: 1000, sort: '-expenseDate' };
  if (filters.status) params.status = filters.status;
  if (filters.expenseHeadId) params.expenseHeadId = filters.expenseHeadId;
  if (filters.startDate || filters.endDate) {
    params.expenseDate = {};
    if (filters.startDate) {
      params.expenseDate.gte = new Date(`${filters.startDate}T00:00:00`).toISOString();
    }
    if (filters.endDate) {
      params.expenseDate.lte = new Date(`${filters.endDate}T23:59:59.999`).toISOString();
    }
  }
  const response = await request(
    { method: 'get', url: `${API_ROOT}/expenses`, params },
    token,
  );
  return extractData(response, 'expenses');
}

export async function fetchAdminExpense({ token, id }) {
  if (!id) throw new Error('Expense ID is missing.');
  const response = await request(
    { method: 'get', url: `${API_ROOT}/expenses/${encodeURIComponent(id)}` },
    token,
  );
  const expense = response.data?.data;
  if (!expense || typeof expense !== 'object') {
    throw new Error('Invalid expense response from the server.');
  }
  return expense;
}

export async function createAdminExpense({ token, payload }) {
  const response = await request(
    { method: 'post', url: `${API_ROOT}/expenses`, data: payload },
    token,
  );
  return response.data;
}

export async function updateAdminExpense({ token, id, payload }) {
  if (!id) throw new Error('Expense ID is missing.');
  const response = await request(
    {
      method: 'put',
      url: `${API_ROOT}/expenses/${encodeURIComponent(id)}`,
      data: payload,
    },
    token,
  );
  return response.data;
}

export async function deleteAdminExpense({ token, id }) {
  if (!id) throw new Error('Expense ID is missing.');
  const response = await request(
    { method: 'delete', url: `${API_ROOT}/expenses/${encodeURIComponent(id)}` },
    token,
  );
  return response.data;
}

export async function fetchExpenseHeads(token) {
  const response = await request(
    { method: 'get', url: `${API_ROOT}/expenseHead` },
    token,
  );
  return extractData(response, 'expense heads');
}

export async function createExpenseHead({ token, payload }) {
  const response = await request(
    { method: 'post', url: `${API_ROOT}/expenseHead`, data: payload },
    token,
  );
  return response.data;
}

export async function updateExpenseHead({ token, id, payload }) {
  if (!id) throw new Error('Expense head ID is missing.');
  const response = await request(
    {
      method: 'patch',
      url: `${API_ROOT}/expenseHead/${encodeURIComponent(id)}`,
      data: payload,
    },
    token,
  );
  return response.data;
}

export async function deleteExpenseHead({ token, id }) {
  if (!id) throw new Error('Expense head ID is missing.');
  const response = await request(
    {
      method: 'delete',
      url: `${API_ROOT}/expenseHead/${encodeURIComponent(id)}`,
    },
    token,
  );
  return response.data;
}
