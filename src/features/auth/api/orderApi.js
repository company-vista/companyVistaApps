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
    // Pehle yahan mock success return hota tha (isMock: true) — yaani backend
    // save fail ho raha ho tab bhi app ko "saved" pata chalta tha aur order
    // backend me exist hi nahi karta. Ab real error propagate karte hain, taaki
    // calling screen user ko bata sake order save nahi hua.
    const msg = error?.response?.data?.message || error?.message || 'Unable to save order';
    console.log('=== REVIEW SAVE API FAILED ===', msg);
    return { isSuccess: false, error: msg, data: error?.response?.data ?? null };
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
    // Payment confirm likhna fail hua to ise swallow karna galat hai — backend
    // ke paas payment record nahi bana, par app "saved" dikha raha tha.
    const msg = error?.response?.data?.message || error?.message || 'Unable to save payment confirmation';
    console.log('=== PAYMENT CONFIRM SAVE FAILED ===', msg);
    return { isSuccess: false, error: msg, data: error?.response?.data ?? null };
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

// Checkout cancel hone par backend ko batao. Pehle ye call nahi hota tha, to
// backend ka pending payment record update nahi hota tha aur retry par naye
// pending records ban jate the (list me duplicate + 3x amount). Backend me ek
// hi record reuse hota hai, ye call us attempt ko Stripe par expire karne
// me madad karti hai.
export async function cancelCheckoutApi({ companyId, token }) {
  if (!companyId) return { success: true };
  const headers = token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
  const url = `${CHECKOUT_ROUTE}/${companyId}/cancel`;
  try {
    const res = await axios.post(url, {}, { headers, timeout: 10000 });
    return res.data;
  } catch (error) {
    // Cancel best-effort hai — payment flow ko fail nahi karna chahiye
    console.log('=== cancelCheckout FAILED (ignored) ===', error?.message);
    return { success: false };
  }
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
