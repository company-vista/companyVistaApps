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
import { useThemeColors, themePalette } from '../../../theme/colors';
import { font } from '../../../theme/typography';

const VerifyEmailScreen = (props) => {
  const { navigation, route } = props;
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';
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
    return <AdminEmailVerification navigation={navigation} token={route.params.token} colors={colors} isDark={isDark} />;
  }

  const handleCodeChange = (text, index) => {
    if (text.length > 1) text = text.slice(-1);
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
      try {
        response = await axios.get(`${API_BASE_URL}/api/verify-email/${otpString}`);
      } catch (getErr) {
        if (signupToken) {
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.textSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              Verify your <Text style={[styles.italicTitle, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}>email</Text>
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              Welcome aboard! Enter the code we sent to confirm your account and start your registration.
            </Text>

            <View style={[styles.emailChip, { backgroundColor: isDark ? themePalette.hex_0f172a : colors.surface, borderColor: isDark ? themePalette.hex_d4af37 : colors.border }]}>
              <Text style={[styles.chipText, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}>{email}</Text>
            </View>
          </View>

          <View style={styles.otpSection}>
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <View key={index} style={[styles.codeBox, { backgroundColor: isDark ? themePalette.hex_0b1120 : colors.inputBackground, borderColor: digit ? (isDark ? themePalette.hex_d4af37 : colors.primary) : colors.border }]}>
                  <TextInput
                    ref={(el) => (inputRefs.current[index] = el)}
                    style={[styles.codeText, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectionColor={isDark ? themePalette.hex_d4af37 : colors.primary}
                  />
                </View>
              ))}
            </View>

            {isCodeComplete && (
              <View style={styles.verifiedBadgeContainer}>
                <View style={[styles.verifiedBadge, { backgroundColor: isDark ? themePalette.hex_064e3b : themePalette.rgba_16_185_129_0_12, borderColor: isDark ? themePalette.hex_059669 : themePalette.rgba_16_185_129_0_3 }]}>
                  <Text style={[styles.verifiedText, { color: colors.success }]}>Code verified</Text>
                </View>
              </View>
            )}

            <View style={styles.resendRow}>
              <Text style={[styles.resendLabel, { color: colors.muted }]}>
                {countdown > 0 ? `Resend available in 0:${countdown < 10 ? `0${countdown}` : countdown}  ` : "Didn't receive it? "}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || isResending}>
                <Text style={[styles.resendLink, { color: isDark ? themePalette.hex_d4af37 : colors.primary }, (countdown > 0 || isResending) && styles.resendLinkDisabled]}>
                  {isResending ? 'Sending...' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, !isDark && { backgroundColor: themePalette.hex_2563eb }, (!isCodeComplete || verifying) && styles.submitButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleVerify}
              disabled={!isCodeComplete || verifying}
            >
              {verifying ? (
                <ActivityIndicator color={isDark ? themePalette.hex_070a12 : themePalette.hex_ffffff} />
              ) : (
                <>
                  <Text style={[styles.submitButtonText, !isDark && { color: themePalette.hex_ffffff }]}>Verify</Text>
                  <Text style={[styles.arrowIcon, !isDark && { color: themePalette.hex_ffffff }]}>→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function AdminEmailVerification({ navigation, token, colors, isDark }) {
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

    return () => { active = false; };
  }, [token, retry]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.adminVerifyContent}>
        {status === 'verifying' ? (
          <>
            <ActivityIndicator size="large" color={isDark ? themePalette.hex_d4af37 : colors.primary} />
            <Text style={[styles.adminVerifyDescription, { color: colors.muted }]}>Verifying your email</Text>
          </>
        ) : (
          <>
            <Text style={[styles.adminVerifyTitle, { color: status === 'verified' ? colors.success : colors.danger }]}>
              {status === 'verified' ? 'Email verified' : 'Verification failed'}
            </Text>
            <Text style={[styles.adminVerifyDescription, { color: colors.muted }]}>
              {status === 'verified'
                ? 'Your admin email is verified. You can now log in.'
                : error}
            </Text>
            <TouchableOpacity
              style={[styles.adminVerifyAction, !isDark && { backgroundColor: themePalette.hex_2563eb }]}
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
              <Text style={[styles.adminVerifyActionText, !isDark && { color: themePalette.hex_ffffff }]}>
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
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: s(20), paddingTop: s(10), paddingBottom: s(30), justifyContent: 'center' },
  textSection: { alignItems: 'center', marginTop: s(8), marginBottom: s(0) },
  title: { fontSize: font.displayLarge, fontWeight: '600', textAlign: 'center' },
  italicTitle: { fontStyle: 'italic', fontWeight: '400' },
  description: { textAlign: 'center', marginTop: s(6), fontSize: font.base, lineHeight: 22 },
  emailChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: s(16), paddingVertical: s(10), marginTop: s(12) },
  chipText: { fontSize: font.base, fontWeight: '600' },
  otpSection: { width: '100%', marginTop: s(12), marginBottom: s(10) },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  codeBox: { width: 48, height: 58, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  codeText: { fontSize: font.display, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center', width: '100%', height: '100%' },
  verifiedBadgeContainer: { alignItems: 'center', marginTop: s(12) },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: s(12), paddingVertical: s(4) },
  verifiedText: { fontSize: font.sm, fontWeight: '600' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: s(12), flexWrap: 'wrap' },
  resendLabel: { fontSize: font.base },
  resendLink: { fontSize: font.base, fontWeight: '700' },
  resendLinkDisabled: { opacity: 0.5 },
  footer: { marginTop: s(24), marginBottom: s(10) },
  submitButton: { backgroundColor: themePalette.hex_d4af37, width: '100%', height: 52, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: themePalette.hex_070a12, fontSize: font.lg, fontWeight: '700' },
  arrowIcon: { color: themePalette.hex_070a12, fontSize: font.xl, fontWeight: 'bold' },
  adminVerifyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: s(24) },
  adminVerifyTitle: { fontSize: font.displayMedium, fontWeight: '700' },
  adminVerifyDescription: { fontSize: font.base, lineHeight: 22, marginTop: s(12), textAlign: 'center' },
  adminVerifyAction: { backgroundColor: themePalette.hex_d4af37, borderRadius: 24, marginTop: s(28), paddingHorizontal: s(24), paddingVertical: s(14) },
  adminVerifyActionText: { color: themePalette.hex_070a12, fontSize: font.base, fontWeight: '700' },
});

export default VerifyEmailScreen;
