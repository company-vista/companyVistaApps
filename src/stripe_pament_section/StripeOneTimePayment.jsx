import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { s } from '../theme/responsive';
import { font } from '../theme/typography';
import { API_BASE_URL } from '../config/api';
import { useAppSelector } from '../store/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
// **************Old payment status clear and poll functions**********************
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
        catch (err) {
        }
    }, 5000);
}
export default function StripeOneTimePayment(props) {
    const routeInvoice = props?.route?.params?.invoice;
    const routePaymentType = props?.route?.params?.paymentType;
    const routeLabel = props?.route?.params?.label;
    const invoice = props.invoice || routeInvoice || {};
    const onSuccess = props.onSuccess || props?.route?.params?.onSuccess;
    const onInitiated = props.onInitiated || props?.route?.params?.onInitiated;
    const onFailure = props.onFailure || props?.route?.params?.onFailure;
    const paymentType = props.paymentType || routePaymentType || 'invoice';
    const label = props.label || routeLabel || 'Pay Now';
    const buttonStyle = props.buttonStyle;
    const [loading, setLoading] = useState(false);
    const token = useAppSelector(state => state.auth.token);
    useEffect(() => {
        return () => clearPaymentStatusFlow();
    }, []);
    const handlePayment = async () => {
        // bina login ke payment allow - token optional rakha hai
        // agar token nahi hai to bina Auth header ke API call hogi
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
                    ...getAuthHeaders(token),
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
                        // navigate to dynamic StatusScreen on payment success
                        const nav = props?.navigation;
                        if (nav?.navigate) {
                          nav.navigate('Status', {
                            isPaid: true,
                            companyName: props?.route?.params?.companyName || invoice?.companyId || 'Meridian Global Ventures GmbH',
                            country: props?.route?.params?.selectedState || 'Germany',
                            userEmail: props?.route?.params?.email || 'rajesh@meridianglobal.com',
                            orderId: referenceId,
                            amountPaid: `$${invoice?.amount || ''}`,
                            amount: invoice?.amount,
                          });
                        }
                    },
                    onGiveUp: () => {
                        Toast.show({ type: 'info', text1: 'Payment not confirmed', text2: 'Your payment may still be processing. Check Transactions shortly.' });
                        onFailure?.();
                    },
                });
            }
            else {
                Toast.show({ type: 'info', text1: 'Payment initiated', text2: 'Payment status will update shortly.' });
            }
        }
        catch (error) {
            clearPaymentStatusFlow();
            onFailure?.(error);
            const msg = error?.response?.data?.message ||
                error?.message ||
                'Unable to start Stripe payment';
            Toast.show({ type: 'error', text1: msg });
        }
        finally {
            setLoading(false);
        }
    };
    const isScreen = !!props?.route || !!props?.navigation;
    const navigation = props?.navigation;

    const button = (
      <Pressable onPress={handlePayment} disabled={loading} style={({ pressed }) => [
        styles.button,
        buttonStyle,
        loading && styles.buttonDisabled,
        pressed && !loading && styles.buttonPressed,
      ]}>
        {loading ? (<ActivityIndicator size="small" color="#ffffff" />) : null}
        <Text style={styles.buttonText}>
            {loading ? 'Processing...' : label}
        </Text>
      </Pressable>
    );

    if (!isScreen) return button;

    const amount = invoice?.amount || props?.route?.params?.runningTotal || 0;
    const companyName = props?.route?.params?.companyName || invoice?.companyId || '';

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#080E18" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stripe Payment</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Amount to Pay</Text>
            <Text style={styles.amountText}>${amount}</Text>
            {companyName ? <Text style={styles.companyText}>{companyName}</Text> : null}
            <Text style={styles.descText}>You will be redirected to Stripe checkout to complete the payment securely. We never store your card details.</Text>
          </View>
          <View style={styles.secureRow}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.secureText}> Secured by Stripe</Text>
          </View>
          {button}
        </ScrollView>
      </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: s(24),
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
    container: { flex: 1, backgroundColor: '#080E18' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: s(16), paddingTop: 34, paddingBottom: 16 },
    backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    scrollContent: { paddingHorizontal: s(16), paddingBottom: 24, paddingTop: 10 },
    card: { backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', padding: 20, alignItems: 'center', marginBottom: 16 },
    cardLabel: { color: '#8E9BAE', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
    amountText: { color: '#D4AF37', fontSize: 32, fontWeight: '800', marginBottom: 6 },
    companyText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
    descText: { color: '#8E9BAE', fontSize: 12, lineHeight: 18, textAlign: 'center' },
    secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: s(14), marginBottom: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)' },
    secureText: { color: '#10B981', fontSize: 12, fontWeight: '600' },
});
