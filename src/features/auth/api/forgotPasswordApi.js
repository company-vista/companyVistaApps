import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
const FORGOT_PASSWORD_ROUTE = `${API_BASE_URL}/api/client/auth/forgot-password`;
const API_REQUEST_TIMEOUT_MS = 10000;
export async function forgotPassword(email) {
    const response = await axios.post(FORGOT_PASSWORD_ROUTE, { email }, { timeout: API_REQUEST_TIMEOUT_MS });
    return response.data;
}
