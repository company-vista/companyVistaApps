import axios from 'axios';
import { API_BASE_URL } from '../../../../../config/api';
const SERVICE_REQUEST_ROUTE = `${API_BASE_URL}/api/service-requests`;
const API_REQUEST_TIMEOUT_MS = 10000;
function getErrorMessage(error) {
    const axiosError = error;
    if (axiosError.message === 'Network Error') {
        return 'Unable to reach the server. Please check your connection and try again.';
    }
    return (axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        axiosError.message ??
        'Unable to submit your request. Please try again.');
}
export async function createServiceRequest({ companyId, serviceSlug, note = '', token }) {
    try {
        const response = await axios.post(SERVICE_REQUEST_ROUTE, { companyId, serviceSlug, note }, {
            headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                }
                : undefined,
            withCredentials: true,
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        const body = response.data;
        if (body && body.success === false) {
            return {
                isSuccess: false,
                error: body.message ?? body.error ?? 'Unable to submit your request. Please try again.',
                data: body,
            };
        }
        return {
            isSuccess: true,
            error: '',
            data: body,
        };
    }
    catch (error) {
        return {
            isSuccess: false,
            error: getErrorMessage(error),
            data: null,
        };
    }
}
