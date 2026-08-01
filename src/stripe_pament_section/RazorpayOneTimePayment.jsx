import { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { font } from '../theme/typography';
import { API_BASE_URL, RAZORPAY_KEY_ID } from '../config/api';
let paymentStatusInterval = null;
function clearPaymentStatusFlow() {
    if (paymentStatusInterval) {
        clearInterval(paymentStatusInterval);
        paymentStatusInterval = null;
    }
}
function pollPaymentStatus(invoiceId) {
    clearPaymentStatusFlow();
    let attempts = 0;
    const MAX_ATTEMPTS = 12;
    paymentStatusInterval = setInterval(async () => {
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
            clearPaymentStatusFlow();
            Toast.show({ type: 'info', text1: 'Please refresh to check payment status' });
            return;
        }
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/subscription/details/${invoiceId}`, {
                withCredentials: true,
                params: { _t: Date.now() },
                headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
            });
            const status = data?.paymentStatus || data?.status || '';
            if (status === 'paid' || status === 'completed') {
                clearPaymentStatusFlow();
                Toast.show({ type: 'success', text1: 'Payment successful!' });
            }
        }
        catch {
            // silently retry
        }
    }, 5000);
}
export default function RazorpayOneTimePayment({ invoice = {}, onSuccess, onInitiated, paymentType = 'invoice', label = 'Pay Now', buttonStyle, }) {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        return () => clearPaymentStatusFlow();
    }, []);
    const handlePayment = async () => {
        const companyId = invoice?.companyId || invoice?.company?._id;
        const amount = Number(invoice?.amount || 0);
        if (!companyId) {
            Toast.show({ type: 'error', text1: 'Company information is missing' });
            return;
        }
        if (amount <= 0) {
            Toast.show({ type: 'error', text1: 'Invalid payment amount' });
            return;
        }
        if (paymentType === 'invoice' && !invoice?.id) {
            Toast.show({ type: 'error', text1: 'Invoice ID is missing' });
            return;
        }
        const endpoint = paymentType === 'subscription'
            ? `${API_BASE_URL}/api/subscription/create-order`
            : `${API_BASE_URL}/api/subscription/create-order/invoice`;
        const payload = paymentType === 'subscription'
            ? {
                companyId,
                plan: invoice?.plan,
                amount,
                currency: invoice?.currency || 'INR',
            }
            : {
                companyId,
                invoiceId: invoice?.id,
                amount,
                currency: invoice?.currency || 'INR',
            };
        if (paymentType === 'subscription' && !payload.plan) {
            Toast.show({ type: 'error', text1: 'Subscription plan is missing' });
            return;
        }
        try {
            setLoading(true);
            Toast.show({ type: 'info', text1: 'Creating Razorpay order...' });
            const { data } = await axios.post(endpoint, payload, {
                withCredentials: true,
            });
            onInitiated?.(data);
            const order = data?.order;
            const orderId = order?.id;
            const orderAmount = order?.amount;
            const orderCurrency = order?.currency || 'USD';
            if (!orderId || !orderAmount) {
                throw new Error('Order ID or amount missing from server response');
            }
            // console.log(data)
            Toast.show({ type: 'info', text1: 'Opening Razorpay checkout...' });
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: String(orderAmount),
                currency: orderCurrency,
                name: 'Company Vista Payment',
                description: 'Invoice Payment',
                order_id: orderId,
            };
            // console.log(options , "options")
            const razorpayResponse = await RazorpayCheckout.open(options);
            console.log(razorpayResponse, "razorpayResponse");
            Toast.show({ type: 'success', text1: 'Payment successful!' });
            axios.post(`${API_BASE_URL}/api/subscription/verify-payment`, {
                ...razorpayResponse,
                companyId,
                invoiceId: invoice?.id,
                amount,
                type: paymentType,
            }, { withCredentials: true }).catch((err) => { console.log(err, "err"); });
            if (invoice?.id) {
                pollPaymentStatus(invoice.id);
            }
            onSuccess?.({ ...data, razorpayResponse });
        }
        catch (error) {
            clearPaymentStatusFlow();
            if (error?.description === 'User cancelled') {
                Toast.show({ type: 'info', text1: 'Payment cancelled' });
                return;
            }
            const msg = error?.response?.data?.message ||
                error?.description ||
                error?.message ||
                'Unable to complete Razorpay payment';
            Toast.show({ type: 'error', text1: msg });
        }
        finally {
            setLoading(false);
        }
    };
    return (<Pressable onPress={handlePayment} disabled={loading} style={({ pressed }) => [
            styles.button,
            buttonStyle,
            loading && styles.buttonDisabled,
            pressed && !loading && styles.buttonPressed,
        ]}>
      {loading ? (<ActivityIndicator size="small" color="#ffffff"/>) : null}
      <Text style={styles.buttonText}>
        {loading ? 'Processing...' : label}
      </Text>
    </Pressable>);
}
const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#072654',
        shadowColor: '#072654',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: '#ffffff',
        fontSize: font.lg,
        fontWeight: '600',
    },
});
