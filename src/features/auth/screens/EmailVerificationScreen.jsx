import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../../config/api';
import { handleResendVerificationApi } from '../api/signupApi';

const VerifyEmailScreen = (props) => {
  const { navigation, route } = props;
  const email = props.email || route?.params?.email || 'rajesh@meridianglobal.com';
  const signupToken = props.signupToken || route?.params?.signupToken;
  const signupClientId = props.signupClientId || route?.params?.signupClientId;
  const onEditPress = props.onEditPress;
  const onResend = props.onResend;
  const onOtpVerified = props.onOtpVerified || route?.params?.onOtpVerified;
  const isResending = props.isResending || route?.params?.isResending;
  const onBackPress = props.onBackPress;
  const companyName = props.companyName || route?.params?.companyName || 'Meridian Global Ventures LLC';
  const companyLocation = props.companyLocation || route?.params?.companyLocation || 'Delaware \u00b7 LLC';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(27);
  const inputRefs = useRef([]);

  const isCodeComplete = code.every(d => d !== '' && d !== undefined);
  const otpString = code.join('');

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCodeChange = (text, index) => {
    if (text.length > 1) text = text.slice(-1);
    // allow only numbers
    if (text && !/^\d$/.test(text)) return;
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const handleVerify = async () => {
    if (otpString.length !== 6) {
      Toast.show({ type: 'error', text1: 'Please enter 6-digit OTP' });
      return;
    }
    setVerifying(true);
    try {
      let response;
      // Your backend exports.verifyEmail expects: GET /api/verify-email/:token (single token, hashed sha256)
      // So we send the 6-digit OTP as token: GET /api/verify-email/${otpString}
      // Fallback to POST /api/client/auth/otpverify-email for legacy OTP flow if GET fails
      try {
        response = await axios.get(`${API_BASE_URL}/api/verify-email/${otpString}`);
      } catch (getErr) {
        // If GET fails (404/400), try legacy POST endpoint
        if (signupToken) {
          // For Signup flow with signupToken/clientId link, try old 2-param route then POST
          try { await axios.get(`${API_BASE_URL}/api/verify-email/${signupToken}`); } catch(e) {}
        }
        response = await axios.post(`${API_BASE_URL}/api/client/auth/otpverify-email`, {
          email,
          otp: otpString,
        });
      }
      const token = response.data?.token;
      const clientId = response.data?.clientId || response.data?.client_id || '';
      if (token) {
        Toast.show({ type: 'success', text1: 'Verified', text2: 'Email verified successfully! Set your password.' });
        onOtpVerified?.({ token, clientId });
        // Verify ke baad SetNewPasswordScreen open karo, password set ke baad Login par jayega
        // Agar SignupScreen ke andar embedded hai (onOtpVerified prop), toh wahi handle karega
        // Warna FounderDetails flow ke liye navigation se SetNewPassword par bhejo
        if (!onOtpVerified) {
          navigation.navigate('SetNewPassword', { email, clientId, token });
        }
      } else {
        Toast.show({ type: 'error', text1: 'Verification failed' });
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Invalid OTP. Please try again.';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (onResend) {
      onResend();
    } else {
      // Fallback for FounderDetails flow - direct API call
      const res = await handleResendVerificationApi(email);
      if (res.isSuccess) {
        Toast.show({ type: 'success', text1: 'Email sent', text2: res.message });
      } else {
        Toast.show({ type: 'error', text1: 'Failed', text2: res.message });
        return;
      }
    }
    setCountdown(27);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070A12" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={onBackPress || onEditPress || (() => navigation?.goBack?.())}>
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>?</Text>
            </TouchableOpacity>
          </View>

          {/* Logo & Check Icon Section */}
          <View style={styles.heroSection}>
            <Text style={styles.logoText}>
              Company<Text style={styles.logoAccent}>Vista</Text>
            </Text>

            {/* Concentric Circles & Gold Check Badge */}
            <View style={styles.outerCircle}>
              <View style={styles.checkIconContainer}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            </View>
          </View>

          {/* Title & Email Display */}
          <View style={styles.textSection}>
            <Text style={styles.title}>
              Verify your <Text style={styles.italicTitle}>email</Text>
            </Text>
            <Text style={styles.description}>
              Welcome aboard! Enter the code we sent to confirm your account and start your registration.
            </Text>

            {/* Email Chip */}
            <View style={styles.emailChip}>
              <Text style={styles.chipIcon}>✉</Text>
              <Text style={styles.chipText}>{email}</Text>
            </View>
          </View>

          {/* OTP Section */}
          <View style={styles.otpSection}>
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <View key={index} style={[styles.codeBox, digit ? styles.codeBoxActive : null]}>
                  <TextInput
                    ref={(el) => (inputRefs.current[index] = el)}
                    style={styles.codeText}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectionColor="#D4AF37"
                  />
                </View>
              ))}
            </View>

            {/* Code Verified Pill - show only when complete */}
            {isCodeComplete && (
              <View style={styles.verifiedBadgeContainer}>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.badgeCheck}>✓</Text>
                  <Text style={styles.verifiedText}>Code verified</Text>
                </View>
              </View>
            )}

            {/* Resend Link */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>
                {countdown > 0 ? `Resend available in 0:${countdown < 10 ? `0${countdown}` : countdown}  ` : "Didn't receive it? "}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || isResending}>
                <Text style={[styles.resendLink, (countdown > 0 || isResending) && styles.resendLinkDisabled]}>
                  {isResending ? 'Sending...' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Company Draft Section */}
          <View style={styles.draftSection}>
            <View style={styles.dividerContainer}>
              <Text style={styles.draftLabel}>YOUR COMPANY DRAFT</Text>
              <View style={styles.line} />
            </View>

            {/* Draft Card */}
            <View style={styles.draftCard}>
              <View style={styles.draftRow}>
                <Text style={styles.usTag}>US  Company</Text>
                <Text style={styles.companyName}>{companyName}</Text>
              </View>
              <View style={[styles.draftRow, styles.draftSubRow]}>
                <Text style={styles.draftLocation}>{companyLocation}</Text>
                <Text style={styles.savedStatus}>Saved as draft</Text>
              </View>
            </View>

            {/* Saved Banner */}
            <View style={styles.savedBanner}>
              <Text style={styles.bannerCheck}>✓</Text>
              <Text style={styles.bannerText}>
                Your registration is saved. You can complete payment and upload documents any time.
              </Text>
            </View>
          </View>

          {/* Footer Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, (!isCodeComplete || verifying) && styles.submitButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleVerify}
              disabled={!isCodeComplete || verifying}
            >
              {verifying ? (
                <ActivityIndicator color="#070A12" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Verify</Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  iconText: {
    color: '#94A3B8',
    fontSize: 18,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 5,
  },
  logoText: {
    color: '#E2E8F0',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  logoAccent: {
    color: '#D4AF37',
  },
  outerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconContainer: {
    width: 75,
    height: 75,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  checkIcon: {
    fontSize: 32,
    color: '#D4AF37',
  },
  textSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: '#D4AF37',
    fontWeight: '400',
  },
  description: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
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
  chipIcon: {
    color: '#D4AF37',
    marginRight: 8,
    fontSize: 14,
  },
  chipText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  otpSection: {
    width: '100%',
    marginVertical: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
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
  codeBoxActive: {
    borderColor: '#D4AF37',
  },
  codeText: {
    color: '#D4AF37',
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  verifiedBadgeContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeCheck: {
    color: '#10B981',
    fontSize: 12,
    marginRight: 6,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  resendLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  resendLink: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  draftSection: {
    width: '100%',
    marginVertical: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  draftLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  draftCard: {
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  draftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  draftSubRow: {
    marginTop: 6,
  },
  usTag: {
    color: '#64748B',
    fontSize: 12,
  },
  companyName: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
  },
  draftLocation: {
    color: '#64748B',
    fontSize: 12,
  },
  savedStatus: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#051E24',
    borderWidth: 1,
    borderColor: '#05524C',
    borderRadius: 12,
    padding: 12,
  },
  bannerCheck: {
    color: '#10B981',
    fontSize: 14,
    marginRight: 10,
  },
  bannerText: {
    color: '#94A3B8',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    marginTop: 15,
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    width: '100%',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#070A12',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#070A12',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VerifyEmailScreen;
