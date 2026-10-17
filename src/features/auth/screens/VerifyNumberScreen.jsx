import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';
import { loginVerifyOtp } from '../../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';

const VerifyNumberScreen = ({ navigation, route }) => {
  const phoneParam = route?.params?.phone ?? '+91 98765 43210';
  const apiPhone = route?.params?.apiPhone ?? String(phoneParam).replace(/[^0-9]/g, '');
  const countryCode = route?.params?.countryCode;
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.auth.isLoading);
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const MAX_ATTEMPTS = 3;
  const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(null);
  const [remainingSec, setRemainingSec] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLocked || !lockUntil) return;
    const tick = () => {
      const diff = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setRemainingSec(diff);
      if (diff <= 0) {
        setIsLocked(false);
        setAttempts(0);
        setLockUntil(null);
        setErrorMsg('');
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isLocked, lockUntil]);

  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attempts);

  const handleVerify = async () => {
    if (isLocked || isLoading) return;
    const code = otp.join('');
    if (code.length < 6 || otp.some(d => !d)) {
      Toast.show({ type: 'error', text1: 'OTP required', text2: 'Please enter 6-digit code' });
      setErrorMsg('Please enter 6-digit code');
      return;
    }
    setErrorMsg('');
    const result = await dispatch(loginVerifyOtp({ countryCode, phone: apiPhone, otp: code }));
    if (loginVerifyOtp.fulfilled.match(result)) {
      Toast.show({ type: 'success', text1: 'Verified', text2: 'Login successful' });
      return;
    }
    const message = result.payload?.message || result.payload?.errors?.otp || 'Invalid or expired code';
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    const left = Math.max(0, MAX_ATTEMPTS - nextAttempts);
    if (left <= 0) {
      const until = Date.now() + LOCK_DURATION_MS;
      setIsLocked(true);
      setLockUntil(until);
      setErrorMsg('Account locked for 30 minutes');
      Toast.show({ type: 'error', text1: 'Too many attempts', text2: 'Try again after 30 minutes' });
      return;
    }
    setErrorMsg(message);
    Toast.show({ type: 'error', text1: 'Verification failed', text2: message });
  };

  const formatRemaining = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChangeText = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#C9A84C" />
        </TouchableOpacity>
        <Image source={logoR} style={styles.headerLogo} resizeMode="contain" />
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDark ? '#161928' : colors.surface }]}>
          <Ionicons name="help-circle-outline" size={22} color={colors.subtle} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircleOuter, { borderColor: colors.border }]}>
            <View style={[styles.phoneIconBox, { backgroundColor: isDark ? '#17142E' : colors.accentSoft, borderColor: isDark ? '#392B68' : colors.border }]}>
              <Ionicons name="phone-portrait-outline" size={20} color={isDark ? '#A88BFA' : colors.primary} />
            </View>
          </View>
          {/* <Text style={styles.logoText}>
            Company<Text style={styles.logoHighlight}>Vista</Text>
          </Text> */}
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Verify your <Text style={styles.titleItalic}>number</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Enter the 6–digit code sent via SMS.</Text>

        <View style={[styles.phonePill, { backgroundColor: isDark ? '#141629' : colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.countryCode, { color: colors.subtle }]}>IN</Text>
          <Text style={styles.phoneNumber}>{phoneParam}</Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpBox, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground, color: isDark ? '#D0A85C' : colors.primary }, isLocked && { opacity: 0.4, borderColor: colors.border }]}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isLocked}
            />
          ))}
        </View>

        {errorMsg ? (
          <View style={[styles.errorBadge, { backgroundColor: isDark ? '#271318' : 'rgba(220, 38, 38, 0.08)', borderColor: isDark ? '#4A1922' : 'rgba(220, 38, 38, 0.25)' }, isLocked && { backgroundColor: isDark ? '#2A1210' : 'rgba(220, 38, 38, 0.12)', borderColor: isDark ? '#5A1A1A' : 'rgba(220, 38, 38, 0.3)' }]}>
            <Ionicons name={isLocked ? 'lock-closed' : 'close'} size={14} color={colors.danger} style={{ marginRight: s(4) }} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
          </View>
        ) : null}
        {isLocked ? (
          <View style={[styles.warningCard, { borderColor: isDark ? '#4A1922' : 'rgba(220, 38, 38, 0.3)', backgroundColor: isDark ? '#271318' : 'rgba(220, 38, 38, 0.08)' }]}>
            <Ionicons name="time-outline" size={18} color={colors.danger} style={{ marginRight: s(10) }} />
            <Text style={[styles.warningText, { color: isDark ? '#FF9A9A' : colors.danger }]}>Locked for {formatRemaining(remainingSec)} — please try after 30 minutes.</Text>
          </View>
        ) : null}

        <View style={styles.resendContainer}>
          <Text style={[styles.didnotReceiveText, { color: colors.muted }]}>Didn't receive it? </Text>
          <TouchableOpacity>
            <Text style={styles.resendText}>Resend code</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.callButton, { backgroundColor: isDark ? '#131728' : colors.surface, borderColor: colors.border }]}>
          <Ionicons name="call-outline" size={16} color={colors.subtle} style={{ marginRight: s(8) }} />
          <Text style={[styles.callButtonText, { color: colors.muted }]}>Get code via call instead</Text>
        </TouchableOpacity>

        <View style={[styles.warningCard, { backgroundColor: isDark ? '#131522' : colors.surface, borderColor: colors.border }]}>
          <Ionicons name="warning-outline" size={18} color="#D8A23B" style={{ marginRight: s(10) }} />
          <Text style={[styles.warningText, { color: colors.muted }]}>
            After 3 failed attempts your account will be locked for 30 minutes.
          </Text>
        </View>

        <TouchableOpacity style={[styles.changePhoneButton, { backgroundColor: isDark ? '#101322' : colors.surface, borderColor: colors.border }]} onPress={() => navigation?.goBack()}>
          <Ionicons name="create-outline" size={16} color={colors.subtle} style={{ marginRight: s(8) }} />
          <Text style={[styles.changePhoneText, { color: colors.muted }]}>Change phone number</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.verifyButtonInline, { backgroundColor: colors.buttonBackground }, (isLocked || isLoading) && styles.verifyButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleVerify}
          disabled={isLocked || isLoading}
        >
          <Text style={[styles.verifyButtonText, { color: colors.buttonText }]}>
            {isLocked ? `Locked ${formatRemaining(remainingSec)}` : isLoading ? 'Verifying...' : 'Verify & Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C16' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: s(16), paddingTop: s(28), marginTop: s(12) },
  iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#161928', justifyContent: 'center', alignItems: 'center' },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(201, 168, 76, 0.15)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  headerLogo: { width: 130, height: 32, resizeMode: 'contain' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: s(20), paddingTop: s(10) },
  logoContainer: { alignItems: 'center', marginBottom: s(16) },
  logoCircleOuter: { width: 60, height: 60, borderRadius: 45, borderWidth: 1, borderColor: '#1D1E3A', justifyContent: 'center', alignItems: 'center', marginBottom: s(8) },
  phoneIconBox: { width: 36, height: 36, borderRadius: 16, backgroundColor: '#17142E', borderWidth: 1, borderColor: '#392B68', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#D0A85C', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
  logoHighlight: { color: '#D0A85C', fontWeight: 'normal' },
  title: { fontSize: 24, fontWeight: '600', color: '#FFFFFF', marginBottom: s(6) },
  titleItalic: { fontStyle: 'italic', color: '#D0A85C', fontWeight: '400' },
  subtitle: { fontSize: 13, color: '#8E93A6', marginBottom: s(16) },
  phonePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141629', borderRadius: 20, paddingVertical: s(8), paddingHorizontal: s(16), borderWidth: 1, borderColor: '#262942', marginBottom: s(20) },
  countryCode: { color: '#555C77', fontSize: 12, fontWeight: 'bold', marginRight: s(10) },
  phoneNumber: { color: '#B69BF8', fontSize: 14, fontWeight: '600' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: s(16) },
  otpBox: { width: 46, height: 56, borderRadius: 12, borderWidth: 1, borderColor: '#3A202A', backgroundColor: '#12111A', textAlign: 'center', fontSize: 20, color: '#D0A85C', fontWeight: '500' },
  errorBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#271318', borderRadius: 16, paddingVertical: s(6), paddingHorizontal: s(14), borderWidth: 1, borderColor: '#4A1922', marginBottom: s(18) },
  errorText: { color: '#FF5252', fontSize: 12, fontWeight: '500' },
  resendContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: s(12) },
  didnotReceiveText: { color: '#7B8CB2', fontSize: 13 },
  resendText: { color: '#E5C06F', fontSize: 13, fontWeight: 'bold' },
  callButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131728', borderRadius: 20, paddingVertical: s(8), paddingHorizontal: s(16), borderWidth: 1, borderColor: '#22293F', marginBottom: s(20) },
  callButtonText: { color: '#9FAECB', fontSize: 13 },
  warningCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131522', borderRadius: 12, padding: s(12), borderWidth: 1, borderColor: '#2B2724', marginBottom: s(12), width: '100%' },
  warningText: { color: '#9FAECB', fontSize: 11, flex: 1, lineHeight: 16 },
  changePhoneButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#101322', borderRadius: 12, paddingVertical: s(12), borderWidth: 1, borderColor: '#1D2338', width: '100%' },
  changePhoneText: { color: '#9FAECB', fontSize: 13, fontWeight: '500' },
  verifyButtonInline: { borderRadius: 24, paddingVertical: s(14), alignItems: 'center', width: '100%', marginTop: s(28) },
  verifyButtonDisabled: { opacity: 0.4 },
  footer: { paddingHorizontal: s(20), paddingBottom: s(20) },
  verifyButton: { backgroundColor: '#D4AF37', borderRadius: 24, paddingVertical: s(14), alignItems: 'center' },
  verifyButtonText: { color: '#060913', fontSize: 15, fontWeight: 'bold' },
});

export default VerifyNumberScreen;
