import axios, { type AxiosError } from 'axios';

import { API_BASE_URL } from '../../../config/api';

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
    console.log('Client invoices API skipped: auth token missing');

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
    ); console.log(response)
    const invoices = getInvoicesFromResponse(response.data);
    const responseMeta = Array.isArray(response.data) ? undefined : response.data;

    console.log('Client invoices loaded', {
      invoiceCount: invoices.length,
      success: responseMeta?.success,
      url: CLIENT_INVOICES_ROUTE,
    });

    return {
      error: '',
      invoices,
      isSuccess: responseMeta?.success ?? true,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    console.log('Client invoices API error', {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
      tokenLoaded: Boolean(token),
      url: CLIENT_INVOICES_ROUTE,
    });

    return {
      error: getErrorMessage(error),
      invoices: [],
      isSuccess: false,
    };
  }
}
