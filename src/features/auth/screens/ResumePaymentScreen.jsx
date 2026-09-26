import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import StripeCheckoutModal from '../../../components/StripeCheckoutModal';
import { s } from '../../../theme/responsive';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setHasCompletedPayment } from '../../../store/slices/authSlice';
import { createCheckoutApi, finalizeCheckoutApi, fetchReviewApi, savePaymentConfirmApi } from '../api/orderApi';

const MONGO_ID = /^[a-f\d]{24}$/i;

// App band ho jaane ke baad bhi unpaid company ka real Stripe checkout yahan se resume hota hai.
// Home ke "Pay now" CTA se aata hai. Ye CompletePaymentScreen ka replacement nahi hai,
// sirf authenticated (logged-in) user ke liye kaam karta hai.
export default function ResumePaymentScreen({ navigation, route }) {
  const params = route?.params || {};
  const dispatch = useAppDispatch();
  const token = useAppSelector(st => st.auth.token);
  const pendingSignup = useAppSelector(st => st.auth.pendingSignup);
  const pendingOrderData = useAppSelector(st => st.auth.pendingOrderData);

  const rawCompanyId =
    params.companyId ||
    params.company_id ||
    pendingSignup?.companyId ||
    pendingOrderData?.companyId ||
    null;
  const companyId = MONGO_ID.test(String(rawCompanyId || '')) ? String(rawCompanyId) : null;
  const companyName = params.companyName || pendingSignup?.fullName || 'Your company';
  const jurisdiction = params.state || params.selectedState || pendingSignup?.selectedState || null;
  const country = params.country || params.selectedCountry || pendingSignup?.selectedCountry || null;

  const [amount, setAmount] = useState(Number(params.totalAmount) || Number(pendingSignup?.totalAmount) || 0);
  const [loadingAmount, setLoadingAmount] = useState(true);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [pendingSession, setPendingSession] = useState(null);
  const pendingSessionRef = useRef(null);
  const lastSuccessUrlRef = useRef(null);

  useEffect(() => { pendingSessionRef.current = pendingSession; }, [pendingSession]);

  const amountLabel = amount > 0 ? `$${amount}` : '—';

  // Amount server se best-effort nikalo. Fail ho to bhi checkout allowed hai (backend amount decide karta hai)
  useEffect(() => {
    let cancelled = false;
    if (amount > 0 || !companyId || !token) {
      setLoadingAmount(false);
      return () => { cancelled = true; };
    }
    (async () => {
      try {
        const res = await fetchReviewApi({ companyId, token });
        if (cancelled) return;
        if (res?.isSuccess) {
          const d = res.data || {};
          const value = Number(
            d.totalAmount ?? d.amount ?? d.pricing?.totalAmount ?? d.pricing?.runningTotal ?? d.runningTotal ?? 0,
          );
          if (value > 0) setAmount(value);
        }
      } catch (error) {
        if (!cancelled) console.warn('resume payment review fetch failed', error?.message);
      } finally {
        if (!cancelled) setLoadingAmount(false);
      }
    })();
    return () => { cancelled = true; };
  }, [companyId, token, amount]);

  const handlePay = async () => {
    if (paying) return;
    if (!companyId) {
      Toast.show({ type: 'error', text1: 'Company not found', text2: 'Please contact support to complete this payment' });
      return;
    }
    if (!token) {
      Toast.show({ type: 'error', text1: 'Session expired', text2: 'Please log in again to pay' });
      return;
    }
    setPaying(true);
    try {
      const data = (await createCheckoutApi({ companyId, token })) || {};
      const url = data.checkoutUrl || data.url || data.checkout_url;
      if (!url) throw new Error(data.message || 'Payment URL missing');
      const sessionId = data.sessionId || data.session_id;
      if (sessionId) setPendingSession({ sessionId, companyId });
      setCheckoutUrl(url);
      setWebViewVisible(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Unable to start payment';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setPaying(false);
    }
  };

  const handleFinalize = useCallback(async (override = null) => {
    const active = override || pendingSessionRef.current || pendingSession;
    if (!active?.sessionId) {
      Toast.show({ type: 'error', text1: 'Session not found', text2: 'Please start the payment again' });
      return;
    }
    if (!companyId) {
      Toast.show({ type: 'error', text1: 'Company not found' });
      return;
    }
    const sessionId = String(active.sessionId).trim();
    setVerifying(true);
    try {
      const resp = await finalizeCheckoutApi({ sessionId, companyId, token });
      if (!resp?.success) throw new Error(resp?.message || 'Verification failed');
      dispatch(setHasCompletedPayment(true));
      await savePaymentConfirmApi(
        {
          isPaid: true,
          referenceId: sessionId,
          invoiceId: sessionId,
          sessionId,
          companyId,
          companyName,
          country: jurisdiction || country || '',
          totalAmount: amount || 0,
          amount: amount || 0,
          runningTotal: amount || 0,
          registrationStatus: resp.registrationStatus,
        },
        token,
      ).catch(() => {});
      Toast.show({ type: 'success', text1: 'Payment verified!' });
      navigation.navigate('Status', {
        isPaid: true,
        companyId,
        sessionId,
        referenceId: sessionId,
        invoiceId: sessionId,
        companyName,
        country: jurisdiction || country || '',
        totalAmount: amount || 0,
        amount: amount || 0,
        runningTotal: amount || 0,
        registrationStatus: resp.registrationStatus,
      });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Verification failed';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setVerifying(false);
    }
  }, [companyId, companyName, jurisdiction, country, amount, dispatch, navigation, pendingSession, token]);

  const handleWebViewSuccess = useCallback(async (successUrl) => {
    setWebViewVisible(false);
    setCheckoutUrl(null);
    lastSuccessUrlRef.current = successUrl;
    let urlSessionId = pendingSessionRef.current?.sessionId;
    let urlCompanyId = pendingSessionRef.current?.companyId || companyId;
    try {
      const parsed = new URL(successUrl);
      urlSessionId = parsed.searchParams.get('session_id') || parsed.searchParams.get('sessionId') || urlSessionId;
      urlCompanyId = parsed.searchParams.get('companyId') || parsed.searchParams.get('company_id') || urlCompanyId;
    } catch {}
    if (urlSessionId && MONGO_ID.test(String(urlCompanyId || ''))) {
      await handleFinalize({ sessionId: urlSessionId, companyId: String(urlCompanyId) });
    } else {
      Toast.show({ type: 'error', text1: 'Payment received', text2: 'Tap Verify payment to finish' });
    }
  }, [companyId, handleFinalize]);

  const handleWebViewCancel = useCallback(() => {
    setWebViewVisible(false);
    setCheckoutUrl(null);
    Alert.alert('Payment cancelled', 'You can try again whenever you are ready.');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080E18" />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Image source={logoR} style={styles.topLogo} />
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            Complete your <Text style={styles.italicTitle}>payment</Text>
          </Text>
          <Text style={styles.subtitle}>
            {jurisdiction || country ? `${companyName} · ${jurisdiction || country}` : companyName}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#D4AF37" />
            <Text style={styles.infoText}>Your registration is waiting for this payment</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#00E676" />
            <Text style={styles.infoText}>Secured by Stripe</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>DUE NOW</Text>
            {loadingAmount ? <ActivityIndicator size="small" color="#D4AF37" /> : <Text style={styles.totalAmount}>{amountLabel}</Text>}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        {pendingSession ? (
          <>
            <TouchableOpacity style={[styles.payButton, { backgroundColor: '#10B981' }, verifying && { opacity: 0.6 }]} activeOpacity={0.8} onPress={() => handleFinalize()} disabled={verifying}>
              {verifying ? <ActivityIndicator size="small" color="#fff" style={styles.lockIcon} /> : <Ionicons name="checkmark-circle" size={16} color="#fff" style={styles.lockIcon} />}
              <Text style={[styles.payButtonText, { color: '#fff' }]}>{verifying ? 'Verifying...' : 'Verify payment'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={() => setPendingSession(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={[styles.payButton, paying && { opacity: 0.6 }]} activeOpacity={0.8} onPress={handlePay} disabled={paying}>
              {paying ? <ActivityIndicator size="small" color="#0A111D" style={styles.lockIcon} /> : <Ionicons name="lock-closed" size={16} color="#0A111D" style={styles.lockIcon} />}
              <Text style={styles.payButtonText}>{paying ? 'Processing...' : amount > 0 ? `Pay ${amountLabel}` : 'Pay securely'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <StripeCheckoutModal
        visible={webViewVisible}
        checkoutUrl={checkoutUrl}
        onClose={() => setWebViewVisible(false)}
        onSuccess={handleWebViewSuccess}
        onCancel={handleWebViewCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080E18' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: s(34), marginBottom: s(16), paddingHorizontal: s(16) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(20) },
  titleContainer: { marginVertical: s(10) },
  mainTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: s(4) },
  italicTitle: { fontStyle: 'italic', fontWeight: '400', color: '#D4AF37' },
  subtitle: { color: '#8E9BAE', fontSize: 13 },
  infoCard: { backgroundColor: '#0C1622', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: s(14), marginTop: s(12) },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: s(8) },
  infoText: { color: '#8E9BAE', fontSize: 12, marginLeft: s(8), flex: 1 },
  summaryCard: { backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', padding: s(16), marginVertical: s(12) },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#8E9BAE', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  totalAmount: { color: '#D4AF37', fontSize: 28, fontWeight: '700' },
  footerContainer: { paddingHorizontal: s(16), paddingTop: s(10), paddingBottom: s(16), backgroundColor: '#080E18' },
  payButton: { backgroundColor: '#D4AF37', height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { marginTop: 10, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#8E9BAE', fontSize: 14, fontWeight: '600' },
  lockIcon: { marginRight: s(8) },
  payButtonText: { color: '#0A111D', fontSize: 16, fontWeight: '700' },
});
