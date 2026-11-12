import { font } from '../../../theme/typography';
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
import { useThemeColors, themePalette, makeThemeStyles } from '../../../theme/colors';

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
          <Ionicons name="chevron-back" size={22} color={themePalette.hex_c9a84c} />
        </TouchableOpacity>
        <Image source={logoR} style={styles.headerLogo} resizeMode="contain" />
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDark ? themePalette.hex_161928 : colors.surface }]}>
          <Ionicons name="help-circle-outline" size={22} color={colors.subtle} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircleOuter, { borderColor: colors.border }]}>
            <View style={[styles.phoneIconBox, { backgroundColor: isDark ? themePalette.hex_17142e : colors.accentSoft, borderColor: isDark ? themePalette.hex_392b68 : colors.border }]}>
              <Ionicons name="phone-portrait-outline" size={20} color={isDark ? themePalette.hex_a88bfa : colors.primary} />
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

        <View style={[styles.phonePill, { backgroundColor: isDark ? themePalette.hex_141629 : colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.countryCode, { color: colors.subtle }]}>IN</Text>
          <Text style={styles.phoneNumber}>{phoneParam}</Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpBox, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground, color: isDark ? themePalette.hex_d0a85c : colors.primary }, isLocked && { opacity: 0.4, borderColor: colors.border }]}
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
          <View style={[styles.errorBadge, { backgroundColor: isDark ? themePalette.hex_271318 : themePalette.rgba_220_38_38_0_08, borderColor: isDark ? themePalette.hex_4a1922 : themePalette.rgba_220_38_38_0_25 }, isLocked && { backgroundColor: isDark ? themePalette.hex_2a1210 : themePalette.rgba_220_38_38_0_12, borderColor: isDark ? themePalette.hex_5a1a1a : themePalette.rgba_220_38_38_0_3 }]}>
            <Ionicons name={isLocked ? 'lock-closed' : 'close'} size={14} color={colors.danger} style={{ marginRight: s(4) }} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
          </View>
        ) : null}
        {isLocked ? (
          <View style={[styles.warningCard, { borderColor: isDark ? themePalette.hex_4a1922 : themePalette.rgba_220_38_38_0_3, backgroundColor: isDark ? themePalette.hex_271318 : themePalette.rgba_220_38_38_0_08 }]}>
            <Ionicons name="time-outline" size={18} color={colors.danger} style={{ marginRight: s(10) }} />
            <Text style={[styles.warningText, { color: isDark ? themePalette.hex_ff9a9a : colors.danger }]}>Locked for {formatRemaining(remainingSec)} — please try after 30 minutes.</Text>
          </View>
        ) : null}

        <View style={styles.resendContainer}>
          <Text style={[styles.didnotReceiveText, { color: colors.muted }]}>Didn't receive it? </Text>
          <TouchableOpacity>
            <Text style={styles.resendText}>Resend code</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.callButton, { backgroundColor: isDark ? themePalette.hex_131728 : colors.surface, borderColor: colors.border }]}>
          <Ionicons name="call-outline" size={16} color={colors.subtle} style={{ marginRight: s(8) }} />
          <Text style={[styles.callButtonText, { color: colors.muted }]}>Get code via call instead</Text>
        </TouchableOpacity>

        <View style={[styles.warningCard, { backgroundColor: isDark ? themePalette.hex_131522 : colors.surface, borderColor: colors.border }]}>
          <Ionicons name="warning-outline" size={18} color={themePalette.hex_d8a23b} style={{ marginRight: s(10) }} />
          <Text style={[styles.warningText, { color: colors.muted }]}>
            After 3 failed attempts your account will be locked for 30 minutes.
          </Text>
        </View>

        <TouchableOpacity style={[styles.changePhoneButton, { backgroundColor: isDark ? themePalette.hex_101322 : colors.surface, borderColor: colors.border }]} onPress={() => navigation?.goBack()}>
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

