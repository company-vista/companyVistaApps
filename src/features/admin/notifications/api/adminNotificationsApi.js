import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const NOTIFICATIONS_ROUTE = `${API_BASE_URL}/api/admin/notifications`;
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

const extractNotifications = response => {
  const data = response.data?.data ?? response.data?.notifications;
  if (!Array.isArray(data)) {
    throw new Error('Invalid notifications response from the server.');
  }
  return data;
};

export async function fetchAdminNotifications({ token }) {
  const response = await request(
    { method: 'get', url: NOTIFICATIONS_ROUTE },
    token,
  );
  return extractNotifications(response);
}

export async function markAdminNotificationAsRead({ token, id }) {
  if (!id) throw new Error('Notification ID is missing.');
  const response = await request(
    {
      method: 'patch',
      url: `${NOTIFICATIONS_ROUTE}/${encodeURIComponent(id)}/read`,
    },
    token,
  );
  return response.data;
}

export async function markAllAdminNotificationsAsRead({ token }) {
  const response = await request(
    { method: 'patch', url: `${NOTIFICATIONS_ROUTE}/mark-all` },
    token,
  );
  return response.data;
}

export async function deleteAdminNotification({ token, id }) {
  if (!id) throw new Error('Notification ID is missing.');
  const response = await request(
    { method: 'delete', url: `${NOTIFICATIONS_ROUTE}/${encodeURIComponent(id)}` },
    token,
  );
  return response.data;
}
