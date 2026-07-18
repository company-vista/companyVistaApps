import axios, { type AxiosError } from 'axios';

import { API_BASE_URL } from '../../../config/api';
import Toast from 'react-native-toast-message';

const CLIENT_INVOICES_ROUTE = `${API_BASE_URL}/api/client/auth/invoices/my`;
const API_REQUEST_TIMEOUT_MS = 8000;

export type ClientInvoice = Record<string, unknown>;

type ClientInvoicesResponse = {
  data?: ClientInvoice[] | {
    invoices?: ClientInvoice[];
    records?: ClientInvoice[];
  };
  invoices?: ClientInvoice[];
  records?: ClientInvoice[];
  success?: boolean;
};

function getInvoicesFromResponse(data: ClientInvoicesResponse | ClientInvoice[]) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.invoices)) {
    return data.invoices;
  }

  if (Array.isArray(data.records)) {
    return data.records;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  if (data.data && typeof data.data === 'object') {
    if (Array.isArray(data.data.invoices)) {
      return data.data.invoices;
    }

    if (Array.isArray(data.data.records)) {
      return data.data.records;
    }
  }

  return [];
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
    'Unable to load invoices. Please try again.'
  );
}

type FetchClientInvoicesParams = {
  companyId?: string | null;
  token?: string | null;
};

export async function fetchClientInvoices({ companyId, token }: FetchClientInvoicesParams) {
  if (!token) {
    Toast.show({type: "Client invoices API skipped: auth token missing"})
    return {
      error: 'Auth token missing. Please login again.',
      invoices: [],
      isSuccess: false,
    };
  }

  try {
    const params: Record<string, string> = {};

    if (companyId) {
      params.companyId = companyId;
    }

    const response = await axios.get<ClientInvoicesResponse | ClientInvoice[]>(
      CLIENT_INVOICES_ROUTE,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
        },
        params,
        timeout: API_REQUEST_TIMEOUT_MS,
      },
    ); 
    const invoices = getInvoicesFromResponse(response.data);
    const responseMeta = Array.isArray(response.data) ? undefined : response.data;

    

    return {
      error: '',
      invoices,
      isSuccess: responseMeta?.success ?? true,
    };
  } catch (error) {
    Toast.show({ type: 'error', text1: 'Client invoices API error', text2: getErrorMessage(error) });

    return {
      error: getErrorMessage(error),
      invoices: [],
      isSuccess: false,
    };
  }
}
