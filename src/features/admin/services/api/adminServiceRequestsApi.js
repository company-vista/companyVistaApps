import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const SERVICE_REQUESTS_URL = `${API_BASE_URL}/api/admin/service-requests`;
const REQUEST_TIMEOUT_MS = 20000;

const getHeaders = token => {
  if (!token) {
    throw new Error('Admin authentication is required to load service requests.');
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
    throw new Error(getErrorMessage(error, 'Unable to load service requests.'));
  }
};

export async function fetchAdminServiceRequests({ token, status, company } = {}) {
  const data = await request(
    {
      method: 'get',
      url: SERVICE_REQUESTS_URL,
      params: {
        ...(status && status !== 'all' ? { status } : {}),
        ...(company ? { company } : {}),
      },
    },
    token,
  );

  if (!Array.isArray(data?.data)) {
    throw new Error('Invalid service requests response from the server.');
  }

  return data.data;
}

export async function updateAdminServiceRequest({ token, id, status, adminNote } = {}) {
  if (!id) {
    throw new Error('Service request ID is missing.');
  }
  const data = await request(
    {
      method: 'put',
      url: `${SERVICE_REQUESTS_URL}/${encodeURIComponent(id)}`,
      data: {
        ...(status ? { status } : {}),
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
    },
    token,
  );
  if (!data?.data || typeof data.data !== 'object') {
    throw new Error('Invalid service request update response from the server.');
  }
  return data.data;
}
