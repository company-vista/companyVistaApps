import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const ADMIN_PROFILE_ROUTE = `${API_BASE_URL}/api/auth/profile`;
const ADMIN_AVATAR_ROUTE = `${API_BASE_URL}/api/auth/profile/avatar`;
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

function getImageUrl(value) {
  if (!value) {
    return undefined;
  }
  if (/^https?:\/\//i.test(value) || /^data:/i.test(value)) {
    return value;
  }
  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
}

function getResponseAvatar(data) {
  return getImageUrl(
    data?.user?.avatar ??
      data?.user?.avatarUrl ??
      data?.user?.profileImage ??
      data?.user?.profilePicture ??
      data?.avatar ??
      data?.avatarUrl ??
      data?.profileImage ??
      data?.profilePicture ??
      data?.image ??
      data?.imageUrl ??
      data?.url ??
      data?.secure_url ??
      data?.data?.avatar ??
      data?.data?.user?.avatar,
  );
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

export async function uploadAdminAvatar({ file, token }) {
  if (!token) {
    return {
      avatar: undefined,
      error: 'Auth token missing. Please login again.',
      isSuccess: false,
      user: undefined,
    };
  }

  try {
    const formData = new FormData();
    formData.append('avatar', {
      name: file.name ?? 'profile-avatar.jpg',
      type: file.type ?? 'image/jpeg',
      uri: file.uri,
    });

    const response = await axios.put(ADMIN_AVATAR_ROUTE, formData, {
      headers: getAuthHeaders(token),
    });

    return {
      avatar: getResponseAvatar(response.data),
      error: '',
      isSuccess: response.data.success ?? true,
      user: response.data.user,
    };
  } catch (error) {
    return {
      avatar: undefined,
      error: getErrorMessage(error, 'Unable to update profile image.'),
      isSuccess: false,
      user: undefined,
    };
  }
}
