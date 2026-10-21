import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { loginUser, googleLoginUser, loginSendOtp, clearLoginError } from '../../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import logoR from '../../../assets/images/logoR.png';
import BackButton from '../../../components/buttons/BackButton';
import Toast from 'react-native-toast-message';
import { s } from '../../../theme/responsive';
import { useThemeColors } from '../../../theme/colors';

GoogleSignin.configure({
  webClientId: '1080172574320-193qhf74d29aa4b7fuf2f01h70ahjsic.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['profile', 'email'],
  forceCodeForRefreshToken: true,
});

const COUNTRIES = [
  { code: '+91', iso: 'IN', name: 'India' },
  { code: '+1', iso: 'US', name: 'United States' },
  { code: '+44', iso: 'GB', name: 'United Kingdom' },
  { code: '+971', iso: 'AE', name: 'UAE' },
  { code: '+65', iso: 'SG', name: 'Singapore' },
  { code: '+852', iso: 'HK', name: 'Hong Kong' },
  { code: '+372', iso: 'EE', name: 'Estonia' },
  { code: '+357', iso: 'CY', name: 'Cyprus' },
  { code: '+356', iso: 'MT', name: 'Malta' },
  { code: '+49', iso: 'DE', name: 'Germany' },
  { code: '+33', iso: 'FR', name: 'France' },
  { code: '+61', iso: 'AU', name: 'Australia' },
];

