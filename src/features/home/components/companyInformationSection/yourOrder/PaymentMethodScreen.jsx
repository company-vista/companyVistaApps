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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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
  const stripeInitiatedRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  // TEST: jab stripe payment pe jaye aur wapas aaye tab shareholder open karo
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        if (stripeInitiatedRef.current && selected === 'stripe') {
          stripeInitiatedRef.current = false;
          onPaymentSuccess?.({ testStripeReturn: true });
        }
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [selected, onPaymentSuccess]);

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
          onInitiated={() => {
            stripeInitiatedRef.current = true;
          }}
          onSuccess={(data) => {
            stripeInitiatedRef.current = false;
            onPaymentSuccess?.(data);
            onSelectPayment?.(selected, data);
          }}
        />
      );
    }
    if (selected === 'razorpay' || selected === 'upi') {
      return (
        <RazorpayOneTimePayment
          invoice={paymentInvoice}
          label={selected === 'upi' ? 'Pay with UPI' : 'Pay with Razorpay'}
          onSuccess={(data) => {
            onPaymentSuccess?.(data);
            onSelectPayment?.(selected, data);
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
        <BackButton onPress={onBackPress} />
        <Image source={logoR} style={styles.logoImage} resizeMode="contain" />
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Choose <Text style={styles.italicTitle}>payment</Text>
          </Text>
          <Text style={[styles.subTitle, { color: colors.muted }]}>Select your preferred payment method</Text>
        </View>

        <View style={styles.methodsContainer}>
          {methods.map((m) => {
            const isSelected = selected === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.8}
                onPress={() => setSelected(m.id)}
                style={[styles.methodCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }, isSelected && styles.methodCardSelected]}>
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
