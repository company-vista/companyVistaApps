import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { forgotPassword } from '../api/forgotPasswordApi';
import { s } from '../../../theme/responsive';
import { useThemeColors, themePalette } from '../../../theme/colors';
import { font } from '../../../theme/typography';

export default function OtpVerifyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(42);
  const inputs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleOtpChange(text, index) {
    if (text.length > 1) text = text.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, '');
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e, index) {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  }

  async function handleVerify() {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Toast.show({ type: 'error', text1: 'Please enter 6-digit OTP' });
      return;
    }
    setLoading(true);
    try {
      const { API_BASE_URL } = await import('../../../config/api');
      const axios = (await import('axios')).default;
      const response = await axios.post(`${API_BASE_URL}/api/client/auth/otpverify-app`, {
        email,
        otp: otpString,
      });
      const token = response.data?.token;
      if (token) {
        Toast.show({ type: 'success', text1: 'Verified' });
        navigation.navigate('ResetPassword', { token, email });
      } else {
        Toast.show({ type: 'error', text1: 'Something went wrong' });
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Invalid OTP. Please try again.';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await forgotPassword(email);
      Toast.show({ type: 'success', text1: res?.message || 'Code resent' });
      setCountdown(42);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to resend';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setResending(false);
    }
  }

  const isOtpComplete = otp.join('').length === 6;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} />
            <Image source={logoR} style={styles.topLogo} />
          </View>

          <View style={styles.textSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              Check your <Text style={[styles.italicTitle, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}>inbox</Text>
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>We've sent a 6-digit verification code to</Text>
            <View style={[styles.emailChip, { backgroundColor: isDark ? themePalette.hex_0f172a : colors.surface, borderColor: isDark ? themePalette.hex_d4af37 : colors.border }]}>
              <Ionicons name="mail-outline" size={16} color={isDark ? themePalette.hex_d4af37 : colors.primary} />
              <Text style={[styles.chipText, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}>{email}</Text>
            </View>
          </View>

          <View style={styles.otpSection}>
            <View style={styles.dividerContainer}>
              <Text style={[styles.label, { color: colors.subtle }]}>ENTER THE CODE</Text>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.codeContainer}>
              {otp.map((digit, index) => {
                const isActive = index === otp.findIndex(v => v === '') || (isOtpComplete && index === 5);
                const hasValue = !!digit;
                return (
                  <View
                    key={index}
                    style={[
                      styles.codeBox,
                      { backgroundColor: isDark ? themePalette.hex_0b1120 : colors.inputBackground, borderColor: isActive ? (isDark ? themePalette.hex_d4af37 : colors.primary) : hasValue ? colors.inputBorder : colors.border },
                    ]}>
                    <TextInput
                      ref={el => (inputs.current[index] = el)}
                      style={[styles.codeText, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}
                      value={digit}
                      onChangeText={text => handleOtpChange(text, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectionColor={isDark ? themePalette.hex_d4af37 : colors.primary}
                      autoFocus={index === 0}
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.resendContainer}>
              <Text style={[styles.resendLabel, { color: colors.muted }]}>Didn't receive it?</Text>
              {countdown > 0 ? (
                <View style={[styles.resendButton, { backgroundColor: isDark ? themePalette.hex_0f172a : colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="time-outline" size={14} color={colors.subtle} />
                  <Text style={[styles.resendText, { color: colors.muted }]}>
                    Resend in 0:{countdown < 10 ? `0${countdown}` : countdown}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.resendButton, { backgroundColor: isDark ? themePalette.rgba_212_175_55_0_1 : colors.accentSoft, borderColor: isDark ? themePalette.hex_d4af37 : colors.primary }]}
                  onPress={handleResend}
                  disabled={resending}>
                  <Text style={[styles.resendTextActive, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}>{resending ? 'Sending...' : 'Resend Code'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={[styles.warningCard, { backgroundColor: isDark ? themePalette.hex_0b1120 : colors.surface, borderColor: isDark ? themePalette.hex_854d0e : colors.border }]}>
            <Ionicons name="warning-outline" size={18} color={isDark ? themePalette.hex_d4af37 : colors.primary} style={{ marginRight: s(10) }} />
            <Text style={[styles.warningText, { color: colors.muted }]}>
              Never share this code. CompanyVista will <Text style={[styles.boldText, { color: colors.text }]}>never ask</Text> for your OTP over phone or email.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.changeEmailButton, { backgroundColor: isDark ? themePalette.hex_070a12 : colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.8}>
            <Ionicons name="create-outline" size={16} color={colors.muted} />
            <Text style={[styles.changeEmailText, { color: colors.text }]}>Change email address</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, !isDark && { backgroundColor: themePalette.hex_2563eb }, !isOtpComplete && styles.submitButtonDisabled]}
              onPress={handleVerify}
              disabled={loading || !isOtpComplete}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={isDark ? themePalette.hex_070a12 : themePalette.hex_ffffff} />
              ) : (
                <>
                  <Text style={[styles.submitButtonText, !isDark && { color: themePalette.hex_ffffff }]}>Verify Code</Text>
                  <Text style={[styles.arrowIcon, !isDark && { color: themePalette.hex_ffffff }]}>→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: s(16), paddingBottom: s(20), justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(12), marginTop: s(10) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  textSection: { alignItems: 'center', marginVertical: s(15) },
  title: { fontSize: font.displayMedium, fontWeight: '600', textAlign: 'center' },
  italicTitle: { fontStyle: 'italic', fontWeight: '400' },
  description: { textAlign: 'center', marginTop: s(6), fontSize: font.base },
  emailChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: s(16), paddingVertical: s(10), marginTop: s(12), gap: 8 },
  chipText: { fontSize: font.base, fontWeight: '600' },
  otpSection: { width: '100%', marginVertical: s(10) },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: s(16) },
  label: { fontSize: font.sm, fontWeight: '700', letterSpacing: 1, marginRight: s(10) },
  line: { flex: 1, height: 1 },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  codeBox: { width: s(44), height: s(54), borderRadius: s(12), borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  codeText: { fontSize: font.display, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center', width: '100%', height: '100%' },
  resendContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: s(20), gap: 10, flexWrap: 'wrap' },
  resendLabel: { fontSize: font.base },
  resendButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: s(12), paddingVertical: s(6), gap: 6 },
  resendText: { fontSize: font.sm, fontWeight: '600' },
  resendTextActive: { fontSize: font.sm, fontWeight: '700' },
  warningCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: s(12), marginVertical: s(10) },
  warningText: { fontSize: font.base, flex: 1, lineHeight: 20 },
  boldText: { fontWeight: '700' },
  changeEmailButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingVertical: s(14), marginTop: s(4), gap: 8 },
  changeEmailText: { fontSize: font.base, fontWeight: '600' },
  footer: { marginTop: s(20) },
  submitButton: { backgroundColor: themePalette.hex_d4af37, width: '100%', height: 52, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: themePalette.hex_070a12, fontSize: font.lg, fontWeight: '700' },
  arrowIcon: { color: themePalette.hex_070a12, fontSize: font.xl, fontWeight: 'bold' },
});
