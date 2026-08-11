import axios from 'axios';
import { API_BASE_URL } from '../../../../../config/api';

const SERVICE_REQUEST_HISTORY_ROUTE = `${API_BASE_URL}/api/service-requests/my`;
const API_REQUEST_TIMEOUT_MS = 10000;

function getResponseRequests(data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (!data || typeof data !== 'object') {
        return [];
    }
    const record = data;
    if (Array.isArray(record.requests)) {
        return record.requests;
    }
    if (Array.isArray(record.serviceRequests)) {
        return record.serviceRequests;
    }
    if (Array.isArray(record.result)) {
        return record.result;
    }
    if (Array.isArray(record.data)) {
        return record.data;
    }
    if (record.data && typeof record.data === 'object') {
        const nested = record.data;
        if (Array.isArray(nested.requests)) {
            return nested.requests;
        }
        if (Array.isArray(nested.serviceRequests)) {
            return nested.serviceRequests;
        }
        if (Array.isArray(nested.result)) {
            return nested.result;
        }
    }
    return [];
}

function getErrorMessage(error) {
    const axiosError = error;
    if (axiosError.message === 'Network Error') {
        return 'Unable to reach the server. Please check your connection and try again.';
    }
    return (axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        axiosError.message ??
        'Unable to load service requests. Please try again.');
}

export async function fetchMyServiceRequests(token) {
    try {
        const response = await axios.get(SERVICE_REQUEST_HISTORY_ROUTE, {
            headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                }
                : undefined,
            withCredentials: true,
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        return {
            isSuccess: true,
            error: '',
            requests: getResponseRequests(response.data),
            rawData: response.data,
        };
    }
    catch (error) {
        return {
            isSuccess: false,
            error: getErrorMessage(error),
            requests: [],
            rawData: null,
        };
    }
}
