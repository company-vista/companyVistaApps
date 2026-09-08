import React, { useState } from 'react';
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
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { Linking, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../../../config/api';
import { useAppSelector } from '../../../store/hooks';

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
  const token = useAppSelector(s => s.auth.token);

  // Calculate totals dynamically if passed
  const packagePrice = 299;
  const stateFee = 160;
  const computedAddOnsTotal = addOnsTotal || 0;
  // if runningTotal already includes stateFee, use it, else compute
  const dueNow = runningTotal || packagePrice + stateFee + computedAddOnsTotal;

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    try {
      const invoiceId = `INV-${Date.now()}`;
      const companyId = companyName || route.params?.companyId || 'temp-company-id';
      const amount = Number(dueNow) || 0;
      if (amount <= 0) {
        Toast.show({ type: 'error', text1: 'Invalid amount' });
        return;
      }
      const endpoint = `${API_BASE_URL}/api/payment/create-ontime-paynment`;
      const payload = { companyId, invoiceId, amount, plan: 'invoice', currency: 'USD' };
      const headers = token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
      Toast.show({ type: 'info', text1: 'Initializing Stripe payment...' });
      const { data } = await axios.post(endpoint, payload, { withCredentials: true, timeout: 10000, headers });
      if (!data?.url) throw new Error('Payment URL is missing');
      await Linking.openURL(data.url);
      Toast.show({ type: 'success', text1: 'Stripe checkout opened' });
      // pehle Details Received dikhao, StatusScreen khud poll karke Payment Confirmed pe toggle karega
      navigation.navigate('Status', {
        isPaid: false,
        referenceId: invoiceId,
        invoiceId: invoiceId,
        companyName: companyName ? `${companyName} ${selectedEnding || selectedStructure}`.trim() : 'Meridian Global Ventures GmbH',
        country: selectedState || selectedCountry,
        selectedState,
        selectedCountry,
        selectedStructure,
        selectedEnding,
        shareCapital: '€25,000',
        shareholdersCount: '3 people',
        userEmail: route.params?.email || 'rajesh@meridianglobal.com',
        fullName: route.params?.fullName || '',
        email: route.params?.email || '',
        countryOfResidence: route.params?.countryOfResidence || selectedCountry,
        phone: route.params?.phone || '',
        orderId: invoiceId,
        amountPaid: `$${amount}`,
        amount: amount,
        runningTotal: dueNow,
      });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Unable to start Stripe payment';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setPaying(false);
    }
  };

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
        <TouchableOpacity style={[styles.payButton, paying && { opacity: 0.6 }]} activeOpacity={0.8} onPress={handlePay} disabled={paying}>
          {paying ? <ActivityIndicator size="small" color="#0A111D" style={styles.lockIcon} /> : <Ionicons name="lock-closed" size={16} color="#0A111D" style={styles.lockIcon} />}
          <Text style={styles.payButtonText}>{paying ? 'Processing...' : `Pay $${dueNow} Securely`}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080E18' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 34, marginBottom: 16, paddingHorizontal: 16 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  titleContainer: { marginVertical: 10 },
  mainTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  italicTitle: { fontStyle: 'italic', fontWeight: '400', color: '#D4AF37' },
  subtitle: { color: '#8E9BAE', fontSize: 13 },
  summaryCard: { backgroundColor: '#0C1622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', padding: 16, marginVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryTitle: { color: '#8E9BAE', fontSize: 14 },
  summaryPrice: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 },
  totalLabel: { color: '#8E9BAE', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  totalAmount: { color: '#D4AF37', fontSize: 28, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 12 },
  sectionTitle: { color: '#6C7A8E', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginRight: 10 },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  paymentCard: { backgroundColor: '#0C1622', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedPaymentCard: { borderColor: '#D4AF37', backgroundColor: '#0E1A29' },
  paymentLeft: { flexDirection: 'row', alignItems: 'center' },
  cardLogoBox: { width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' },
  iconBox: { width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' },
  cryptoIconBox: { width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(255, 152, 0, 0.1)', justifyContent: 'center', alignItems: 'center' },
  paymentTextGroup: { marginLeft: 12 },
  paymentTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  paymentSubtext: { color: '#6C7A8E', fontSize: 11, marginTop: 2 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#4A5768', justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  cardInputSection: { marginTop: 10 },
  inputLabel: { color: '#6C7A8E', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  inputBox: { backgroundColor: '#0C1622', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 12 },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  halfInputContainer: { flex: 1 },
  securityBanner: { backgroundColor: 'rgba(0, 230, 118, 0.05)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', padding: 10, flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  shieldIcon: { marginRight: 8 },
  securityText: { color: '#8E9BAE', fontSize: 11, flex: 1 },
  footerContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, backgroundColor: '#080E18' },
  payButton: { backgroundColor: '#D4AF37', height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  lockIcon: { marginRight: 8 },
  payButtonText: { color: '#0A111D', fontSize: 16, fontWeight: '700' },
});
