import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setHasCompletedPayment } from '../../../store/slices/authSlice';
import { savePaymentConfirmApi, createCheckoutApi, finalizeCheckoutApi } from '../api/orderApi';
import StripeCheckoutModal from '../../../components/StripeCheckoutModal';
import { getStructurePrice } from '../../../utils/priceCalculator';
import { s } from '../../../theme/responsive';

export default function CompletePaymentScreen({ navigation, route }) {
  const {
    selectedStructure = '',
    companyName = '',
    selectedEnding = '',
    selectedState = 'Delaware',
    selectedCountry = 'US',
    addOnsTotal = 0,
    runningTotal = 0,
  } = route.params || {};

  // Card details collect nahi hoti — Stripe hosted checkout (handlePay →
  // createCheckoutApi → StripeCheckoutModal) khud card form dikhata hai.
  // App ke paas sirf checkoutUrl aur sessionId hote hain.
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [pendingSession, setPendingSession] = useState(null);
  const lastSuccessUrlRef = useRef(null);
  const pendingSessionRef = useRef(null);
  React.useEffect(() => { pendingSessionRef.current = pendingSession; }, [pendingSession]);

  const token = useAppSelector(s => s.auth.token);
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  const dispatch = useAppDispatch();

  // Structure price ka single source: src/utils/priceCalculator.js
  // STRUCTURE_PRICE_MAP. Pehle yahan apna alag inline map tha jisme S-Corp
  // 399 tha jabki calculator me 299 — dono flows alag total dikhate the.
  const structurePrice = getStructurePrice(selectedStructure, route.params?.selectedStructurePrice);
  const advisorPrice = route.params?.bestStatePrice ?? 0;
  const isAdvisorFlow = advisorPrice > 0;
  const directStateFee = route.params?.selectedStatePrice ?? 0;
  const countryPrice = route.params?.selectedCountryPrice ?? 0;
  let packagePrice;
  let stateFee;
  if (isAdvisorFlow) {
    packagePrice = advisorPrice;
    stateFee = 0;
  } else if ((route.params?.selectedCountry || selectedCountry) === 'US') {
    packagePrice = structurePrice;
    stateFee = directStateFee;
  } else {
    packagePrice = 0;
    stateFee = 0;
  }
  const isUSPayment = (route.params?.selectedCountry || selectedCountry) === 'US';
  const additiveBase = isAdvisorFlow ? advisorPrice : isUSPayment ? (Number(countryPrice) || 0) + (Number(directStateFee) || 0) + (Number(structurePrice) || 0) : (Number(countryPrice) || 0);
  const hasPrice = Number(route.params?.selectedCountryPrice || route.params?.bestStatePrice || route.params?.selectedStatePrice || route.params?.selectedStructurePrice || 0) > 0;
  const computedAddOnsTotal = addOnsTotal || 0;
  const dueNow = !hasPrice ? 0 : (runningTotal || (additiveBase + computedAddOnsTotal));

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    try {
      const amount = Number(dueNow) || 0;
      if (amount <= 0) {
        Toast.show({ type: 'error', text1: 'Invalid amount' });
        return;
      }
      let realCompanyId = route.params?.companyId || route.params?.company_id || pendingOrder?.companyId || companyName;
      if (!/^[a-f\d]{24}$/i.test(String(realCompanyId))) {
        Toast.show({ type: 'error', text1: 'Invalid company ID', text2: 'Please restart signup' });
        return;
      }
      Toast.show({ type: 'info', text1: 'Opening secure checkout...' });
      let data = await createCheckoutApi({ companyId: String(realCompanyId), token });
      data = data || {};
      const checkoutUrlFromApi = data?.checkoutUrl || data?.url || data?.checkout_url;
      if (!checkoutUrlFromApi) throw new Error(data?.message || 'Payment URL missing');
      const sessionId = data?.sessionId || data?.session_id;
      if (sessionId) setPendingSession({ sessionId, companyId: String(realCompanyId) });
      setCheckoutUrl(checkoutUrlFromApi);
      setWebViewVisible(true);
      Toast.show({ type: 'success', text1: 'Secure checkout opened' });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Unable to start Stripe payment';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setPaying(false);
    }
  };

  const handleFinalize = async (override = null) => {
    const activeSession = override || pendingSessionRef.current || pendingSession;
    const urlFromRef = lastSuccessUrlRef.current;
    if (!activeSession?.sessionId) {
      let parsedSid = null;
      try { if (urlFromRef) parsedSid = new URL(urlFromRef).searchParams.get('session_id') || new URL(urlFromRef).searchParams.get('sessionId'); } catch {}
      if (!parsedSid) {
        Toast.show({ type: 'error', text1: 'Session not found' });
        return;
      }
      activeSession.sessionId = parsedSid;
    }
    let verifyCompanyId = override?.companyId || activeSession?.companyId || pendingSessionRef.current?.companyId || pendingSession?.companyId;
    if (!/^[a-f\d]{24}$/i.test(String(verifyCompanyId)) && urlFromRef) {
      try {
        const p = new URL(urlFromRef);
        const urlCid = p.searchParams.get('companyId') || p.searchParams.get('company_id');
        if (urlCid && /^[a-f\d]{24}$/i.test(String(urlCid))) verifyCompanyId = String(urlCid);
      } catch {}
    }
    if (!/^[a-f\d]{24}$/i.test(String(verifyCompanyId))) {
      const routeCid = route.params?.companyId || pendingOrder?.companyId;
      if (routeCid && /^[a-f\d]{24}$/i.test(String(routeCid))) verifyCompanyId = String(routeCid);
    }
    if (!/^[a-f\d]{24}$/i.test(String(verifyCompanyId))) {
      Toast.show({ type: 'error', text1: 'Invalid company ID for verify' });
      return;
    }
    const activeSessionId = override?.sessionId || activeSession.sessionId;
    const cleanCompanyId = String(verifyCompanyId).trim();
    const cleanSessionId = String(activeSessionId).trim();
    setVerifying(true);
    try {
      const respData = await finalizeCheckoutApi({ sessionId: cleanSessionId, companyId: cleanCompanyId, token });
      if (!respData?.success) throw new Error(respData?.message || 'Verification failed');
      Toast.show({ type: 'success', text1: 'Payment verified!', text2: respData.message });
      dispatch(setHasCompletedPayment(true));
      const statusParams = {
        isPaid: true,
        referenceId: cleanSessionId,
        invoiceId: cleanSessionId,
        companyName: companyName ? `${companyName} ${selectedEnding || selectedStructure}`.trim() : 'Company',
        country: selectedState || selectedCountry,
        selectedState, selectedCountry, selectedStructure, selectedEnding,
        selectedCountryPrice: route.params?.selectedCountryPrice ?? 0,
        selectedStatePrice: route.params?.selectedStatePrice ?? 0,
        selectedStructurePrice: route.params?.selectedStructurePrice ?? 0,
        runningTotal: route.params?.runningTotal ?? 0,
        totalAmount: route.params?.runningTotal ?? route.params?.totalAmount ?? 0,
        amount: route.params?.runningTotal ?? route.params?.totalAmount ?? 0,
        userEmail: route.params?.email || '',
        fullName: route.params?.fullName || '',
        email: route.params?.email || '',
        companyId: cleanCompanyId,
        sessionId: cleanSessionId,
        registrationStatus: respData.registrationStatus,
        // Add Company flow ki identity Status/VerifyIdentity tak pahunchana
        // zaroori hai — wo isi flag se decide karte hain ki modal band
        // karna hai ya nahi. Bina iske payment ke baad flow atak jata hai.
        isAddCompanyFlow: route.params?.isAddCompanyFlow === true,
      };
      // Payment VERIFY ho chuka hai (finalizeCheckoutApi), is liye ye save
      // fail hona user ka payment rokne ki wajah nahi — order backend me
      // ban chuka hai. Isliye result check karke aage badhte hain, par
      // fail hone par bhi user ko silently Status par nahi bhejte: wo
      // background record backend me rehne dega aur reconciliation se
      // theek hoga, jabki agar yahan ruk jaate to user ko pata hi nahi
      // chalta ki payment ho gaya.
      const saveRes = await savePaymentConfirmApi(statusParams, token).catch(e => ({ isSuccess: false, error: e?.message }));
      if (!saveRes?.isSuccess) {
        console.log('=== PAYMENT CONFIRM SAVE FAILED (payment verified, continuing) ===', saveRes?.error);
      }
      // Status AuthStack, RegistrationStack aur MainStack — teenon me hai,
      // direct navigate karo
      navigation.navigate('Status', statusParams);
    } catch (e) {
      const fullErr = JSON.stringify(e?.response?.data || e.message, null, 2);
      const errMsg = e?.response?.data?.message || e?.message || '';
      Toast.show({ type: 'error', text1: errMsg || fullErr.slice(0,120) || 'Verification failed', text2: `companyId: ${cleanCompanyId.slice(-6)}` });
    } finally {
      setVerifying(false);
    }
  };

  const handleWebViewSuccess = useCallback(async (successUrl) => {
    setWebViewVisible(false);
    setCheckoutUrl(null);
    lastSuccessUrlRef.current = successUrl;
    let urlSessionId = pendingSessionRef.current?.sessionId || pendingSession?.sessionId;
    let urlCompanyId = pendingSessionRef.current?.companyId || pendingSession?.companyId;
    try {
      const parsed = new URL(successUrl);
      urlSessionId = parsed.searchParams.get('session_id') || parsed.searchParams.get('sessionId') || urlSessionId;
      urlCompanyId = parsed.searchParams.get('companyId') || parsed.searchParams.get('company_id') || urlCompanyId;
    } catch {}
    if (urlSessionId && urlCompanyId) {
      await handleFinalize({ sessionId: urlSessionId, companyId: String(urlCompanyId) });
      return;
    }
    Toast.show({ type: 'success', text1: 'Payment successful!' });
    if (pendingSession?.sessionId) await handleFinalize();
    // handleFinalize har render pe naya function banta hai (useCallback nahi
    // hai), is liye ise dep me daalne se ye callback har render dobara
    // banta — par ye useCallback ki wajah se koi behaviour depend nahi karta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSession]);

  const handleWebViewCancel = useCallback((cancelUrl) => {
    setWebViewVisible(false);
    setCheckoutUrl(null);
    Alert.alert('Payment Cancelled', 'You cancelled the payment. You can try again when ready.');
  }, []);

  const handleWebViewClose = useCallback(() => {
    setWebViewVisible(false);
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
          <Text style={styles.subtitle}>{companyName ? `${companyName} ${selectedEnding || selectedStructure} · ${selectedState}` : `Meridian Global Ventures LLC · ${selectedState}`}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>Package</Text>
            <Text style={styles.summaryPrice}>${packagePrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>{selectedState} state fee</Text>
            <Text style={styles.summaryPrice}>${stateFee}</Text>
          </View>
          {computedAddOnsTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Add-ons</Text>
              <Text style={styles.summaryPrice}>${computedAddOnsTotal}</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>DUE NOW</Text>
            <Text style={styles.totalAmount}>${dueNow}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* Card details YAHAN nahi maangi jaati. Stripe hosted checkout page
            inhe khud securely handle karta hai, aur app ko sirf checkoutUrl
            chahiye. Pehle yahan number/expiry/cvc inputs the jo pre-filled
            (4242...) the aur kabhi kahin bhejte bhi nahi the — user ko lagta
            tha wo payment ho rahi hai, actually wo sirf UI tha. */}
        <View style={[styles.paymentCard, styles.selectedPaymentCard]}>
          <View style={styles.paymentLeft}>
            <View style={styles.cardLogoBox}>
              <FontAwesome name="cc-visa" size={20} color="#5C6BC0" />
            </View>
            <View style={styles.paymentTextGroup}>
              <Text style={styles.paymentTitle}>Card</Text>
              <Text style={styles.paymentSubtext}>Visa, Mastercard, Amex</Text>
            </View>
          </View>
          <View style={[styles.radioOuter, styles.radioOuterSelected]}>
            <Ionicons name="checkmark" size={12} color="#0A111D" />
          </View>
        </View>

        <View style={styles.securityBanner}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#00E676" style={styles.shieldIcon} />
          <Text style={styles.securityText}>
            Payment Stripe ke secure checkout page par hota hai. Card details app
            tak nahi aati, hum kuch store nahi karte.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        {!pendingSession ? (
          <>
            <TouchableOpacity style={[styles.payButton, paying && { opacity: 0.6 }]} activeOpacity={0.8} onPress={handlePay} disabled={paying}>
              {paying ? <ActivityIndicator size="small" color="#0A111D" style={styles.lockIcon} /> : <Ionicons name="lock-closed" size={16} color="#0A111D" style={styles.lockIcon} />}
              <Text style={styles.payButtonText}>{paying ? 'Processing...' : `Pay $${dueNow} Securely`}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={() => navigation.goBack()} disabled={paying}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700' }}>Stripe checkout opened</Text>
              <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 4 }}>Session: {pendingSession.sessionId.slice(0,20)}... · Complete payment then verify</Text>
            </View>
            <TouchableOpacity style={[styles.payButton, { backgroundColor: '#10B981' }, verifying && { opacity: 0.6 }]} activeOpacity={0.8} onPress={handleFinalize} disabled={verifying}>
              {verifying ? <ActivityIndicator size="small" color="#fff" style={styles.lockIcon} /> : <Ionicons name="checkmark-circle" size={16} color="#fff" style={styles.lockIcon} />}
              <Text style={[styles.payButtonText, { color: '#fff' }]}>{verifying ? 'Verifying...' : 'Verify Payment'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setPendingSession(null)}>
              <Text style={{ color: '#64748B', fontSize: 11 }}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <StripeCheckoutModal
        visible={webViewVisible}
        checkoutUrl={checkoutUrl}
        onClose={handleWebViewClose}
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
  summaryCard: { backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', padding: s(16), marginVertical: s(12) },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(10) },
  summaryTitle: { color: '#8E9BAE', fontSize: 14 },
  summaryPrice: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginVertical: s(10) },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(2) },
  totalLabel: { color: '#8E9BAE', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  totalAmount: { color: '#D4AF37', fontSize: 28, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: s(10), marginBottom: s(12) },
  sectionTitle: { color: '#6C7A8E', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginRight: s(10) },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  paymentCard: { backgroundColor: '#0C1622', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', padding: s(14), marginBottom: s(10), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedPaymentCard: { borderColor: '#D4AF37', backgroundColor: '#0E1A29' },
  paymentLeft: { flexDirection: 'row', alignItems: 'center' },
  cardLogoBox: { width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' },
  paymentTextGroup: { marginLeft: s(12) },
  paymentTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  paymentSubtext: { color: '#6C7A8E', fontSize: 11, marginTop: s(2) },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#4A5768', justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  shieldIcon: { marginRight: s(8) },
  securityBanner: { backgroundColor: 'rgba(0, 230, 118, 0.05)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', padding: s(10), flexDirection: 'row', alignItems: 'center', marginTop: s(4) },
  securityText: { color: '#8E9BAE', fontSize: 11, flex: 1 },
  footerContainer: { paddingHorizontal: s(16), paddingTop: s(10), paddingBottom: s(16), backgroundColor: '#080E18' },
  payButton: { backgroundColor: '#D4AF37', height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { marginTop: 10, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#8E9BAE', fontSize: 14, fontWeight: '600' },
  lockIcon: { marginRight: s(8) },
  payButtonText: { color: '#0A111D', fontSize: 16, fontWeight: '700' },
});
