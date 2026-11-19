import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const RECENT_ACTIVITY_ROUTE = `${API_BASE_URL}/api/activity-log/recent`;

function getErrorMessage(error) {
  return (
    error.response?.data?.message ??
    error.response?.data?.error ??
    error.message ??
    'Unable to load recent activity.'
  );
}

export async function fetchRecentActivity({ token, days = 7 }) {
  if (!token) {
    return {
      activities: [],
      error: 'Auth token missing. Please login again.',
      isSuccess: false,
    };
  }

  try {
    const response = await axios.get(RECENT_ACTIVITY_ROUTE, {
      params: { days },
      headers: {
        Authorization: `Bearer ${token}`,
        'x-auth-token': token,
      },
    });
    const activities = response.data?.data;

    return {
      activities: Array.isArray(activities) ? activities : [],
      error: '',
      isSuccess: response.data.success ?? true,
    };
  } catch (error) {
    return {
      activities: [],
      error: getErrorMessage(error),
      isSuccess: false,
    };
  }
}
