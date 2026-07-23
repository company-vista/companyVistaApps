import axios, { type AxiosError } from 'axios';

import { API_BASE_URL } from '../../../config/api';
import type { LoginUser } from '../../auth/api/loginApi';

const CLIENT_PROFILE_ROUTE = `${API_BASE_URL}/api/client/auth/profile`;

type UpdateClientProfilePayload = {
  address?: {
    addressLine1?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    state?: string;
    street?: string;
  };
  addressLine1?: string;
  city?: string;
  countryCode?: string;
  country?: string;
  company?: string;
  dateOfBirth?: string;
  email: string;
  name: string;
  passportNumber?: string;
  phone: string;
  postalCode?: string;
};

type ClientProfileResponse = {
  client?: LoginUser;
  companies?: LoginUser['companies'];
  data?: {
    client?: LoginUser;
    companies?: LoginUser['companies'];
    user?: LoginUser;
  };
  message?: string;
  success?: boolean;
  user?: LoginUser;
};

type UpdateClientProfileParams = {
  payload: UpdateClientProfilePayload;
  token?: string | null;
};

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const requestError = axiosError.request as { _response?: string } | undefined;

  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.error ??
    requestError?._response ??
    axiosError.message ??
    'Unable to update profile. Please try again.'
  );
}

function splitName(name: string) {
  const [firstName = '', ...lastNameParts] = name.trim().split(/\s+/);

  return {
    firstName,
    lastName: lastNameParts.join(' '),
  };
}

function getResponseUser(data: ClientProfileResponse) {
  const user = data.user ?? data.client ?? data.data?.user ?? data.data?.client;
  const companies = user?.companies ?? data.companies ?? data.data?.companies;

  return user
    ? {
        ...user,
        companies,
      }
    : undefined;
}

export async function fetchClientProfile(token?: string | null) {
  if (!token) {
    return {
      error: 'Auth token missing. Please login again.',
      isSuccess: false,
      user: undefined,
    };
  }

  try {
    const response = await axios.get<ClientProfileResponse>(CLIENT_PROFILE_ROUTE, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    return {
      error: '',
      isSuccess: response.data.success ?? true,
      user: getResponseUser(response.data),
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      isSuccess: false,
      user: undefined,
    };
  }
}

export async function updateClientProfile({
  payload,
  token,
}: UpdateClientProfileParams) {
  if (!token) {
    return {
      error: 'Auth token missing. Please login again.',
      isSuccess: false,
      user: undefined,
    };
  }

  try {
    const nameParts = splitName(payload.name);
    const requestPayload = {
      ...nameParts,
      address: payload.address,
      addressLine1: payload.addressLine1 ?? payload.address?.addressLine1 ?? payload.address?.street,
      city: payload.city ?? payload.address?.city,
      company: payload.company,
      country: payload.country ?? payload.address?.country,
      countryCode: payload.countryCode,
      dateOfBirth: payload.dateOfBirth?.trim(),
      dob: payload.dateOfBirth?.trim(),
      email: payload.email.trim(),
      fullName: payload.name.trim(),
      mobile: payload.phone.trim(),
      name: payload.name.trim(),
      passportNo: payload.passportNumber?.trim(),
      passportNumber: payload.passportNumber?.trim(),
      phone: payload.phone.trim(),
      phoneNumber: payload.phone.trim(),
      postalCode: payload.postalCode ?? payload.address?.postalCode,
      state: payload.address?.state,
      street: payload.addressLine1 ?? payload.address?.street ?? payload.address?.addressLine1,
    };

    const response = await axios.put<ClientProfileResponse>(
      CLIENT_PROFILE_ROUTE,
      requestPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
        },
      },
    );

    return {
      error: '',
      isSuccess: response.data.success ?? true,
      user: getResponseUser(response.data),
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      isSuccess: false,
      user: undefined,
    };
  }
}
