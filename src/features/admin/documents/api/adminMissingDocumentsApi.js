import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const API_ROOT = `${API_BASE_URL}/api/documents`;
const REQUEST_TIMEOUT_MS = 20000;

const getHeaders = token => {
  if (!token) {
    throw new Error('Auth token missing. Please login again.');
  }
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
      headers: {
        ...getHeaders(token),
        ...(config.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export async function fetchCompaniesWithoutDocuments(token) {
  const response = await request(
    { method: 'get', url: `${API_ROOT}/companies/without-documents` },
    token,
  );
  const companies = response.data?.data || [];
  if (!Array.isArray(companies)) {
    throw new Error(
      'Invalid companies without documents response from the server.',
    );
  }
  return {
    companies,
    totalCompanies: Number(response.data?.totalCompanies ?? companies.length),
  };
}

export async function setMissingDocumentFlag({ token, companyId, flagged }) {
  if (!companyId) {
    throw new Error('Company ID is missing.');
  }
  const response = await request(
    {
      method: 'patch',
      url: `${API_ROOT}/companies/${encodeURIComponent(
        companyId,
      )}/missing-document-flag`,
      data: { flagged },
    },
    token,
  );
  return response.data;
}
