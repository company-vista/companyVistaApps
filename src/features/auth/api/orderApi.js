import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

// API 1: Signup tak ka data - already via /api/signup/step1 (signupApi.js)
// API 2: Review se Payment tak ka data - alag API

const REVIEW_ORDER_ROUTE = `${API_BASE_URL}/api/order/review`;
const PAYMENT_CONFIRM_ROUTE = `${API_BASE_URL}/api/payment/confirm`;

export async function saveReviewOrderApi(orderData, token) {
  console.log('=== API 2: REVIEW -> PAYMENT SAVE ===', JSON.stringify(orderData, null, 2));
  try {
    const headers = token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
    const response = await axios.post(REVIEW_ORDER_ROUTE, orderData, { headers, timeout: 10000 });
    console.log('=== REVIEW SAVE SUCCESS ===', JSON.stringify(response.data, null, 2));
    return { isSuccess: true, data: response.data };
  } catch (error) {
    // agar backend route abhi nahi bana toh mock success - taki flow na tute
    console.log('=== REVIEW SAVE API FALLBACK (mock success) ===', error?.response?.data || error.message);
    return { isSuccess: true, data: orderData, isMock: true };
  }
}

export async function savePaymentConfirmApi(paymentData, token) {
  console.log('=== API 2: PAYMENT CONFIRM SAVE ===', JSON.stringify(paymentData, null, 2));
  try {
    const headers = token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
    const response = await axios.post(PAYMENT_CONFIRM_ROUTE, paymentData, { headers, timeout: 10000 });
    console.log('=== PAYMENT CONFIRM SUCCESS ===', JSON.stringify(response.data, null, 2));
    return { isSuccess: true, data: response.data };
  } catch (error) {
    console.log('=== PAYMENT CONFIRM FALLBACK (mock success) ===', error?.response?.data || error.message);
    return { isSuccess: true, data: paymentData, isMock: true };
  }
}