const LoginScreen = ({ navigation }) => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [countryIso, setCountryIso] = useState('IN');
  const [showCodePicker, setShowCodePicker] = useState(false);

  const dispatch = useAppDispatch();
  const { isLoading, loginErrors: errors } = useAppSelector(state => state.auth);
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  async function handleLogin() {
    if (isLoading) return;

    if (loginMethod === 'email') {
      if (!email.trim() || !password.trim()) {
        Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please fill all fields' });
        return;
      }
      const result = await dispatch(loginUser({ email: email.trim(), password }));
      if (loginUser.fulfilled.match(result)) {
        const user = result.payload?.user;
        if (user?.isCompleteRegistration === false) {
          // Silent - no error toast, dashboard is blocked via RootStack
          // User will be taken to complete registration flow
        } else {
          Toast.show({ type: 'success', text1: 'Login successful', text2: 'Welcome back!' });
        }
      }
    } else {
      if (!phone.trim() || !password.trim()) {
        Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please fill all fields' });
        return;
      }
      const fullPhone = `${countryCode.replace(/[^0-9]/g, '')}${phone.trim().replace(/[^0-9]/g, '')}`;
      const result = await dispatch(loginSendOtp({ countryCode, phone: fullPhone, password }));
      if (loginSendOtp.fulfilled.match(result)) {
        Toast.show({ type: 'success', text1: 'Verification code sent', text2: `Code sent to ${fullPhone}` });
        navigation.navigate('VerifyNumber', {
          phone: `${countryCode} ${phone.trim()}`,
          apiPhone: fullPhone,
          countryCode,
          password,
        });
      }
      return;
    }
  }

  async function handleGoogleSignIn() {
    if (isLoading) return;
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      try { await GoogleSignin.signOut(); } catch (e) { console.error(e); }

      const response = await GoogleSignin.signIn();
      const idToken = response.idToken ?? response.user?.idToken ?? response.data?.idToken;

      if (!idToken) {
        Toast.show({ type: 'error', text1: 'Google login failed', text2: 'No ID token received.' });
        return;
      }

      const result = await dispatch(googleLoginUser({ idToken }));
      if (googleLoginUser.fulfilled.match(result)) {
        const user = result.payload?.user;
        if (user?.isCompleteRegistration === false) {
          // Silent - for incomplete users
        } else {
          Toast.show({ type: 'success', text1: 'Login successful', text2: 'Welcome back!' });
        }
      }
    } catch (error) {
      if (error.code === 'SIGN_IN_CANCELLED') return;
      Toast.show({ type: 'error', text1: 'Google login failed', text2: error.message || 'Something went wrong.' });
    }
  }

  const isFormValid = loginMethod === 'email'
    ? email.trim() && password.trim()
    : phone.trim() && password.trim();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} transparent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        {/* Main Title */}
        <Text style={[styles.mainTitle, { color: colors.text }]}>
          Welcome <Text style={styles.italicTitle}>back</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Log in to manage your companies, compliance and invoices.
        </Text>

        {/* Login Method Toggle */}
        <View style={[styles.tabContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabButton, loginMethod === 'email' && (isDark ? styles.activeTabButton : { backgroundColor: colors.accentSoft })]}
            onPress={() => setLoginMethod('email')}
            activeOpacity={0.8}
          >
            <Ionicons name="mail" size={14} color={loginMethod === 'email' ? '#C9A84C' : colors.subtle} />
            <Text style={[styles.tabText, { color: colors.muted }, loginMethod === 'email' && styles.activeTabText]}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, loginMethod === 'mobile' && (isDark ? styles.activeTabButton : { backgroundColor: colors.accentSoft })]}
            onPress={() => setLoginMethod('mobile')}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={14} color={loginMethod === 'mobile' ? '#C9A84C' : colors.subtle} />
            <Text style={[styles.tabText, { color: colors.muted }, loginMethod === 'mobile' && styles.activeTabText]}>
              Mobile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email / Mobile Input */}
        {loginMethod === 'email' ? (
          <>
            <Text style={[styles.inputLabel, { color: colors.subtle }]}>EMAIL ADDRESS</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }, errors.email && styles.inputContainerError]}>
              <Ionicons name="mail" size={16} color={colors.subtle} />
              <TextInput
                style={[styles.textInput, { color: colors.inputText }]}
                value={email}
                onChangeText={(val) => { setEmail(val); dispatch(clearLoginError('email')); }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor={colors.inputPlaceholder}
              />
              {email.length > 0 && <Ionicons name="checkmark-circle" size={16} color="#10B981" />}
            </View>
            {errors.email ? <Text style={[styles.errorText, { color: colors.danger }]}>{errors.email}</Text> : null}
          </>
        ) : (
          <>
            <Text style={[styles.inputLabel, { color: colors.subtle }]}>MOBILE NUMBER</Text>
            <View style={styles.phoneRow}>
              <TouchableOpacity style={[styles.countryCodePicker, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]} activeOpacity={0.8} onPress={() => setShowCodePicker(true)}>
                <Text style={[styles.flagText, { color: colors.subtle }]}>{countryIso}</Text>
                <Text style={[styles.codeText, { color: colors.inputText }]}>{countryCode}</Text>
                <Ionicons name="chevron-down" size={12} color={colors.subtle} />
              </TouchableOpacity>
              <View style={[styles.phoneInputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }, errors.phone && styles.inputContainerError]}>
                <TextInput
                  style={[styles.textInput, { color: colors.inputText }]}
                  value={phone}
                  onChangeText={(val) => { setPhone(val); dispatch(clearLoginError('phone')); }}
                  keyboardType="phone-pad"
                  placeholder="Phone number"
                  placeholderTextColor={colors.inputPlaceholder}
                />
              </View>
            </View>
            {errors.phone ? <Text style={[styles.errorText, { color: colors.danger }]}>{errors.phone}</Text> : null}
          </>
        )}

        {/* Password Input */}
        <Text style={[styles.inputLabel, { color: colors.subtle }]}>PASSWORD</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }, errors.password && styles.inputContainerError]}>
          <Ionicons name="lock-closed" size={16} color={colors.subtle} />
          <TextInput
            style={[styles.textInput, { color: colors.inputText }]}
            value={password}
            onChangeText={(val) => { setPassword(val); dispatch(clearLoginError('password')); }}
            secureTextEntry={!showPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.inputPlaceholder}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.subtle} />
          </TouchableOpacity>
        </View>
        {errors.password ? <Text style={[styles.errorText, { color: colors.danger }]}>{errors.password}</Text> : null}

        {/* Remember Me & Forgot Password */}
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.checkboxRow} activeOpacity={0.8} onPress={() => setRememberMe(!rememberMe)}>
            <View style={[styles.checkbox, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.surface, borderColor: colors.border }, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={10} color={colors.buttonText} />}
            </View>
            <Text style={[styles.rememberText, { color: colors.muted }]}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Log In Button */}
        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: colors.buttonBackground }, (!isFormValid || isLoading) && styles.loginBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleLogin}
          disabled={!isFormValid || isLoading}
        >
          <Text style={[styles.loginBtnText, { color: colors.buttonText }]}>
            {isLoading ? 'Logging in...' : 'Log In →'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.subtle }]}>or continue with</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Social Login */}
        <View style={styles.socialGrid}>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.surface, borderColor: colors.border }]} activeOpacity={0.8} onPress={handleGoogleSignIn}>
            <FontAwesome name="google" size={14} color="#ea4335" />
            <Text style={[styles.socialBtnText, { color: colors.text }]}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
            <Ionicons name="logo-apple" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.socialBtnText, { color: colors.text }]}>Apple</Text>
          </TouchableOpacity>

        </View>

        {/* Create Account Link */}
        <Text style={[styles.signupText, { color: colors.muted }]}>
          New to CompanyVista?{' '}
          <Text style={styles.createAccountLink} onPress={() => navigation.navigate('RegisterJurisdiction')}>
            Create account
          </Text>
        </Text>

        {/* Contact Support */}
        <View style={styles.supportContainer}>
          <TouchableOpacity style={[styles.supportBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
            <Ionicons name="headset" size={14} color={colors.subtle} />
            <Text style={[styles.supportBtnText, { color: colors.subtle }]}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Code Picker Modal */}
      <Modal visible={showCodePicker} transparent animationType="fade" onRequestClose={() => setShowCodePicker(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.backdrop }]}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowCodePicker(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.sheet, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setShowCodePicker(false)}>
                <Ionicons name="close" size={20} color={colors.subtle} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.iso}
              renderItem={({ item }) => {
                const selected = countryCode === item.code;
                return (
                  <TouchableOpacity
                    style={[styles.countryOption, { borderBottomColor: colors.border }, selected && styles.countryOptionSelected]}
                    onPress={() => {
                      setCountryCode(item.code);
                      setCountryIso(item.iso);
                      setShowCodePicker(false);
                    }}
                  >
                    <Text style={[styles.flagText, { color: colors.subtle }]}>{item.iso}</Text>
                    <Text style={[styles.countryOptionName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.countryOptionCode, { color: colors.subtle }]}>{item.code}</Text>
                    <View style={[styles.checkCircle, { borderColor: selected ? '#C9A84C' : colors.border }, selected && styles.checkCircleSelected]}>
                      {selected && <Ionicons name="checkmark" size={12} color="#060913" />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060913' },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(24) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(16), marginTop: s(34) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10.4) },
  mainTitle: { color: '#FFFFFF', fontSize: s(26), fontWeight: '500', lineHeight: s(34), marginBottom: s(6), marginTop: s(10), marginLeft: s(2) },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  subtitle: { color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: s(20) },
  tabContainer: {
    flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12, padding: s(3), borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: s(20),
  },
  tabButton: { flex: 1, paddingVertical: s(10), alignItems: 'center', borderRadius: 9, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  activeTabButton: { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  tabText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  activeTabText: { color: '#C9A84C', fontWeight: 'bold' },
  inputLabel: { color: '#64748B', fontSize: 14, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: s(8), marginTop: s(4) },
  inputContainer: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: s(12),
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: s(14), height: s(48), marginBottom: s(16),
  },
  inputContainerError: { borderColor: '#EF4444' },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '500', marginLeft: s(10) },
  errorText: { color: '#EF4444', fontSize: 14, marginTop: -12, marginBottom: s(12) },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: s(16) },
  countryCodePicker: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: s(12), height: 48, gap: 6,
  },
  flagText: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
  codeText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  phoneInputContainer: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: s(14), height: 48, justifyContent: 'center',
  },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(20) },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 16, height: 16, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center', justifyContent: 'center', marginRight: s(8),
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkboxChecked: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  rememberText: { color: '#64748B', fontSize: 11 },
  forgotText: { color: '#C9A84C', fontSize: 11, fontWeight: '500' },
  loginBtn: {
    backgroundColor: '#D4AF37', borderRadius: 24, paddingVertical: s(14),
    alignItems: 'center', marginBottom: s(24),
  },
  loginBtnDisabled: { opacity: 0.4 },
  loginBtnText: { color: '#060913', fontSize: 14, fontWeight: 'bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: s(20) },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  dividerText: { color: '#475569', fontSize: 10, paddingHorizontal: s(12) },
  socialGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: s(24) },
  socialBtn: {
    width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: s(12),
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', paddingVertical: s(12), gap: s(8),
  },
  socialBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  signupText: { color: '#64748B', fontSize: 14, textAlign: 'center', marginBottom: s(20) },
  createAccountLink: { color: '#C9A84C', fontWeight: 'bold', fontSize: 15 },
  supportContainer: { alignItems: 'center' },
  supportBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: s(16), paddingVertical: s(8), gap: 6,
  },
  supportBtnText: { color: '#94A3B8', fontSize: 11, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: s(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: s(16), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  modalTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  countryOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: s(16), paddingVertical: s(14), gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  countryOptionSelected: { backgroundColor: 'rgba(201,168,76,0.08)' },
  countryOptionName: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  countryOptionCode: { color: '#94A3B8', fontSize: 12, marginRight: s(6) },
  checkCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircleSelected: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
});
