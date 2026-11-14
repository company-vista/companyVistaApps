import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const CHANGE_REQUESTS_URL = `${API_BASE_URL}/api/admin/change-requests`;
const REQUEST_TIMEOUT_MS = 20000;

const getHeaders = token => {
  if (!token) {
    throw new Error('Admin authentication is required to load change requests.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'x-auth-token': token,
  };
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const request = async (config, token) => {
  try {
    const response = await axios({
      timeout: REQUEST_TIMEOUT_MS,
      ...config,
      headers: { ...getHeaders(token), ...(config.headers || {}) },
    });
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'The request failed.');
    }
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to load change requests.'));
  }
};

export async function fetchAdminChangeRequests({ token, status, company } = {}) {
  const data = await request(
    {
      method: 'get',
      url: CHANGE_REQUESTS_URL,
      params: {
        ...(status && status !== 'all' ? { status } : {}),
        ...(company ? { company } : {}),
      },
    },
    token,
  );

  if (!Array.isArray(data?.data)) {
    throw new Error('Invalid change requests response from the server.');
  }

  return data.data;
}

export async function fetchAdminChangeRequest({ token, id } = {}) {
  if (!id) {
    throw new Error('Change request ID is missing.');
  }
  const data = await request(
    { method: 'get', url: `${CHANGE_REQUESTS_URL}/${encodeURIComponent(id)}` },
    token,
  );
  if (!data?.data || typeof data.data !== 'object') {
    throw new Error('Change request details were not found.');
  }
  return data.data;
}

export async function updateAdminChangeRequest({ token, id, status, adminNote } = {}) {
  if (!id) {
    throw new Error('Change request ID is missing.');
  }
  const data = await request(
    {
      method: 'put',
      url: `${CHANGE_REQUESTS_URL}/${encodeURIComponent(id)}`,
      data: {
        ...(status ? { status } : {}),
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
    },
    token,
  );
  if (!data?.data || typeof data.data !== 'object') {
    throw new Error('Invalid change request update response from the server.');
  }
  return data.data;
}

export async function sendAdminChangeRequestMessage({ token, id, message } = {}) {
  if (!id) {
    throw new Error('Change request ID is missing.');
  }
  if (!String(message || '').trim()) {
    throw new Error('Message is required.');
  }
  const data = await request(
    {
      method: 'post',
      url: `${CHANGE_REQUESTS_URL}/${encodeURIComponent(id)}/messages`,
      data: { message: String(message).trim() },
    },
    token,
  );
  if (!data?.data || typeof data.data !== 'object') {
    throw new Error('Invalid change request reply response from the server.');
  }
  return data.data;
}
