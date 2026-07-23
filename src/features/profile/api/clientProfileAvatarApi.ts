import axios, { type AxiosError } from 'axios';

import { API_BASE_URL } from '../../../config/api';

const CLIENT_AVATAR_ROUTE = `${API_BASE_URL}/api/client/auth/profile/avatar`;

type UploadAvatarResponse = {
  avatar?: string;
  avatarUrl?: string;
  client?: {
    avatar?: string;
    avatarUrl?: string;
    image?: string;
    imageUrl?: string;
    profileImage?: string;
    profileImageUrl?: string;
    profilePicture?: string;
    profilePictureUrl?: string;
    secure_url?: string;
    url?: string;
  };
  data?: {
    avatar?: string;
    avatarUrl?: string;
    client?: {
      avatar?: string;
      avatarUrl?: string;
      image?: string;
      imageUrl?: string;
      profileImage?: string;
      profileImageUrl?: string;
      profilePicture?: string;
      profilePictureUrl?: string;
      secure_url?: string;
      url?: string;
    };
    image?: string;
    imageUrl?: string;
    profileImage?: string;
    profileImageUrl?: string;
    profilePicture?: string;
    profilePictureUrl?: string;
    secure_url?: string;
    url?: string;
  };
  image?: string;
  imageUrl?: string;
  message?: string;
  profileImage?: string;
  profileImageUrl?: string;
  profilePicture?: string;
  profilePictureUrl?: string;
  secure_url?: string;
  success?: boolean;
  url?: string;
};

type UploadClientAvatarParams = {
  file: {
    name?: string;
    type?: string;
    uri: string;
  };
  token?: string | null;
};

function getImageUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
}

function getResponseAvatar(data: UploadAvatarResponse) {
  return getImageUrl(
    data.avatar ??
      data.avatarUrl ??
      data.profileImage ??
      data.profileImageUrl ??
      data.profilePicture ??
      data.profilePictureUrl ??
      data.image ??
      data.imageUrl ??
      data.url ??
      data.secure_url ??
      data.client?.avatar ??
      data.client?.avatarUrl ??
      data.client?.profileImage ??
      data.client?.profileImageUrl ??
      data.client?.profilePicture ??
      data.client?.profilePictureUrl ??
      data.client?.image ??
      data.client?.imageUrl ??
      data.client?.url ??
      data.client?.secure_url ??
      data.data?.avatar ??
      data.data?.avatarUrl ??
      data.data?.profileImage ??
      data.data?.profileImageUrl ??
      data.data?.profilePicture ??
      data.data?.profilePictureUrl ??
      data.data?.image ??
      data.data?.imageUrl ??
      data.data?.url ??
      data.data?.secure_url ??
      data.data?.client?.avatar ??
      data.data?.client?.avatarUrl ??
      data.data?.client?.profileImage ??
      data.data?.client?.profileImageUrl ??
      data.data?.client?.profilePicture ??
      data.data?.client?.profilePictureUrl ??
      data.data?.client?.image ??
      data.data?.client?.imageUrl ??
      data.data?.client?.url ??
      data.data?.client?.secure_url,
  );
}

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const requestError = axiosError.request as { _response?: string } | undefined;

  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.error ??
    requestError?._response ??
    axiosError.message ??
    'Unable to update profile image. Please try again.'
  );
}

export async function uploadClientAvatar({
  file,
  token,
}: UploadClientAvatarParams) {
  if (!token) {
    return {
      avatar: undefined,
      error: 'Auth token missing. Please login again.',
      isSuccess: false,
    };
  }

  try {
    const formData = new FormData();

    formData.append('avatar', {
      name: file.name ?? 'profile-avatar.jpg',
      type: file.type ?? 'image/jpeg',
      uri: file.uri,
    } as unknown as Blob);

    const response = await axios.put<UploadAvatarResponse>(
      CLIENT_AVATAR_ROUTE,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
        },
      },
    );

    return {
      avatar: getResponseAvatar(response.data),
      error: '',
      isSuccess: response.data.success ?? true,
    };
  } catch (error) {

    return {
      avatar: undefined,
      error: getErrorMessage(error),
      isSuccess: false,
    };
  }
}
