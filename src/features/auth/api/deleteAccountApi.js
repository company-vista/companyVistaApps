import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../../config/api';
import { getNetworkErrorMessage } from '../../../utils/errorMessages';

const DELETE_ROUTE = `${API_BASE_URL}/api/client/auth/delete`;
const API_REQUEST_TIMEOUT_MS = 10000;

export async function deleteAccount(token, password) {
    try {
        const response = await axios.post(
            DELETE_ROUTE,
            { password },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                },
                timeout: API_REQUEST_TIMEOUT_MS,
            },
        );
        return { isSuccess: true, message: response.data?.message || 'Account deleted successfully.' };
    } catch (error) {
        const axiosError = error;
        const message =
            axiosError.response?.data?.message ??
            axiosError.response?.data?.error ??
            (axiosError.message === 'Network Error' ? getNetworkErrorMessage() : axiosError.message) ??
            'Failed to delete account. Please try again.';
        Toast.show({ type: 'error', text1: 'Deletion failed', text2: message });
        return { isSuccess: false, message };
    }
}
