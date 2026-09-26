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

const VerifyNumberScreen = ({ navigation, route }) => {
  const phoneParam = route?.params?.phone ?? '+91 98765 43210';
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

  const handleVerify = () => {
    if (isLocked) return;
    const code = otp.join('');
    if (code.length < 6 || otp.some(d => !d)) {
      Toast.show({ type: 'error', text1: 'OTP required', text2: 'Please enter 6-digit code' });
      setErrorMsg('Please enter 6-digit code');
      return;
    }
    // Abhi ke liye coming soon
    Toast.show({ type: 'info', text1: 'Coming soon', text2: 'OTP verification will be available soon' });
    return;
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D1B" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#C9A84C" />
        </TouchableOpacity>
        <Image source={logoR} style={styles.headerLogo} resizeMode="contain" />
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="help-circle-outline" size={22} color="#8E93A6" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircleOuter}>
            <View style={styles.phoneIconBox}>
              <Ionicons name="phone-portrait-outline" size={20} color="#A88BFA" />
            </View>
          </View>
          {/* <Text style={styles.logoText}>
            Company<Text style={styles.logoHighlight}>Vista</Text>
          </Text> */}
        </View>

        <Text style={styles.title}>
          Verify your <Text style={styles.titleItalic}>number</Text>
        </Text>
        <Text style={styles.subtitle}>Enter the 6–digit code sent via SMS.</Text>

        <View style={styles.phonePill}>
          <Text style={styles.countryCode}>IN</Text>
          <Text style={styles.phoneNumber}>{phoneParam}</Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpBox, isLocked && { opacity: 0.4, borderColor: '#2A202A' }]}
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
          <View style={[styles.errorBadge, isLocked && { backgroundColor: '#2A1210', borderColor: '#5A1A1A' }]}>
            <Ionicons name={isLocked ? 'lock-closed' : 'close'} size={14} color="#FF5252" style={{ marginRight: s(4) }} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}
        {isLocked ? (
          <View style={[styles.warningCard, { borderColor: '#4A1922', backgroundColor: '#271318' }]}>
            <Ionicons name="time-outline" size={18} color="#FF5252" style={{ marginRight: s(10) }} />
            <Text style={[styles.warningText, { color: '#FF9A9A' }]}>Locked for {formatRemaining(remainingSec)} — please try after 30 minutes.</Text>
          </View>
        ) : null}

        <View style={styles.resendContainer}>
          <Text style={styles.didnotReceiveText}>Didn't receive it? </Text>
          <TouchableOpacity>
            <Text style={styles.resendText}>Resend SMS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call-outline" size={16} color="#7B8CB2" style={{ marginRight: s(8) }} />
          <Text style={styles.callButtonText}>Get code via call instead</Text>
        </TouchableOpacity>

        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={18} color="#D8A23B" style={{ marginRight: s(10) }} />
          <Text style={styles.warningText}>
            After 3 failed attempts your account will be locked for 30 minutes.
          </Text>
        </View>

        <TouchableOpacity style={styles.changePhoneButton} onPress={() => navigation?.goBack()}>
          <Ionicons name="create-outline" size={16} color="#7B8CB2" style={{ marginRight: s(8) }} />
          <Text style={styles.changePhoneText}>Change phone number</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.verifyButtonInline, isLocked && { backgroundColor: '#2A1A1A', opacity: 0.6 }]}
          activeOpacity={0.8}
          onPress={handleVerify}
          disabled={isLocked}
        >
          <Text style={[styles.verifyButtonText, isLocked && { color: '#8A6A6A' }]}>{isLocked ? `Locked ${formatRemaining(remainingSec)}` : 'Verify & Continue'}</Text>
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
  verifyButtonInline: { backgroundColor: '#1E2333', borderRadius: 12, paddingVertical: s(14), alignItems: 'center', width: '100%', marginTop: s(28) },
  footer: { paddingHorizontal: s(20), paddingBottom: s(20) },
  verifyButton: { backgroundColor: '#1E2333', borderRadius: 12, paddingVertical: s(14), alignItems: 'center' },
  verifyButtonText: { color: '#656F8A', fontSize: 15, fontWeight: '600' },
});

export default VerifyNumberScreen;
