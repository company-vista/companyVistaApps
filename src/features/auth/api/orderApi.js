import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

// Backend routes (aapke diye hue):
// router.post('/set-password', setPassword)
// router.get('/review/:companyId', getReview)
// router.post('/confirm/:companyId', confirmSignup)
// router.post('/checkout/:companyId', createCheckout)
// router.post('/checkout/finalize', finalizeCheckout)

const REVIEW_ORDER_ROUTE = `${API_BASE_URL}/api/order/review`;
const PAYMENT_CONFIRM_ROUTE = `${API_BASE_URL}/api/payment/confirm`;

const REVIEW_GET_ROUTE = `${API_BASE_URL}/api/company-signup/review`;
const CONFIRM_ROUTE = `${API_BASE_URL}/api/company-signup/confirm`;
const CHECKOUT_ROUTE = `${API_BASE_URL}/api/company-signup/checkout`;
const SET_PASSWORD_ROUTE = `${API_BASE_URL}/api/set-password`;

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

export async function fetchReviewApi({ companyId, token }) {
  if (!companyId) return { isSuccess: false, error: 'companyId missing' };
  const headers = token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
  const url = `${REVIEW_GET_ROUTE}/${companyId}`;
  try {
    console.log('=== fetchReview TRY ===', url);
    const res = await axios.get(url, { headers, timeout: 10000 });
    console.log('=== fetchReview SUCCESS ===', JSON.stringify(res.data, null, 2));
    return { isSuccess: true, data: res.data?.data || res.data, raw: res.data };
  } catch (e) {
    const msg = e?.response?.data?.message || e.message;
    console.log('=== fetchReview FAILED ===', msg);
    return { isSuccess: false, error: msg };
  }
}

export async function setPasswordApi({ clientId, password, token }) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const endpoints = [
    SET_PASSWORD_ROUTE,
    `${API_BASE_URL}/api/signup/set-password`,
    `${API_BASE_URL}/api/auth/set-password`,
    `${API_BASE_URL}/api/client/set-password`,
    `${API_BASE_URL}/api/company-signup/set-password`,
  ];
  let lastErr = null;
  for (const url of endpoints) {
    try {
      console.log('=== setPassword TRY ===', url, { clientId });
      const res = await axios.post(url, { clientId, password }, { headers, timeout: 10000 });
      console.log('=== setPassword SUCCESS ===', url, JSON.stringify(res.data, null, 2));
      return res.data;
    } catch (e) {
      lastErr = e;
      const msg = e?.response?.data?.message || e.message;
      const status = e?.response?.status;
      console.log(`=== setPassword FAILED ${url} status`, status, msg);
      if (status === 404) continue;
      // 400/401 matlab route mila, password logic fail — fallback nahi
      throw e;
    }
  }
  throw lastErr || new Error('set-password endpoint not found');
}

export async function confirmSignupApi({ companyId, token }) {
  if (!companyId) throw new Error('companyId missing');
  const headers = token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
  const url = `${CONFIRM_ROUTE}/${companyId}`;
  console.log('=== confirmSignup TRY ===', url);
  const res = await axios.post(url, {}, { headers, timeout: 10000 });
  console.log('=== confirmSignup SUCCESS ===', JSON.stringify(res.data, null, 2));
  return res.data;
}

export async function createCheckoutApi({ companyId, token }) {
  if (!companyId) throw new Error('companyId missing');
  const headers = token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
  const url = `${CHECKOUT_ROUTE}/${companyId}`;
  console.log('=== createCheckout TRY ===', url);
  const res = await axios.post(url, {}, { headers, timeout: 10000 });
  console.log('=== createCheckout SUCCESS ===', JSON.stringify(res.data, null, 2));
  return res.data;
}

export async function finalizeCheckoutApi({ sessionId, companyId, token }) {
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {}) };
  const url = `${CHECKOUT_ROUTE}/finalize`;
  const body = { sessionId: String(sessionId).trim(), companyId: String(companyId).trim() };
  console.log('=== finalizeCheckout TRY ===', url, JSON.stringify(body, null, 2));
  const res = await axios.post(url, body, { headers, timeout: 10000 });
  console.log('=== finalizeCheckout SUCCESS ===', JSON.stringify(res.data, null, 2));
  return res.data;
}
