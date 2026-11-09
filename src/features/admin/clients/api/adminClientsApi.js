import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const CLIENTS_URL = `${API_BASE_URL}/api/clients`;
const REQUEST_TIMEOUT_MS = 20000;

const getHeaders = token => {
  if (!token) {
    throw new Error('Admin authentication is required to load clients.');
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
    throw new Error(getErrorMessage(error, 'Unable to load clients.'));
  }
};

export async function fetchAdminClients({
  token,
  page = 1,
  limit = 15,
  search = '',
  status = 'all',
  itinStatus = 'all',
}) {
  const data = await request(
    {
      method: 'get',
      url: CLIENTS_URL,
      params: {
        page,
        limit,
        sortBy: 'name',
        sortOrder: 'asc',
        ...(search ? { search } : {}),
        ...(status !== 'all' ? { status } : {}),
        ...(itinStatus !== 'all' ? { itinStatus } : {}),
      },
    },
    token,
  );

  if (!Array.isArray(data?.data)) {
    throw new Error('Invalid clients response from the server.');
  }

  return {
    clients: data.data.map(client => ({
      ...client,
      name: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
      phone: client.phoneNumber || '',
      status: client.status || 'active',
    })),
    pagination: data.pagination ?? {
      total: data.data.length,
      pages: 1,
      page,
    },
  };
}

export async function fetchAdminClientStats({ token }) {
  const data = await request(
    { method: 'get', url: `${CLIENTS_URL}/stats` },
    token,
  );
  if (!data?.stats || typeof data.stats !== 'object') {
    throw new Error('Invalid client statistics response from the server.');
  }
  return data.stats;
}

export async function fetchAdminClient({ token, id }) {
  if (!id) {
    throw new Error('Client ID is missing.');
  }
  const data = await request(
    { method: 'get', url: `${CLIENTS_URL}/${encodeURIComponent(id)}` },
    token,
  );
  if (!data?.data || typeof data.data !== 'object') {
    throw new Error('Client details were not found.');
  }
  return data.data;
}

export async function fetchAdminClientCompanies({ token, id }) {
  if (!id) {
    throw new Error('Client ID is missing.');
  }
  const data = await request(
    {
      method: 'get',
      url: `${API_BASE_URL}/api/companies/shareholder/companies`,
      params: { shareholder: id },
    },
    token,
  );
  if (!Array.isArray(data?.data)) {
    throw new Error('Invalid client companies response from the server.');
  }
  return data.data.map(company => ({
    ...company,
    registrationStatus: company.registrationStatus ?? company.status,
    countryOfIncorporation:
      company.countryOfIncorporation ?? company.country,
    stateOfRegistration: company.stateOfRegistration ?? company.state,
  }));
}

export async function createAdminClient({ token, payload }) {
  const data = await request(
    {
      method: 'post',
      url: CLIENTS_URL,
      data: payload,
    },
    token,
  );
  const client = data?.data;
  if (!client || typeof client !== 'object') {
    throw new Error('Invalid client creation response from the server.');
  }
  return client;
}

export async function updateAdminClient({ token, id, payload }) {
  if (!id) {
    throw new Error('Client ID is missing.');
  }
  const data = await request(
    {
      method: 'put',
      url: `${CLIENTS_URL}/${encodeURIComponent(id)}`,
      data: payload,
    },
    token,
  );
  if (!data?.data || typeof data.data !== 'object') {
    throw new Error('Invalid client update response from the server.');
  }
  return data.data;
}

export async function deleteAdminClient({ token, id }) {
  if (!id) {
    throw new Error('Client ID is missing.');
  }
  await request(
    {
      method: 'delete',
      url: `${CLIENTS_URL}/${encodeURIComponent(id)}`,
    },
    token,
  );
}

export async function uploadAdminClientItinLetter({ token, id, file }) {
  if (!id) {
    throw new Error('Client ID is missing.');
  }
  if (!file?.uri) {
    throw new Error('Select an ITIN letter before uploading.');
  }
  const formData = new FormData();
  formData.append('itinLetter', {
    uri: file.uri,
    name: file.name || 'itin-letter',
    type: file.type || 'application/octet-stream',
  });
  await request(
    {
      method: 'post',
      url: `${CLIENTS_URL}/${encodeURIComponent(id)}/documents/itin-letter`,
      data: formData,
    },
    token,
  );
}