const styles = makeThemeStyles(() => StyleSheet.create({
  container: { flex: 1, backgroundColor: themePalette.hex_0a0c16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: s(16), paddingTop: s(28), marginTop: s(12) },
  iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: themePalette.hex_161928, justifyContent: 'center', alignItems: 'center' },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: themePalette.rgba_201_168_76_0_15, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  headerLogo: { width: 130, height: 32, resizeMode: 'contain' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: s(20), paddingTop: s(10) },
  logoContainer: { alignItems: 'center', marginBottom: s(16) },
  logoCircleOuter: { width: 60, height: 60, borderRadius: 45, borderWidth: 1, borderColor: themePalette.hex_1d1e3a, justifyContent: 'center', alignItems: 'center', marginBottom: s(8) },
  phoneIconBox: { width: 36, height: 36, borderRadius: 16, backgroundColor: themePalette.hex_17142e, borderWidth: 1, borderColor: themePalette.hex_392b68, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: themePalette.hex_d0a85c, fontSize: font.base, fontWeight: 'bold', letterSpacing: 0.5 },
  logoHighlight: { color: themePalette.hex_d0a85c, fontWeight: 'normal' },
  title: { fontSize: font.displayMedium, fontWeight: '600', color: themePalette.hex_ffffff, marginBottom: s(6) },
  titleItalic: { fontStyle: 'italic', color: themePalette.hex_d0a85c, fontWeight: '400' },
  subtitle: { fontSize: font.bodySmall, color: themePalette.hex_8e93a6, marginBottom: s(16) },
  phonePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.hex_141629, borderRadius: 20, paddingVertical: s(8), paddingHorizontal: s(16), borderWidth: 1, borderColor: themePalette.hex_262942, marginBottom: s(20) },
  countryCode: { color: themePalette.hex_555c77, fontSize: font.sm, fontWeight: 'bold', marginRight: s(10) },
  phoneNumber: { color: themePalette.hex_b69bf8, fontSize: font.base, fontWeight: '600' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: s(16) },
  otpBox: { width: 46, height: 56, borderRadius: 12, borderWidth: 1, borderColor: themePalette.hex_3a202a, backgroundColor: themePalette.hex_12111a, textAlign: 'center', fontSize: font.hero, color: themePalette.hex_d0a85c, fontWeight: '500' },
  errorBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.hex_271318, borderRadius: 16, paddingVertical: s(6), paddingHorizontal: s(14), borderWidth: 1, borderColor: themePalette.hex_4a1922, marginBottom: s(18) },
  errorText: { color: themePalette.hex_ff5252, fontSize: font.sm, fontWeight: '500' },
  resendContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: s(12) },
  didnotReceiveText: { color: themePalette.hex_7b8cb2, fontSize: font.bodySmall },
  resendText: { color: themePalette.hex_e5c06f, fontSize: font.bodySmall, fontWeight: 'bold' },
  callButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.hex_131728, borderRadius: 20, paddingVertical: s(8), paddingHorizontal: s(16), borderWidth: 1, borderColor: themePalette.hex_22293f, marginBottom: s(20) },
  callButtonText: { color: themePalette.hex_9faecb, fontSize: font.bodySmall },
  warningCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.hex_131522, borderRadius: 12, padding: s(12), borderWidth: 1, borderColor: themePalette.hex_2b2724, marginBottom: s(12), width: '100%' },
  warningText: { color: themePalette.hex_9faecb, fontSize: font.small, flex: 1, lineHeight: 16 },
  changePhoneButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: themePalette.hex_101322, borderRadius: 12, paddingVertical: s(12), borderWidth: 1, borderColor: themePalette.hex_1d2338, width: '100%' },
  changePhoneText: { color: themePalette.hex_9faecb, fontSize: font.bodySmall, fontWeight: '500' },
  verifyButtonInline: { borderRadius: 24, paddingVertical: s(14), alignItems: 'center', width: '100%', marginTop: s(28) },
  verifyButtonDisabled: { opacity: 0.4 },
  footer: { paddingHorizontal: s(20), paddingBottom: s(20) },
  verifyButton: { backgroundColor: themePalette.hex_d4af37, borderRadius: 24, paddingVertical: s(14), alignItems: 'center' },
  verifyButtonText: { color: themePalette.hex_060913, fontSize: font.md, fontWeight: 'bold' },
}));

export default VerifyNumberScreen;
