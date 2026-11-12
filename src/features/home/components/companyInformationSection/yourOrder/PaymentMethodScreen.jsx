import { font } from '../../../../../theme/typography';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  BackHandler,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import BackButton from '../../../../../components/buttons/BackButton';
import logoR from '../../../../../assets/images/logoR.png';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../../theme/colors';
import StripeOneTimePayment from '../../../../../stripe_pament_section/StripeOneTimePayment';
import RazorpayOneTimePayment from '../../../../../stripe_pament_section/RazorpayOneTimePayment';
import { s } from '../../../../../theme/responsive';

const PaymentMethodScreen = ({ onBackPress, onSelectPayment, invoice, amount = 3090, companyId, onPaymentSuccess }) => {
  const colors = useThemeColors(); const isLight = colors.mode === 'light';
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [upiExpanded, setUpiExpanded] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  // Payment chal raha hai? Tab tak back block. StatusStripeOneTimePayment ke
  // onInitiated/onSuccess/onFailure se hi set hota hai — app se wapas aane par
  // koi success assume nahi karte (Stripe WebView app ke andar hi rehta hai,
  // to user wapas aa kar background/active transition nahi deta).
  const [isPaymentPending, setIsPaymentPending] = useState(false);

  const upiApps = [
    { id: 'gpay', name: 'Google Pay', icon: 'google', color: themePalette.hex_4285f4 },
    { id: 'phonepe', name: 'PhonePe', icon: 'mobile', color: themePalette.hex_5f259f },
    { id: 'paytm', name: 'Paytm', icon: 'credit-card', color: themePalette.hex_00baf2 },
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
      Alert.alert(
        'Payment in progress',
        'Payment is currently being verified. Do you want to cancel the payment and go back?',
        [
          { text: 'Stop', style: 'cancel' },
          {
            text: 'Cancel & Go Back', style: 'destructive', onPress: () => {
              setIsPaymentPending(false);
              onBackPress?.();
            }
          },
        ]
      );
      return;
    }
    onBackPress?.();
  };

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
      color: themePalette.hex_635bff,
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      desc: 'NetBanking, Cards · India',
      icon: 'credit-card',
      color: themePalette.hex_0a64f5,
    },
    {
      id: 'upi',
      name: 'UPI',
      desc: 'Google Pay, PhonePe, Paytm · Instant',
      icon: 'mobile',
      color: themePalette.hex_10b981,
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
            setIsPaymentPending(true);
          }}
          onSuccess={(data) => {
            setIsPaymentPending(false);
            onPaymentSuccess?.(data);
            onSelectPayment?.(selected, data);
          }}
          onFailure={() => {
            // Abort ho gaya ya verification time out — user ko wapas jaane do
            setIsPaymentPending(false);
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
        <View style={{ backgroundColor: themePalette.rgba_234_179_8_0_12, borderWidth: 1, borderColor: themePalette.rgba_234_179_8_0_3, marginHorizontal: s(16), marginTop: s(6), borderRadius: 10, paddingVertical: s(8), paddingHorizontal: s(12), flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesome name="hourglass-half" size={12} color={themePalette.hex_eab308} />
          <Text style={{ color: themePalette.hex_eab308, fontSize: font.sm, fontWeight: '700', marginLeft: 6 }}>Payment verifying... please wait</Text>
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
                <View key={m.id} style={[styles.methodCard, styles.upiCard, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }, isUpiSelected && styles.methodCardSelected]}>
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
                style={[styles.methodCard, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }, isSelected && styles.methodCardSelected, isPaymentPending && { opacity: 0.6 }]}>
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
          <FontAwesome name="lock" size={12} color={themePalette.hex_10b981} />
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

const styles = makeThemeStyles(() => StyleSheet.create({
  container: { flex: 1, backgroundColor: themePalette.hex_070c16 },
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
  mainTitle: { fontSize: font.displayLarge, color: themePalette.hex_ffffff, fontWeight: '400' },
  italicTitle: { fontStyle: 'italic', color: themePalette.hex_eab308, fontWeight: 'normal' },
  subTitle: { color: themePalette.hex_9ca3af, fontSize: font.bodySmall, marginTop: s(4) },
  methodsContainer: { gap: 12, marginTop: s(8) },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themePalette.hex_0f172a,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themePalette.hex_1e293b,
    padding: s(14),
  },
  methodCardSelected: { borderColor: themePalette.hex_eab308, backgroundColor: themePalette.rgba_234_179_8_0_06 },
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
  methodName: { color: themePalette.hex_ffffff, fontSize: font.md, fontWeight: '700' },
  methodDesc: { color: themePalette.hex_6b7280, fontSize: font.sm, marginTop: s(2) },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: themePalette.hex_334155,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: themePalette.hex_eab308 },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: themePalette.hex_eab308 },
  secureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: s(20),
    backgroundColor: themePalette.rgba_16_185_129_0_08,
    borderWidth: 1,
    borderColor: themePalette.rgba_16_185_129_0_2,
    borderRadius: 10,
    paddingVertical: s(10),
  },
  upiCard: { flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' },
  upiHeader: { flexDirection: 'row', alignItems: 'center', padding: s(14) },
  upiRight: { flexDirection: 'row', alignItems: 'center' },
  upiDropdown: { borderTopWidth: 1, borderTopColor: themePalette.hex_1e293b, padding: s(8), gap: 8 },
  upiAppRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.rgba_255_255_255_0_02, borderRadius: 10, borderWidth: 1, borderColor: themePalette.hex_1e293b, paddingHorizontal: s(12), paddingVertical: s(10), gap: 10 },
  upiAppRowSelected: { borderColor: themePalette.hex_eab308, backgroundColor: themePalette.rgba_234_179_8_0_08 },
  upiAppIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  upiAppName: { flex: 1, fontSize: font.bodySmall, fontWeight: '600' },
  radioSmall: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: themePalette.hex_334155, justifyContent: 'center', alignItems: 'center' },
  radioDotSmall: { width: 8, height: 8, borderRadius: 4, backgroundColor: themePalette.hex_eab308 },
  secureText: { color: themePalette.hex_9ca3af, fontSize: font.sm },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: themePalette.hex_070c16,
    paddingHorizontal: s(16),
    paddingTop: s(12),
    borderTopWidth: 1,
    borderTopColor: themePalette.hex_1e293b,
  },
  payButton: {
    backgroundColor: themePalette.hex_334155,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: themePalette.hex_9ca3af, fontWeight: '600', fontSize: font.bodySmall },
}));
