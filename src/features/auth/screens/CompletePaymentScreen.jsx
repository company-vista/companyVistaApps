import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setHasCompletedPayment } from '../../../store/slices/authSlice';
import { savePaymentConfirmApi, fetchReviewApi, createCheckoutApi, finalizeCheckoutApi } from '../api/orderApi';
import StripeCheckoutModal from '../../../components/StripeCheckoutModal';
import { s } from '../../../theme/responsive';

export default function CompletePaymentScreen({ navigation, route }) {
  const {
    selectedStructure = '',
    companyName = '',
    selectedEnding = '',
    selectedState = 'Delaware',
    selectedCountry = 'US',
    selectedAddOns = {},
    addOnsTotal = 0,
    runningTotal = 0,
  } = route.params || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12 / 28');
  const [cvc, setCvc] = useState('***');
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

  const structurePriceMap = { LLC: 299, 'C-Corp': 399, 'S-Corp': 399 };
  const structurePrice = route.params?.selectedStructurePrice ?? structurePriceMap[selectedStructure] ?? 299;
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
      const companyId = route.params?.companyId || pendingOrder?.companyId || companyName || 'temp-company-id';
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
        userEmail: route.params?.email || '',
        fullName: route.params?.fullName || '',
        email: route.params?.email || '',
        companyId: cleanCompanyId,
        sessionId: cleanSessionId,
        registrationStatus: respData.registrationStatus,
      };
      await savePaymentConfirmApi(statusParams, token).catch(()=>{});
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

        <TouchableOpacity activeOpacity={0.8} onPress={() => setPaymentMethod('card')} style={[styles.paymentCard, paymentMethod === 'card' && styles.selectedPaymentCard]}>
          <View style={styles.paymentLeft}>
            <View style={styles.cardLogoBox}>
              <FontAwesome name="cc-visa" size={20} color="#5C6BC0" />
            </View>
            <View style={styles.paymentTextGroup}>
              <Text style={styles.paymentTitle}>Card</Text>
              <Text style={styles.paymentSubtext}>Visa, Mastercard, Amex</Text>
            </View>
          </View>
          <View style={[styles.radioOuter, paymentMethod === 'card' && styles.radioOuterSelected]}>
            {paymentMethod === 'card' && <Ionicons name="checkmark" size={12} color="#0A111D" />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => setPaymentMethod('bank')} style={[styles.paymentCard, paymentMethod === 'bank' && styles.selectedPaymentCard]}>
          <View style={styles.paymentLeft}>
            <View style={styles.iconBox}>
              <FontAwesome5 name="university" size={16} color="#8E9BAE" />
            </View>
            <View style={styles.paymentTextGroup}>
              <Text style={styles.paymentTitle}>Bank transfer</Text>
              <Text style={styles.paymentSubtext}>Wire / ACH · 1–2 days to clear</Text>
            </View>
          </View>
          <View style={[styles.radioOuter, paymentMethod === 'bank' && styles.radioOuterSelected]}>
            {paymentMethod === 'bank' && <Ionicons name="checkmark" size={12} color="#0A111D" />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => setPaymentMethod('crypto')} style={[styles.paymentCard, paymentMethod === 'crypto' && styles.selectedPaymentCard]}>
          <View style={styles.paymentLeft}>
            <View style={styles.cryptoIconBox}>
              <FontAwesome name="bitcoin" size={18} color="#FF9800" />
            </View>
            <View style={styles.paymentTextGroup}>
              <Text style={styles.paymentTitle}>Crypto</Text>
              <Text style={styles.paymentSubtext}>USDT, USDC, BTC</Text>
            </View>
          </View>
          <View style={[styles.radioOuter, paymentMethod === 'crypto' && styles.radioOuterSelected]}>
            {paymentMethod === 'crypto' && <Ionicons name="checkmark" size={12} color="#0A111D" />}
          </View>
        </TouchableOpacity>

        {paymentMethod === 'card' && (
          <View style={styles.cardInputSection}>
            <Text style={styles.inputLabel}>CARD NUMBER</Text>
            <View style={styles.inputBox}>
              <Ionicons name="card-outline" size={18} color="#8E9BAE" style={styles.inputIcon} />
              <TextInput style={styles.textInput} value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric" placeholderTextColor="#5B6B7C" />
            </View>
            <View style={styles.rowInputs}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.inputLabel}>EXPIRY</Text>
                <View style={styles.inputBox}>
                  <TextInput style={styles.textInput} value={expiry} onChangeText={setExpiry} keyboardType="numeric" placeholderTextColor="#5B6B7C" />
                </View>
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.inputLabel}>CVC</Text>
                <View style={styles.inputBox}>
                  <TextInput style={styles.textInput} value={cvc} onChangeText={setCvc} keyboardType="numeric" secureTextEntry placeholderTextColor="#5B6B7C" />
                </View>
              </View>
            </View>
            <View style={styles.securityBanner}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#00E676" style={styles.shieldIcon} />
              <Text style={styles.securityText}>Payments processed by Stripe. We never store your card details.</Text>
            </View>
          </View>
        )}
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
  iconBox: { width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' },
  cryptoIconBox: { width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(255, 152, 0, 0.1)', justifyContent: 'center', alignItems: 'center' },
  paymentTextGroup: { marginLeft: s(12) },
  paymentTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  paymentSubtext: { color: '#6C7A8E', fontSize: 11, marginTop: s(2) },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#4A5768', justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  cardInputSection: { marginTop: s(10) },
  inputLabel: { color: '#6C7A8E', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: s(6) },
  inputBox: { backgroundColor: '#0C1622', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: s(12), marginBottom: s(12) },
  inputIcon: { marginRight: s(8) },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  halfInputContainer: { flex: 1 },
  securityBanner: { backgroundColor: 'rgba(0, 230, 118, 0.05)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', padding: s(10), flexDirection: 'row', alignItems: 'center', marginTop: s(4) },
  shieldIcon: { marginRight: s(8) },
  securityText: { color: '#8E9BAE', fontSize: 11, flex: 1 },
  footerContainer: { paddingHorizontal: s(16), paddingTop: s(10), paddingBottom: s(16), backgroundColor: '#080E18' },
  payButton: { backgroundColor: '#D4AF37', height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { marginTop: 10, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#8E9BAE', fontSize: 14, fontWeight: '600' },
  lockIcon: { marginRight: s(8) },
  payButtonText: { color: '#0A111D', fontSize: 16, fontWeight: '700' },
});
