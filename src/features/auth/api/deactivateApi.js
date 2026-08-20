import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../../config/api';
import { getNetworkErrorMessage } from '../../../utils/errorMessages';

const DEACTIVATE_ROUTE = `${API_BASE_URL}/api/client/auth/deactivate`;
const API_REQUEST_TIMEOUT_MS = 10000;

export async function deactivateAccount(token, password) {
    try {
        const response = await axios.post(
            DEACTIVATE_ROUTE,
            { password },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                },
                timeout: API_REQUEST_TIMEOUT_MS,
            },
        );
        return { isSuccess: true, message: response.data?.message || 'Account deactivated successfully.' };
    } catch (error) {
        const axiosError = error;
        const message =
            axiosError.response?.data?.message ??
            axiosError.response?.data?.error ??
            (axiosError.message === 'Network Error' ? getNetworkErrorMessage() : axiosError.message) ??
            'Failed to deactivate account. Please try again.';
        Toast.show({ type: 'error', text1: 'Deactivation failed', text2: message });
        return { isSuccess: false, message };
    }
}
