import axios, { type AxiosError, type AxiosResponseHeaders } from 'axios';
import Toast from 'react-native-toast-message';

import { API_BASE_URL } from '../../../config/api';

export type LoginErrors = {
  email?: string;
  password?: string;
};

export type LoginUser = {
  _id?: string;
  address?: {
    addressLine1?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    state?: string;
    street?: string;
  };
  addressLine1?: string;
  avatar?: string;
  businessName?: string;
  company?: string;
  companyName?: string;
  countryCode?: string;
  country?: string;
  dateOfBirth?: string;
  dob?: string;
  companies?: Array<{
    businessName?: string;
    companyName?: string;
    legalName?: string;
    name?: string;
  }>;
  email: string;
  id?: string;
  firstName?: string;
  image?: string;
  lastName?: string;
  legalName?: string;
  mobile?: string;
  name?: string;
  passportNo?: string;
  passportNumber?: string;
  phone?: string;
  phoneNumber?: string;
  photo?: string;
  postalCode?: string;
  profileImage?: string;
  profilePicture?: string;
  role?: string;
  state?: string;
  street?: string;
};

type LoginApiParams = {
  email: string;
  password: string;
};

type LoginApiResult = {
  errors: LoginErrors;
  isSuccess: boolean;
  email: string;
  token?: string;
  user?: LoginUser;
};

const CLIENT_LOGIN_ROUTE = `${API_BASE_URL}/api/client/auth/login`;
const GOOGLE_LOGIN_ROUTE = `${API_BASE_URL}/api/client/auth/google/login`;
const API_REQUEST_TIMEOUT_MS = 8000;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type LoginApiResponse = {
  accessToken?: string;
  access_token?: string;
  auth_token?: string;
  authToken?: string;
  bearerToken?: string;
  clientToken?: string;
  client_token?: string;
  data?: LoginApiResponse | LoginUser;
  idToken?: string;
  id_token?: string;
  jwt?: string;
  message?: string;
  profile?: LoginUser;
  token?: string;
  user?: LoginUser;
  client?: LoginUser;
};

type ApiRecord = Record<string, unknown>;

const TOKEN_KEYS = [
  'token',
  'accessToken',
  'access_token',
  'authToken',
  'auth_token',
  'bearerToken',
  'clientToken',
  'client_token',
  'idToken',
  'id_token',
  'jwt',
];

function isApiRecord(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getResponseUser(data: LoginApiResponse): LoginUser | undefined {
  const nestedData = data.data && !('email' in data.data) ? data.data : undefined;
  const directDataUser = data.data && 'email' in data.data ? data.data : undefined;

  return data.user ?? data.profile ?? data.client ?? directDataUser ?? nestedData?.user ?? nestedData?.profile ?? nestedData?.client;
}

function findToken(value: unknown, depth = 0): string {
  if (!isApiRecord(value) || depth > 4) {
    return '';
  }

  for (const key of TOKEN_KEYS) {
    const token = value[key];

    if (typeof token === 'string' && token.trim()) {
      return token;
    }
  }

  for (const nestedValue of Object.values(value)) {
    const nestedToken = findToken(nestedValue, depth + 1);

    if (nestedToken) {
      return nestedToken;
    }
  }

  return '';
}

function getResponseToken(data: LoginApiResponse) {
  return findToken(data);
}

function getHeaderToken(headers: AxiosResponseHeaders | Partial<AxiosResponseHeaders>) {
  const authorizationHeader =
    headers.Authorization ?? headers.authorization ?? headers['x-auth-token'];
  const cookieHeader = headers['set-cookie'];

  if (typeof authorizationHeader !== 'string') {
    if (Array.isArray(cookieHeader)) {
      return getCookieToken(cookieHeader.join('; '));
    }

    if (typeof cookieHeader === 'string') {
      return getCookieToken(cookieHeader);
    }

    return '';
  }

  return authorizationHeader.replace(/^Bearer\s+/i, '').trim();
}

function getCookieToken(cookieHeader: string) {
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)clientToken=([^;]+)/);

  return tokenMatch?.[1] ? decodeURIComponent(tokenMatch[1]) : '';
}

