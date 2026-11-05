import { font } from '../../../theme/typography';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../../config/api';
import { handleResendVerificationApi } from '../api/signupApi';
import { verifyAdminEmailToken } from '../api/forgotPasswordApi';
import { s } from '../../../theme/responsive';

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
    if (route?.params?.accountType === 'admin' && route?.params?.token) return undefined;
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, route?.params?.accountType, route?.params?.token]);

  if (route?.params?.accountType === 'admin' && route?.params?.token) {
    return <AdminEmailVerification navigation={navigation} token={route.params.token} />;
  }

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
        // Verify ke baad SetNewPasswordScreen open karo
        // Agar embedded hai (onOtpVerified prop), toh wahi handle karega
        // Warna FounderDetails flow ke liye navigation se SetNewPassword par bhejo (with onboarding params)
        if (!onOtpVerified) {
          const nextParams = {
            email,
            clientId,
            token,
            companyId: route?.params?.companyId || route?.params?.company_id,
            totalAmount: route?.params?.totalAmount ?? route?.params?.total_amount,
            pricingType: route?.params?.pricingType,
            from: route?.params?.from,
            selectedStructure: route?.params?.selectedStructure,
            selectedState: route?.params?.selectedState,
            selectedEnding: route?.params?.selectedEnding,
            selectedCountry: route?.params?.selectedCountry,
            selectedCountryPrice: route?.params?.selectedCountryPrice,
            bestCountry: route?.params?.bestCountry,
            bestCountryPrice: route?.params?.bestCountryPrice,
            bestCountryName: route?.params?.bestCountryName,
            selectedStatePrice: route?.params?.selectedStatePrice,
            selectedStructurePrice: route?.params?.selectedStructurePrice,
            bestState: route?.params?.bestState,
            bestStatePrice: route?.params?.bestStatePrice,
            bestStatePriceNote: route?.params?.bestStatePriceNote,
            bestStateTimeframe: route?.params?.bestStateTimeframe,
            selectedAddOns: route?.params?.selectedAddOns,
            addOnsTotal: route?.params?.addOnsTotal,
            runningTotal: route?.params?.runningTotal,
            companyName: route?.params?.companyName,
            companyLocation: route?.params?.companyLocation,
            fullName: route?.params?.fullName,
            phone: route?.params?.phone,
            countryOfResidence: route?.params?.countryOfResidence,
            countryCode: route?.params?.countryCode,
            advisorFlow: route?.params?.advisorFlow,
            selectedJurisdiction: route?.params?.selectedJurisdiction,
            purpose: route?.params?.purpose,
            customerLocation: route?.params?.customerLocation,
            priorities: route?.params?.priorities,
            dayOneNeeds: route?.params?.dayOneNeeds,
            physicalPresence: route?.params?.physicalPresence,
            usStatePriority: route?.params?.usStatePriority,
          };
          console.log('=== EMAIL VERIFY -> SET NEW PASSWORD DATA ===', JSON.stringify(nextParams, null, 2));
          if (navigation.replace) navigation.replace('SetNewPassword', nextParams);
          else navigation.navigate('SetNewPassword', nextParams);
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>





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

function AdminEmailVerification({ navigation, token }) {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    verifyAdminEmailToken(token)
      .then(response => {
        if (response?.success === false) {
          throw new Error(response.message || 'Email verification failed.');
        }
        if (active) {
          setStatus('verified');
          Toast.show({ type: 'success', text1: 'Email verified' });
        }
      })
      .catch(verificationError => {
        if (active) {
          setError(verificationError?.response?.data?.message || verificationError?.message || 'Email verification failed.');
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, [token, retry]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070A12" />
      <View style={styles.adminVerifyContent}>
        {status === 'verifying' ? (
          <>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.adminVerifyDescription}>Verifying your email</Text>
          </>
        ) : (
          <>
            <Text style={[styles.adminVerifyTitle, status === 'verified' ? styles.adminVerifySuccess : styles.adminVerifyError]}>
              {status === 'verified' ? 'Email verified' : 'Verification failed'}
            </Text>
            <Text style={styles.adminVerifyDescription}>
              {status === 'verified'
                ? 'Your admin email is verified. You can now log in.'
                : error}
            </Text>
            <TouchableOpacity
              style={styles.adminVerifyAction}
              activeOpacity={0.8}
              onPress={() => {
                if (status === 'verified') {
                  navigation.reset({ index: 0, routes: [{ name: 'Login', params: { accountType: 'admin' } }] });
                } else {
                  setError('');
                  setStatus('verifying');
                  setRetry(value => value + 1);
                }
              }}>
              <Text style={styles.adminVerifyActionText}>
                {status === 'verified' ? 'Continue to Admin Login' : 'Try again'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: s(20),
    paddingTop: s(10),
    paddingBottom: s(30),
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: s(10),
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
    fontSize: font.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: s(5),
  },
  logoText: {
    color: '#E2E8F0',
    fontSize: font.hero,
    fontWeight: '700',
    marginBottom: s(15),
  },
  logoAccent: {
    color: '#D4AF37',
  },
  outerCircle: {
    width: 120,
    height: 120,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconContainer: {
    width: 62,
    height: 62,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  checkIcon: {
    fontSize: font.displayXXL,
    color: '#D4AF37',
  },
  textSection: {
    alignItems: 'center',
    marginTop: s(8),
    marginBottom: s(0),
  },
  title: {
    color: '#FFFFFF',
    fontSize: font.displayLarge,
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
    marginTop: s(6),
    fontSize: font.bodySmall,
    lineHeight: 18,
  },
  emailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: s(16),
    paddingVertical: s(10),
    marginTop: s(12),
  },
  chipIcon: {
    color: '#D4AF37',
    marginRight: s(8),
    fontSize: font.base,
  },
  chipText: {
    color: '#D4AF37',
    fontSize: font.base,
    fontWeight: '600',
  },
  otpSection: {
    width: '100%',
    marginTop: s(12),
    marginBottom: s(10),
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
    fontSize: font.display,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  verifiedBadgeContainer: {
    alignItems: 'center',
    marginTop: s(12),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 20,
    paddingHorizontal: s(12),
    paddingVertical: s(4),
  },
  badgeCheck: {
    color: '#10B981',
    fontSize: font.sm,
    marginRight: s(6),
  },
  verifiedText: {
    color: '#10B981',
    fontSize: font.sm,
    fontWeight: '600',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: s(12),
  },
  resendLabel: {
    color: '#64748B',
    fontSize: font.bodySmall,
  },
  resendLink: {
    color: '#D4AF37',
    fontSize: font.bodySmall,
    fontWeight: '700',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  draftSection: {
    width: '100%',
    marginVertical: s(10),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(10),
  },
  draftLabel: {
    color: '#64748B',
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: s(10),
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
    padding: s(14),
    marginBottom: s(8),
  },
  draftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  draftSubRow: {
    marginTop: s(6),
  },
  usTag: {
    color: '#64748B',
    fontSize: font.sm,
  },
  companyName: {
    color: '#D4AF37',
    fontSize: font.bodySmall,
    fontWeight: '700',
  },
  draftLocation: {
    color: '#64748B',
    fontSize: font.sm,
  },
  savedStatus: {
    color: '#D4AF37',
    fontSize: font.sm,
    fontWeight: '600',
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#051E24',
    borderWidth: 1,
    borderColor: '#05524C',
    borderRadius: 12,
    padding: s(12),
  },
  adminVerifyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(24),
  },
  adminVerifyTitle: {
    fontSize: font.displayMedium,
    fontWeight: '700',
  },
  adminVerifySuccess: {
    color: '#10B981',
  },
  adminVerifyError: {
    color: '#EF4444',
  },
  adminVerifyDescription: {
    color: '#94A3B8',
    fontSize: font.base,
    lineHeight: 22,
    marginTop: s(12),
    textAlign: 'center',
  },
  adminVerifyAction: {
    backgroundColor: '#D4AF37',
    borderRadius: 24,
    marginTop: s(28),
    paddingHorizontal: s(24),
    paddingVertical: s(14),
  },
  adminVerifyActionText: {
    color: '#070A12',
    fontSize: font.base,
    fontWeight: '700',
  },
  bannerCheck: {
    color: '#10B981',
    fontSize: font.base,
    marginRight: s(10),
  },
  bannerText: {
    color: '#94A3B8',
    fontSize: font.sm,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    marginTop: s(24),
    marginBottom: s(10),
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    width: '100%',
    height: 52,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#070A12',
    fontSize: font.lg,
    fontWeight: '700',
    marginRight: s(8),
  },
  arrowIcon: {
    color: '#070A12',
    fontSize: font.xxl,
    fontWeight: 'bold',
  },
});

export default VerifyEmailScreen;
