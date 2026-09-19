import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  AppState,
  BackHandler,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import BackButton from '../../../../../components/buttons/BackButton';
import logoR from '../../../../../assets/images/logoR.png';
import { useThemeColors } from '../../../../../theme/colors';
import StripeOneTimePayment from '../../../../../stripe_pament_section/StripeOneTimePayment';
import RazorpayOneTimePayment from '../../../../../stripe_pament_section/RazorpayOneTimePayment';
import { s } from '../../../../../theme/responsive';

const PaymentMethodScreen = ({ onBackPress, onSelectPayment, invoice, amount = 3090, companyId, onPaymentSuccess }) => {
  const colors = useThemeColors(); const isLight = colors.mode === 'light';
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [upiExpanded, setUpiExpanded] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const stripeInitiatedRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const [isPaymentPending, setIsPaymentPending] = useState(false);

  const upiApps = [
    { id: 'gpay', name: 'Google Pay', icon: 'google', color: '#4285F4' },
    { id: 'phonepe', name: 'PhonePe', icon: 'mobile', color: '#5F259F' },
    { id: 'paytm', name: 'Paytm', icon: 'credit-card', color: '#00BAF2' },
  ];

  // Jab tak payment success nhi hota, home/back na khule - hardware back block
  useEffect(() => {
    if (!isPaymentPending) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Toast.show({ type: 'info', text1: 'Payment in progress', text2: 'Please complete payment before going back' });
      return true; // block
    });
    return () => sub.remove();
  }, [isPaymentPending]);

  const handleBackPress = () => {
    if (isPaymentPending) {
      Toast.show({ type: 'info', text1: 'Payment in progress', text2: 'Please complete or wait for payment verification' });
      // optional: confirm if user really wants to cancel
      Alert.alert(
        'Payment in progress',
        'Payment is currently being verified. Do you want to cancel the payment and go back?',
        [
          { text: 'Stop', style: 'cancel' },
          {
            text: 'Cancel & Go Back', style: 'destructive', onPress: () => {
              setIsPaymentPending(false);
              stripeInitiatedRef.current = false;
              onBackPress?.();
            }
          },
        ]
      );
      return;
    }
    onBackPress?.();
  };

  // TEST: jab stripe payment pe jaye aur wapas aaye tab shareholder open karo
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        if (stripeInitiatedRef.current && selected === 'stripe') {
          // pending rehne do jab tak pollPaymentStatus onSuccess/onGiveUp na bole
          // testStripeReturn ko success nahi manenge jab payment pending hai
          if (!isPaymentPending) {
            stripeInitiatedRef.current = false;
            onPaymentSuccess?.({ testStripeReturn: true });
          }
        }
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [selected, onPaymentSuccess, isPaymentPending]);

  const paymentInvoice = invoice ?? {
    id: 'Q-2026-0412',
    companyId: companyId ?? 'demo-company-id',
    amount: amount,
    currency: selected === 'razorpay' || selected === 'upi' ? 'INR' : 'USD',
  };

  const methods = [
    {
      id: 'stripe',
      name: 'Stripe',
      desc: 'Pay with credit/debit card · International',
      icon: 'cc-stripe',
      color: '#635BFF',
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      desc: 'NetBanking, Cards · India',
      icon: 'credit-card',
      color: '#0A64F5',
    },
    {
      id: 'upi',
      name: 'UPI',
      desc: 'Google Pay, PhonePe, Paytm · Instant',
      icon: 'mobile',
      color: '#10B981',
    },
  ];

  const handleSelectPay = () => {
    if (onSelectPayment) onSelectPayment(selected);
  };

  const renderPaymentButton = () => {
    if (!selected) {
      return (
        <View style={[styles.payButton, styles.payButtonDisabled]}>
          <Text style={styles.payButtonText}>Select a payment method</Text>
        </View>
      );
    }
    if (selected === 'stripe') {
      return (
        <StripeOneTimePayment
          invoice={paymentInvoice}
          label="Pay with Stripe"
          onInitiated={(data) => {
            stripeInitiatedRef.current = true;
            setIsPaymentPending(true);
          }}
          onSuccess={(data) => {
            stripeInitiatedRef.current = false;
            setIsPaymentPending(false);
            onPaymentSuccess?.(data);
            onSelectPayment?.(selected, data);
          }}
          onFailure={() => {
            // giveUp pe bhi pending false kar do taaki user wapas ja sake, ya true rakhna hai toh yaha return kar do
            setIsPaymentPending(false);
            stripeInitiatedRef.current = false;
          }}
        />
      );
    }
    if (selected === 'razorpay' || selected === 'upi') {
      return (
        <RazorpayOneTimePayment
          invoice={paymentInvoice}
          label={selected === 'upi' ? 'Pay with UPI' : 'Pay with Razorpay'}
          onInitiated={() => {
            setIsPaymentPending(true);
          }}
          onSuccess={(data) => {
            setIsPaymentPending(false);
            onPaymentSuccess?.(data);
            onSelectPayment?.(selected, data);
          }}
          onFailure={() => {
            setIsPaymentPending(false);
          }}
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <View style={[styles.header, { marginTop: s(8) }]}>
        <View style={{ opacity: isPaymentPending ? 0.4 : 1 }}>
          <BackButton onPress={handleBackPress} disabled={isPaymentPending} />
        </View>
        <Image source={logoR} style={styles.logoImage} resizeMode="contain" />
        <View style={{ width: 34 }} />
      </View>
      {isPaymentPending && (
        <View style={{ backgroundColor: 'rgba(234,179,8,0.12)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.3)', marginHorizontal: s(16), marginTop: s(6), borderRadius: 10, paddingVertical: s(8), paddingHorizontal: s(12), flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesome name="hourglass-half" size={12} color="#EAB308" />
          <Text style={{ color: '#EAB308', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>Payment verifying... please wait</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Choose <Text style={styles.italicTitle}>payment</Text>
          </Text>
          <Text style={[styles.subTitle, { color: colors.muted }]}>Select your preferred payment method</Text>
        </View>

        <View style={styles.methodsContainer}>
          {methods.map((m) => {
            if (m.id === 'upi') {
              const isUpiSelected = selected === 'upi';
              return (
                <View key={m.id} style={[styles.methodCard, styles.upiCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }, isUpiSelected && styles.methodCardSelected]}>
                  <TouchableOpacity activeOpacity={0.8} disabled={isPaymentPending} onPress={() => { if (isPaymentPending) return; setUpiExpanded(!upiExpanded); if (!upiExpanded) setSelected('upi'); }} style={styles.upiHeader}>
                    <View style={[styles.methodIcon, { backgroundColor: `${m.color}18`, borderColor: `${m.color}40` }]}>
                      <FontAwesome name={m.icon} size={22} color={m.color} />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={[styles.methodName, { color: colors.text }]}>{m.name}</Text>
                      <Text style={[styles.methodDesc, { color: colors.muted }]}>{m.desc}</Text>
                    </View>
                    <View style={styles.upiRight}>
                      <View style={[styles.radio, { borderColor: colors.border }, isUpiSelected && styles.radioSelected]}>
                        {isUpiSelected && <View style={styles.radioDot} />}
                      </View>
                      <FontAwesome name={upiExpanded ? 'chevron-up' : 'chevron-down'} size={12} color={colors.muted} style={{ marginLeft: 8 }} />
                    </View>
                  </TouchableOpacity>
                  {upiExpanded && (
                    <View style={styles.upiDropdown}>
                      {upiApps.map((app) => {
                        const isAppSelected = selectedUpiApp === app.id && isUpiSelected;
                        return (
                            <TouchableOpacity
                              key={app.id}
                              activeOpacity={0.8}
                              disabled={isPaymentPending}
                              onPress={() => { if (isPaymentPending) return; setSelected('upi'); setSelectedUpiApp(app.id); }}
                              style={[styles.upiAppRow, { borderColor: colors.border }, isAppSelected && styles.upiAppRowSelected, isPaymentPending && { opacity: 0.6 }]}>
                            <View style={[styles.upiAppIcon, { backgroundColor: `${app.color}15`, borderColor: `${app.color}30` }]}>
                              <FontAwesome name={app.icon} size={16} color={app.color} />
                            </View>
                            <Text style={[styles.upiAppName, { color: colors.text }]}>{app.name}</Text>
                            <View style={[styles.radioSmall, { borderColor: colors.border }, isAppSelected && styles.radioSelected]}>
                              {isAppSelected && <View style={styles.radioDotSmall} />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            }
            const isSelected = selected === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.8}
                disabled={isPaymentPending}
                onPress={() => { if (!isPaymentPending) setSelected(m.id); }}
                style={[styles.methodCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }, isSelected && styles.methodCardSelected, isPaymentPending && { opacity: 0.6 }]}>
                <View style={[styles.methodIcon, { backgroundColor: `${m.color}18`, borderColor: `${m.color}40` }]}>
                  <FontAwesome name={m.icon} size={22} color={m.color} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodName, { color: colors.text }]}>{m.name}</Text>
                  <Text style={[styles.methodDesc, { color: colors.muted }]}>{m.desc}</Text>
                </View>
                <View style={[styles.radio, { borderColor: colors.border }, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.secureBanner, { borderColor: colors.border }]}>
          <FontAwesome name="lock" size={12} color="#10B981" />
          <Text style={[styles.secureText, { color: colors.muted }]}> Secure & encrypted payment · 100% safe</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + s(12), backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {renderPaymentButton()}
        {/* Fallback generic pay for UPI demo */}
        {selected === 'upi' ? null : null}
      </View>
    </View>
  );
};

export default PaymentMethodScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070C16' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: s(8),
  },
  logoImage: { width: 130, height: 32 },
  scrollContainer: { paddingHorizontal: s(16), paddingTop: s(8), paddingBottom: s(110) },
  titleContainer: { marginVertical: s(16) },
  mainTitle: { fontSize: 26, color: '#FFFFFF', fontWeight: '400' },
  italicTitle: { fontStyle: 'italic', color: '#EAB308', fontWeight: 'normal' },
  subTitle: { color: '#9CA3AF', fontSize: 13, marginTop: s(4) },
  methodsContainer: { gap: 12, marginTop: s(8) },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: s(14),
  },
  methodCardSelected: { borderColor: '#EAB308', backgroundColor: 'rgba(234,179,8,0.06)' },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: s(12),
  },
  methodInfo: { flex: 1 },
  methodName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  methodDesc: { color: '#6B7280', fontSize: 12, marginTop: s(2) },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: '#EAB308' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EAB308' },
  secureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: s(20),
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    borderRadius: 10,
    paddingVertical: s(10),
  },
  upiCard: { flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' },
  upiHeader: { flexDirection: 'row', alignItems: 'center', padding: s(14) },
  upiRight: { flexDirection: 'row', alignItems: 'center' },
  upiDropdown: { borderTopWidth: 1, borderTopColor: '#1E293B', padding: s(8), gap: 8 },
  upiAppRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 10, borderWidth: 1, borderColor: '#1E293B', paddingHorizontal: s(12), paddingVertical: s(10), gap: 10 },
  upiAppRowSelected: { borderColor: '#EAB308', backgroundColor: 'rgba(234,179,8,0.08)' },
  upiAppIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  upiAppName: { flex: 1, fontSize: 13, fontWeight: '600' },
  radioSmall: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  radioDotSmall: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EAB308' },
  secureText: { color: '#9CA3AF', fontSize: 12 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#070C16',
    paddingHorizontal: s(16),
    paddingTop: s(12),
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  payButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: '#9CA3AF', fontWeight: '600', fontSize: 13 },
});
