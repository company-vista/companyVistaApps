import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import Toast from 'react-native-toast-message';

const MESSAGES_PATH = '/api/messages';
const API_REQUEST_TIMEOUT_MS = 8000;

function getErrorMessage(error) {
    const axiosError = error;
    return (axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        axiosError.message ??
        'Unable to send message. Please try again.');
}

export async function sendMessage({ clientId, text, token }) {
    if (!clientId) {
        Toast.show({ type: 'error', text1: 'Message API skipped: client id missing' });
        return {
            data: null,
            error: 'Client id missing.',
            isSuccess: false,
        };
    }
    if (!text || !text.trim()) {
        return {
            data: null,
            error: 'Message text is required.',
            isSuccess: false,
        };
    }
    const messageRoute = `${API_BASE_URL}${MESSAGES_PATH}/${clientId}`;
    try {
        const response = await axios.post(messageRoute, { text: text.trim() }, {
            headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                    Cookie: `clientToken=${token}`,
                }
                : undefined,
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        return {
            data: response.data?.data ?? null,
            error: '',
            isSuccess: response.data?.success ?? true,
        };
    }
    catch (error) {
        const axiosError = error;
        console.log('Send message error', { message: axiosError.message, id: clientId });
        return {
            data: null,
            error: getErrorMessage(error),
            isSuccess: false,
        };
    }
}
