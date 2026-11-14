import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const ITIN_APPLICATIONS_URL = `${API_BASE_URL}/api/itin-applications`;
const REQUEST_TIMEOUT_MS = 20000;

const getHeaders = token => {
  if (!token) {
    throw new Error('Admin authentication is required to load ITIN applications.');
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
    throw new Error(getErrorMessage(error, 'Unable to load ITIN applications.'));
  }
};

export async function fetchAdminItinApplications({
  token,
  status = 'all',
  search = '',
  page = 1,
  limit = 200,
} = {}) {
  const data = await request(
    {
      method: 'get',
      url: ITIN_APPLICATIONS_URL,
      params: {
        page,
        limit,
        ...(status && status !== 'all' ? { status } : {}),
        ...(search ? { search } : {}),
      },
    },
    token,
  );

  if (!Array.isArray(data?.data)) {
    throw new Error('Invalid ITIN applications response from the server.');
  }

  return {
    applications: data.data,
    pagination: data.pagination ?? {
      total: data.data.length,
      page,
      pages: 1,
    },
  };
}

export async function updateAdminItinApplication({ token, id, payload } = {}) {
  if (!id) {
    throw new Error('ITIN application ID is missing.');
  }
  const data = await request(
    {
      method: 'patch',
      url: `${ITIN_APPLICATIONS_URL}/${encodeURIComponent(id)}`,
      data: payload || {},
    },
    token,
  );
  if (!data?.data || typeof data.data !== 'object') {
    throw new Error('Invalid ITIN application update response from the server.');
  }
  return data.data;
}
