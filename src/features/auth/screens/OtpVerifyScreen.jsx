import { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { forgotPassword } from '../api/forgotPasswordApi';

export default function OtpVerifyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#070A12" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header - same as Login */}
          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} />
            <Image source={logoR} style={styles.topLogo} />
          </View>

          {/* Mail Icon Section - without CompanyVista text */}
          <View style={styles.heroSection}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <View style={styles.mailIconContainer}>
                  <Text style={styles.mailIcon}>✉</Text>
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Title & Email Badge */}
          <View style={styles.textSection}>
            <Text style={styles.title}>
              Check your <Text style={styles.italicTitle}>inbox</Text>
            </Text>
            <Text style={styles.description}>We&apos;ve sent a 6-digit verification code to</Text>
            <View style={styles.emailChip}>
              <Text style={styles.chipIcon}>✉</Text>
              <Text style={styles.chipText}>{email}</Text>
            </View>
          </View>

          {/* OTP Section */}
          <View style={styles.otpSection}>
            <View style={styles.dividerContainer}>
              <Text style={styles.label}>ENTER THE CODE</Text>
              <View style={styles.line} />
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
                      hasValue && styles.codeBoxFilled,
                      isActive && styles.codeBoxActive,
                    ]}>
                    <TextInput
                      ref={el => (inputs.current[index] = el)}
                      style={styles.codeText}
                      value={digit}
                      onChangeText={text => handleOtpChange(text, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectionColor="#D4AF37"
                      autoFocus={index === 0}
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendLabel}>Didn&apos;t receive it?</Text>
              {countdown > 0 ? (
                <View style={styles.resendButton}>
                  <Text style={styles.timerIcon}>⏱</Text>
                  <Text style={styles.resendText}>
                    Resend in 0:{countdown < 10 ? `0${countdown}` : countdown}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.resendButton, styles.resendButtonActive]}
                  onPress={handleResend}
                  disabled={resending}>
                  <Text style={styles.resendTextActive}>{resending ? 'Sending...' : 'Resend Code'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Warning Banner */}
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Never share this code. CompanyVista will <Text style={styles.boldText}>never ask</Text> for your OTP over phone or email.
            </Text>
          </View>

          {/* Change Email Button */}
          <TouchableOpacity
            style={styles.changeEmailButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.8}>
            <Text style={styles.editIcon}>✏</Text>
            <Text style={styles.changeEmailText}>Change email address</Text>
          </TouchableOpacity>

          {/* Action Button */}
          <View style={styles.footer}>
            <Pressable
              style={[styles.submitButton, !isOtpComplete && styles.submitButtonDisabled]}
              onPress={handleVerify}
              disabled={loading || !isOtpComplete}>
              {loading ? (
                <ActivityIndicator color="#070A12" />
              ) : (
                <>
                  <Text style={[styles.submitButtonText, !isOtpComplete && { color: '#6B7280' }]}>
                    Verify Code
                  </Text>
                  <Text style={[styles.arrowIcon, !isOtpComplete && { color: '#6B7280' }]}>→</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070A12' },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    marginTop: 10,
  },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  heroSection: { alignItems: 'center', marginTop: 5 },
  outerCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mailIconContainer: {
    width: 75,
    height: 75,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#22D3EE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  mailIcon: { fontSize: 32, color: '#22D3EE' },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: { color: '#070A12', fontSize: 12, fontWeight: 'bold' },
  textSection: { alignItems: 'center', marginVertical: 15 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '600', textAlign: 'center' },
  italicTitle: { fontStyle: 'italic', color: '#D4AF37', fontWeight: '400' },
  description: { color: '#94A3B8', textAlign: 'center', marginTop: 6, fontSize: 14 },
  emailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
  },
  chipIcon: { color: '#D4AF37', marginRight: 8, fontSize: 14 },
  chipText: { color: '#D4AF37', fontSize: 14, fontWeight: '600' },
  otpSection: { width: '100%', marginVertical: 10 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  label: { color: '#64748B', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginRight: 10 },
  line: { flex: 1, height: 1, backgroundColor: '#1E293B' },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  codeBox: {
    width: 48,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0B1120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxFilled: { borderColor: '#334155' },
  codeBoxActive: { borderColor: '#D4AF37' },
  codeText: {
    color: '#D4AF37',
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  resendContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  resendLabel: { color: '#64748B', fontSize: 13, marginRight: 10 },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resendButtonActive: { borderColor: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.1)' },
  timerIcon: { color: '#64748B', fontSize: 12, marginRight: 6 },
  resendText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  resendTextActive: { color: '#D4AF37', fontSize: 12, fontWeight: '700' },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#854D0E',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  warningIcon: { fontSize: 14, marginRight: 10 },
  warningText: { color: '#94A3B8', fontSize: 12, flex: 1, lineHeight: 16 },
  boldText: { color: '#FFFFFF', fontWeight: '700' },
  changeEmailButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#070A12',
    marginTop: 4,
  },
  editIcon: { color: '#94A3B8', marginRight: 8, fontSize: 14 },
  changeEmailText: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
  footer: { marginTop: 20 },
  submitButton: {
    backgroundColor: '#D4AF37',
    width: '100%',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: { backgroundColor: '#1E293B', opacity: 0.8 },
  submitButtonText: { color: '#070A12', fontSize: 16, fontWeight: '700', marginRight: 8 },
  arrowIcon: { color: '#070A12', fontSize: 18, fontWeight: 'bold' },
});
