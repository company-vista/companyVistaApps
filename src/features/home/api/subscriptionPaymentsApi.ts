import axios, { type AxiosError } from 'axios';

import { API_BASE_URL } from '../../../config/api';

const SUBSCRIPTION_PAYMENT_ROUTE = `${API_BASE_URL}/api/subscription/All/payment`;
const API_REQUEST_TIMEOUT_MS = 8000;

type SubscriptionPaymentApiItem = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  amount?: number | string;
  onlineAmount?: number | string;
  cashAmount?: number | string;
  currency?: string;
  date?: string;
  status?: string;
  type?: string;
  paymentMethod?: string;
  gateway?: string;
  bankName?: string;
  accountLast4?: string;
  referenceId?: string;
  transactionId?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  invoice?: string | null;
  isActive?: boolean;
  [key: string]: unknown;
};

type SubscriptionPaymentResponse = {
  success?: boolean;
  data?: SubscriptionPaymentApiItem[] | { payments?: SubscriptionPaymentApiItem[] } | { subscriptionPayments?: SubscriptionPaymentApiItem[] } | { result?: SubscriptionPaymentApiItem[] };
  payments?: SubscriptionPaymentApiItem[];
  subscriptionPayments?: SubscriptionPaymentApiItem[];
  result?: SubscriptionPaymentApiItem[];
  message?: string;
  error?: string;
};

type FetchSubscriptionPaymentsResult = {
  error: string;
  isSuccess: boolean;
  payments: SubscriptionPaymentApiItem[];
};

function asSubscriptionPaymentArray(value: unknown): SubscriptionPaymentApiItem[] {
  return Array.isArray(value) ? value : [];
}

function getResponsePayments(data: unknown): SubscriptionPaymentApiItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.payments)) {
    return record.payments as SubscriptionPaymentApiItem[];
  }

  if (Array.isArray(record.subscriptionPayments)) {
    return record.subscriptionPayments as SubscriptionPaymentApiItem[];
  }

  if (Array.isArray(record.result)) {
    return record.result as SubscriptionPaymentApiItem[];
  }

  if (Array.isArray(record.data)) {
    return record.data as SubscriptionPaymentApiItem[];
  }

  if (record.data && typeof record.data === 'object') {
    const nested = record.data as Record<string, unknown>;

    if (Array.isArray(nested.payments)) {
      return nested.payments as SubscriptionPaymentApiItem[];
    }

    if (Array.isArray(nested.subscriptionPayments)) {
      return nested.subscriptionPayments as SubscriptionPaymentApiItem[];
    }

    if (Array.isArray(nested.result)) {
      return nested.result as SubscriptionPaymentApiItem[];
    }
  }

  return [];
}

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const requestError = axiosError.request as { _response?: string } | undefined;

  if (axiosError.message === 'Network Error') {
    return 'Unable to reach the payments API. Verify the backend is running on port 5000.';
  }

  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.error ??
    requestError?._response ??
    axiosError.message ??
    'Unable to load payment transactions. Please try again.'
  );
}

export async function fetchSubscriptionPayments(token?: string): Promise<FetchSubscriptionPaymentsResult> {
  try {
    
    const response = await axios.get<SubscriptionPaymentResponse | SubscriptionPaymentApiItem[]>(
      SUBSCRIPTION_PAYMENT_ROUTE,
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              'x-auth-token': token,
            }
          : undefined,
        timeout: API_REQUEST_TIMEOUT_MS,
      },
    );

    const payments = getResponsePayments(response.data);

    return {
      error: '',
      isSuccess: response.data && typeof response.data === 'object' ? (response.data as SubscriptionPaymentResponse).success ?? true : true,
      payments,
    };
  } catch (error) {
    const message = getErrorMessage(error);

    console.log('Subscription payment API error', {
      message,
      route: SUBSCRIPTION_PAYMENT_ROUTE,
      details: error,
    });

    return {
      error: message,
      isSuccess: false,
      payments: [],
    };
  }
}
