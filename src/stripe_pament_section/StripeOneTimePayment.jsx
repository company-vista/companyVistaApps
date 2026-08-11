import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { font } from '../theme/typography';
import { API_BASE_URL } from '../config/api';
import { useAppSelector } from '../store/hooks';
const API_REQUEST_TIMEOUT_MS = 10000;
let paymentStatusInterval = null;
function getAuthHeaders(token) {
    return token
        ? {
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
        }
        : {};
}
function clearPaymentStatusFlow() {
    if (paymentStatusInterval) {
        clearInterval(paymentStatusInterval);
        paymentStatusInterval = null;
    }
}
function pollPaymentStatus({ referenceId, token, onPaid, onGiveUp }) {
    clearPaymentStatusFlow();
    let attempts = 0;
    const MAX_ATTEMPTS = 12;
    paymentStatusInterval = setInterval(async () => {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            clearPaymentStatusFlow();
            onGiveUp?.();
            return;
        }
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/payment/details/${referenceId}`, {
                withCredentials: true,
                timeout: API_REQUEST_TIMEOUT_MS,
                params: { _t: Date.now() },
                headers: {
                    ...getAuthHeaders(token),
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                },
            });
            const stripeStatus = data?.stripeDetails?.status || '';
            const invoiceStatus = data?.invoice?.paymentStatus || data?.invoice?.status || data?.paymentStatus || '';
            const isPaid = stripeStatus === 'active' ||
                stripeStatus === 'paid' ||
                invoiceStatus === 'paid' ||
                invoiceStatus === 'completed';
            if (isPaid) {
                clearPaymentStatusFlow();
                onPaid?.(data);
            }
        }
        catch {
            // silently retry
        }
    }, 5000);
}
export default function StripeOneTimePayment({ invoice = {}, onSuccess, onInitiated, paymentType = 'invoice', label = 'Pay Now', buttonStyle, }) {
    const [loading, setLoading] = useState(false);
    const token = useAppSelector(state => state.auth.token);
    useEffect(() => {
        return () => clearPaymentStatusFlow();
    }, []);
    const handlePayment = async () => {
        console.log(invoice, 'invoice');
        if (!token) {
            Toast.show({ type: 'error', text1: 'Please login to continue' });
            return;
        }
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
        const endpoint = paymentType === 'document_subscription'
            ? `${API_BASE_URL}/api/payment/create-document-subscription`
            : paymentType === 'document_unlock'
                ? `${API_BASE_URL}/api/payment/create-document-unlock`
                : paymentType === 'service_purchase'
                    ? `${API_BASE_URL}/api/payment/create-service-purchase`
                    : `${API_BASE_URL}/api/payment/create-ontime-paynment`;
        const payload = paymentType === 'document_subscription'
            ? {
                companyId,
                plan: invoice?.plan,
                amount,
                currency: invoice?.currency || 'USD',
            }
            : paymentType === 'document_unlock'
                ? {
                    companyId,
                    documentIndex: invoice?.documentIndex,
                    currency: invoice?.currency || 'USD',
                }
                : paymentType === 'service_purchase'
                    ? {
                        companyId,
                        serviceSlug: invoice?.serviceSlug,
                        currency: invoice?.currency || 'USD',
                    }
                    : {
                        companyId,
                        invoiceId: invoice?.id,
                        amount,
                        plan: 'invoice',
                        currency: invoice?.currency || 'USD',
                    };
        if (paymentType === 'document_subscription' && !payload.plan) {
            Toast.show({ type: 'error', text1: 'Subscription plan is missing' });
            return;
        }
        if (paymentType === 'document_unlock' &&
            (payload.documentIndex === undefined || payload.documentIndex === null)) {
            Toast.show({ type: 'error', text1: 'Document reference is missing' });
            return;
        }
        try {
            setLoading(true);
            Toast.show({ type: 'info', text1: 'Initializing payment...' });
            const { data } = await axios.post(endpoint, payload, {
                withCredentials: true,
                timeout: API_REQUEST_TIMEOUT_MS,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                },
            });
            onInitiated?.(data);
            if (!data?.url) {
                throw new Error('Payment URL is missing');
            }
            await Linking.openURL(data.url);
            const referenceId = invoice?.id || data?.paymentId || data?.orderId || data?.id || '';
            if (referenceId) {
                Toast.show({ type: 'info', text1: 'Verifying payment status...' });
                pollPaymentStatus({
                    referenceId,
                    token,
                    onPaid: (statusData) => {
                        Toast.show({ type: 'success', text1: 'Payment successful!' });
                        onSuccess?.(statusData || data);
                    },
                    onGiveUp: () => {
                        Toast.show({ type: 'info', text1: 'Payment not confirmed', text2: 'Your payment may still be processing. Check Transactions shortly.' });
                    },
                });
            }
            else {
                Toast.show({ type: 'info', text1: 'Payment initiated', text2: 'Payment status will update shortly.' });
            }
        }
        catch (error) {
            clearPaymentStatusFlow();
            const msg = error?.response?.data?.message ||
                error?.message ||
                'Unable to start Stripe payment';
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
        {loading ? (<ActivityIndicator size="small" color="#ffffff" />) : null}
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
        backgroundColor: '#10B981',
        shadowColor: '#059669',
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
