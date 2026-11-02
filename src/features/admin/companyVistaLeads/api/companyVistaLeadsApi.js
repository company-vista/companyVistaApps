import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const ADMIN_LEADS_URL = `${API_BASE_URL}/api/service`;

export async function fetchCompanyVistaLeads(
  token,
  { page = 1, limit = 10, channel = '', search = '' } = {},
) {
  if (!token) {
    throw new Error('Admin authentication is required to load Vista leads.');
  }

  try {
    const response = await axios.get(ADMIN_LEADS_URL, {
      params: {
        page,
        limit,
        ...(channel ? { channel } : {}),
        ...(search ? { search } : {}),
      },
      timeout: 20000,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Unable to load Vista leads.');
    }

    if (!Array.isArray(response.data?.data)) {
      throw new Error('Invalid Vista leads response from the server.');
    }

    return {
      leads: response.data.data,
      pagination: response.data.pagination ?? {
        page,
        limit,
        total: response.data.total ?? response.data.data.length,
        pages: 1,
      },
      channelCounts: response.data.channelCounts ?? {},
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Unable to load Vista leads. Please try again.',
    );
  }
}

export async function createCompanyVistaLead({ token, payload }) {
  if (!token) {
    throw new Error('Admin authentication is required to add a lead.');
  }
  if (!payload?.name?.trim()) {
    throw new Error('Lead name is required.');
  }

  try {
    const response = await axios.post(
      `${ADMIN_LEADS_URL}/admin`,
      { ...payload, name: payload.name.trim(), source: 'manual' },
      {
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
        },
      },
    );

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Unable to add lead.');
    }

    return response.data?.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Unable to add lead. Please try again.',
    );
  }
}
