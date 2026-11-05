import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
const API_REQUEST_TIMEOUT_MS = 10000;

export async function forgotPassword(email, accountType = 'client') {
    const authRoute = accountType === 'admin' ? '/api/auth' : '/api/client/auth';
    const response = await axios.post(
        `${API_BASE_URL}${authRoute}/forgot-password`,
        { email },
        { timeout: API_REQUEST_TIMEOUT_MS },
    );
    return response.data;
}

export async function resetPassword({ token, password, accountType = 'client' }) {
    const authRoute = accountType === 'admin' ? '/api/auth' : '/api/client/auth';
    const response = await axios.post(
        `${API_BASE_URL}${authRoute}/reset-password/${encodeURIComponent(token)}`,
        { password },
        { timeout: API_REQUEST_TIMEOUT_MS },
    );
    return response.data;
}

export async function verifyAdminEmailToken(token) {
    const response = await axios.get(
        `${API_BASE_URL}/api/auth/verify-email/${encodeURIComponent(token)}`,
        { timeout: API_REQUEST_TIMEOUT_MS },
    );
    return response.data;
}