function getImageUrl(value?: string, baseUrl = API_BASE_URL) {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${baseUrl}/${value.replace(/^\/+/, '')}`;
}

function getUserName(user?: LoginUser) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

  return user?.name ?? (fullName || undefined);
}

function getUserCompany(user?: LoginUser) {
  const firstCompany = user?.companies?.[0];

  return (
    user?.company ??
    user?.companyName ??
    user?.businessName ??
    user?.legalName ??
    firstCompany?.companyName ??
    firstCompany?.businessName ??
    firstCompany?.legalName ??
    firstCompany?.name
  );
}

function getUserPhone(user?: LoginUser) {
  return user?.phone ?? user?.phoneNumber ?? user?.mobile;
}

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const requestError = axiosError.request as { _response?: string } | undefined;

  if (axiosError.message === 'Network Error') {
    return 'Unable to reach server. Check that the backend is running on port 5000.';
  }

  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.error ??
    requestError?._response ??
    axiosError.message ??
    'Unable to login. Please try again.'
  );
}

export async function handleLoginApi({
  email,
  password,
}: LoginApiParams): Promise<LoginApiResult> {
  const errors: LoginErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(trimmedEmail)) {
    errors.email = 'Enter a valid email';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (Object.keys(errors).length > 0) {
    Toast.show({
      type: 'error',
      text1: 'Login failed',
      text2: 'Please check your email and password.',
    });

    return {
      errors,
      isSuccess: false,
      email: trimmedEmail,
    };
  }

  let lastError: unknown;

  try {
    const response = await axios.post<LoginApiResponse>(
      CLIENT_LOGIN_ROUTE,
      {
        email: trimmedEmail,
        password,
      },
      {
        timeout: API_REQUEST_TIMEOUT_MS,
      },
    );
    const user = getResponseUser(response.data);
    const token = getResponseToken(response.data) || getHeaderToken(response.headers);

    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: 'Login response did not include an auth token.',
      });

      return {
        errors: {
          email: 'Check your email',
          password: 'Check your password',
        },
        isSuccess: false,
        email: trimmedEmail,
      };
    }

    const loginUser: LoginUser = {
      _id: user?._id,
      address: user?.address,
      addressLine1: user?.addressLine1,
      avatar: getImageUrl(user?.avatar),
      businessName: user?.businessName,
      companies: user?.companies,
      company: getUserCompany(user),
      companyName: user?.companyName,
      countryCode: user?.countryCode,
      country: user?.country,
      dateOfBirth: user?.dateOfBirth,
      dob: user?.dob,
      email: user?.email ?? trimmedEmail,
      id: user?.id,
      firstName: user?.firstName,
      image: getImageUrl(user?.image),
      lastName: user?.lastName,
      legalName: user?.legalName,
      mobile: user?.mobile,
      name: getUserName(user),
      passportNo: user?.passportNo,
      passportNumber: user?.passportNumber,
      phone: getUserPhone(user),
      phoneNumber: user?.phoneNumber,
      photo: getImageUrl(user?.photo),
      postalCode: user?.postalCode,
      profileImage: getImageUrl(user?.profileImage),
      profilePicture: getImageUrl(user?.profilePicture),
      role: user?.role,
      state: user?.state,
      street: user?.street,
    };

    return {
      errors,
      isSuccess: true,
      email: loginUser.email,
      token,
      user: loginUser,
    };
  } catch (error) {
    lastError = error;
  }

  const message = getErrorMessage(lastError);

  Toast.show({
    type: 'error',
    text1: 'Login failed',
    text2: message,
  });

  return {
    errors: {
      email: 'Check your email',
      password: 'Check your password',
    },
    isSuccess: false,
    email: trimmedEmail,
  };
}

type GoogleLoginApiResult = {
  errors: { general?: string };
  isSuccess: boolean;
  email: string;
  token?: string;
  user?: LoginUser;
};

export async function handleGoogleLoginApi({
  idToken,
}: {
  idToken: string;
}): Promise<GoogleLoginApiResult> {
  if (!idToken) {
    Toast.show({
      type: 'error',
      text1: 'Google login failed',
      text2: 'No ID token received from Google.',
    });

    return {
      errors: { general: 'No ID token received from Google.' },
      isSuccess: false,
      email: '',
    };
  }

  let lastError: unknown;

  try {
    const response = await axios.post<LoginApiResponse>(
      GOOGLE_LOGIN_ROUTE,
      { idToken },
      {
        timeout: API_REQUEST_TIMEOUT_MS,
      },
    );

    const user = getResponseUser(response.data);
    const token = getResponseToken(response.data) || getHeaderToken(response.headers);
    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Google login failed',
        text2: 'Login response did not include an auth token.',
      });

      return {
        errors: { general: 'Login response did not include an auth token.' },
        isSuccess: false,
        email: user?.email ?? '',
      };
    }

    const loginUser: LoginUser = {
      _id: user?._id,
      address: user?.address,
      addressLine1: user?.addressLine1,
      avatar: getImageUrl(user?.avatar),
      businessName: user?.businessName,
      companies: user?.companies,
      company: getUserCompany(user),
      companyName: user?.companyName,
      countryCode: user?.countryCode,
      country: user?.country,
      dateOfBirth: user?.dateOfBirth,
      dob: user?.dob,
      email: user?.email ?? '',
      id: user?.id,
      firstName: user?.firstName,
      image: getImageUrl(user?.image),
      lastName: user?.lastName,
      legalName: user?.legalName,
      mobile: user?.mobile,
      name: getUserName(user),
      passportNo: user?.passportNo,
      passportNumber: user?.passportNumber,
      phone: getUserPhone(user),
      phoneNumber: user?.phoneNumber,
      photo: getImageUrl(user?.photo),
      postalCode: user?.postalCode,
      profileImage: getImageUrl(user?.profileImage),
      profilePicture: getImageUrl(user?.profilePicture),
      role: user?.role,
      state: user?.state,
      street: user?.street,
    };

    return {
      errors: {},
      isSuccess: true,
      email: loginUser.email,
      token,
      user: loginUser,
    };
  } catch (error) {
    lastError = error;
  }

  const message = getErrorMessage(lastError);

  Toast.show({
    type: 'error',
    text1: 'Google login failed',
    text2: message,
  });

  return {
    errors: { general: message },
    isSuccess: false,
    email: '',
  };
}
