import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
const FORGOT_PASSWORD_ROUTE = `${API_BASE_URL}/api/client/auth/forgot-password`;
export async function forgotPassword(email) {
    const response = await axios.post(FORGOT_PASSWORD_ROUTE, { email });
    return response.data;
}
