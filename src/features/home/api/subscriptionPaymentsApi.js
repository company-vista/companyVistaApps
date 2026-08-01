import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
const SUBSCRIPTION_PAYMENT_ROUTE = `${API_BASE_URL}/api/subscription/All/payment`;
const API_REQUEST_TIMEOUT_MS = 8000;
function asSubscriptionPaymentArray(value) {
    return Array.isArray(value) ? value : [];
}
function getResponsePayments(data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (!data || typeof data !== 'object') {
        return [];
    }
    const record = data;
    if (Array.isArray(record.payments)) {
        return record.payments;
    }
    if (Array.isArray(record.subscriptionPayments)) {
        return record.subscriptionPayments;
    }
    if (Array.isArray(record.result)) {
        return record.result;
    }
    if (Array.isArray(record.data)) {
        return record.data;
    }
    if (record.data && typeof record.data === 'object') {
        const nested = record.data;
        if (Array.isArray(nested.payments)) {
            return nested.payments;
        }
        if (Array.isArray(nested.subscriptionPayments)) {
            return nested.subscriptionPayments;
        }
        if (Array.isArray(nested.result)) {
            return nested.result;
        }
    }
    return [];
}
function getErrorMessage(error) {
    const axiosError = error;
    const requestError = axiosError.request;
    if (axiosError.message === 'Network Error') {
        return 'Unable to reach the payments API. Verify the backend is running on port 5000.';
    }
    return (axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        requestError?._response ??
        axiosError.message ??
        'Unable to load payment transactions. Please try again.');
}
export async function fetchSubscriptionPayments(token) {
    try {
        const response = await axios.get(SUBSCRIPTION_PAYMENT_ROUTE, {
            headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                }
                : undefined,
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        const payments = getResponsePayments(response.data);
        return {
            error: '',
            isSuccess: response.data && typeof response.data === 'object' ? response.data.success ?? true : true,
            payments,
        };
    }
    catch (error) {
        const message = getErrorMessage(error);
        return {
            error: message,
            isSuccess: false,
            payments: [],
        };
    }
}
