import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const ADMIN_PROFILE_ROUTE = `${API_BASE_URL}/api/auth/profile`;
const ADMIN_ME_ROUTE = `${API_BASE_URL}/api/auth/me`;

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.message ??
    error.response?.data?.error ??
    error.message ??
    fallback
  );
}

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'x-auth-token': token,
  };
}

export async function fetchAdminProfile(token) {
  if (!token) {
    return {
      error: 'Auth token missing. Please login again.',
      isSuccess: false,
      user: undefined,
    };
  }

  try {
    const response = await axios.get(ADMIN_ME_ROUTE, {
      headers: getAuthHeaders(token),
    });
    return {
      error: '',
      isSuccess: response.data.success ?? true,
      user: response.data.user,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error, 'Unable to load admin profile.'),
      isSuccess: false,
      user: undefined,
    };
  }
}

export async function updateAdminProfile({ name, phone, token }) {
  if (!token) {
    return {
      error: 'Auth token missing. Please login again.',
      isSuccess: false,
      user: undefined,
    };
  }

  try {
    const response = await axios.put(
      ADMIN_PROFILE_ROUTE,
      { name: name.trim(), phone: phone.trim() },
      { headers: getAuthHeaders(token) },
    );
    return {
      error: '',
      isSuccess: response.data.success ?? true,
      user: response.data.user,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error, 'Unable to update admin profile.'),
      isSuccess: false,
      user: undefined,
    };
  }
}
