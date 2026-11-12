import { font } from '../../../theme/typography';
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
import { useThemeColors, themePalette, makeThemeStyles } from '../../../theme/colors';

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

const LoginScreen = ({ navigation, route }) => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [accountType, setAccountType] = useState(route?.params?.accountType || 'client');
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
      const result = await dispatch(loginUser({ email: email.trim(), password, loginType: accountType, forceAdmin: accountType === 'admin' }));
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
    if (accountType === 'admin') {
      Toast.show({ type: 'error', text1: 'Admin login', text2: 'Please log in with your admin email and password.' });
      return;
    }
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

        {/* Account Type Toggle */}
        <View style={[styles.tabContainer, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_03 : colors.surface, borderColor: colors.border, marginBottom: s(12) }]}>
          <TouchableOpacity
            style={[styles.tabButton, accountType === 'client' && (isDark ? styles.activeTabButton : { backgroundColor: colors.accentSoft })]}
            onPress={() => setAccountType('client')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={14} color={accountType === 'client' ? themePalette.hex_c9a84c : colors.subtle} />
            <Text style={[styles.tabText, { color: colors.muted }, accountType === 'client' && styles.activeTabText]}>
              Client
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, accountType === 'admin' && (isDark ? styles.activeTabButton : { backgroundColor: colors.accentSoft })]}
            onPress={() => {
              setAccountType('admin');
              setLoginMethod('email');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark-outline" size={14} color={accountType === 'admin' ? themePalette.hex_c9a84c : colors.subtle} />
            <Text style={[styles.tabText, { color: colors.muted }, accountType === 'admin' && styles.activeTabText]}>
              Admin
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
              {email.length > 0 && <Ionicons name="checkmark-circle" size={16} color={themePalette.hex_10b981} />}
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
            <View style={[styles.checkbox, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_1 : colors.surface, borderColor: colors.border }, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={10} color={colors.buttonText} />}
            </View>
            <Text style={[styles.rememberText, { color: colors.muted }]}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ForgotPassword', { accountType, email })}
          >
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

        {accountType === 'client' && (
          <TouchableOpacity
            style={styles.loginMethodLink}
            activeOpacity={0.8}
            onPress={() => setLoginMethod(loginMethod === 'email' ? 'mobile' : 'email')}
          >
            <Text style={styles.createAccountLink}>
              {loginMethod === 'email' ? 'Login with mobile number?' : 'Login with email?'}
            </Text>
          </TouchableOpacity>
        )}

        {accountType === 'client' && (
          <>
            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.subtle }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Login */}
            <View style={styles.socialGrid}>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_02 : colors.surface, borderColor: colors.border }]} activeOpacity={0.8} onPress={handleGoogleSignIn}>
                <FontAwesome name="google" size={14} color={themePalette.hex_ea4335} />
                <Text style={[styles.socialBtnText, { color: colors.text }]}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_02 : colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
                <Ionicons name="logo-apple" size={16} color={isDark ? themePalette.hex_ffffff : themePalette.hex_000000} />
                <Text style={[styles.socialBtnText, { color: colors.text }]}>Apple</Text>
              </TouchableOpacity>

            </View>
          </>
        )}

        {/* Create Account Link */}
        <Text style={[styles.signupText, { color: colors.muted }]}>
          New to CompanyVista?{' '}
          <Text style={styles.createAccountLink} onPress={() => navigation.navigate('RegisterJurisdiction')}>
            Create account
          </Text>
        </Text>

        {/* Contact Support */}
        <View style={styles.supportContainer}>
          <TouchableOpacity style={[styles.supportBtn, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_03 : colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
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
                    <View style={[styles.checkCircle, { borderColor: selected ? themePalette.hex_c9a84c : colors.border }, selected && styles.checkCircleSelected]}>
                      {selected && <Ionicons name="checkmark" size={12} color={themePalette.hex_060913} />}
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

const styles = makeThemeStyles(() => StyleSheet.create({
  container: { flex: 1, backgroundColor: themePalette.hex_060913 },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(24) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(16), marginTop: s(34) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10.4) },
  mainTitle: { color: themePalette.hex_ffffff, fontSize: s(26), fontWeight: '500', lineHeight: s(34), marginBottom: s(6), marginTop: s(10), marginLeft: s(2) },
  italicTitle: { color: themePalette.hex_c9a84c, fontStyle: 'italic', fontFamily: 'serif' },
  subtitle: { color: themePalette.hex_94a3b8, fontSize: font.sm, lineHeight: 18, marginBottom: s(20) },
  tabContainer: {
    flexDirection: 'row', backgroundColor: themePalette.rgba_255_255_255_0_03,
    borderRadius: 12, padding: s(3), borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_08,
    marginBottom: s(20),
  },
  tabButton: { flex: 1, paddingVertical: s(10), alignItems: 'center', borderRadius: 9, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  activeTabButton: { backgroundColor: themePalette.rgba_255_255_255_0_08 },
  tabText: { color: themePalette.hex_64748b, fontSize: font.sm, fontWeight: '600' },
  activeTabText: { color: themePalette.hex_c9a84c, fontWeight: 'bold' },
  inputLabel: { color: themePalette.hex_64748b, fontSize: font.base, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: s(8), marginTop: s(4) },
  inputContainer: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: themePalette.rgba_255_255_255_0_02, borderRadius: s(12),
    borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_1,
    paddingHorizontal: s(14), height: s(48), marginBottom: s(16),
  },
  inputContainerError: { borderColor: themePalette.hex_ef4444 },
  textInput: { flex: 1, color: themePalette.hex_ffffff, fontSize: font.lg, fontWeight: '500', marginLeft: s(10) },
  errorText: { color: themePalette.hex_ef4444, fontSize: font.base, marginTop: -12, marginBottom: s(12) },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: s(16) },
  countryCodePicker: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: themePalette.rgba_255_255_255_0_02, borderRadius: 12,
    borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_1,
    paddingHorizontal: s(12), height: 48, gap: 6,
  },
  flagText: { color: themePalette.hex_64748b, fontSize: font.xs, fontWeight: 'bold' },
  codeText: { color: themePalette.hex_ffffff, fontSize: font.bodySmall, fontWeight: 'bold' },
  phoneInputContainer: {
    flex: 1, backgroundColor: themePalette.rgba_255_255_255_0_02, borderRadius: 12,
    borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_1,
    paddingHorizontal: s(14), height: 48, justifyContent: 'center',
  },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(20) },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 16, height: 16, borderRadius: 4, backgroundColor: themePalette.rgba_255_255_255_0_1,
    alignItems: 'center', justifyContent: 'center', marginRight: s(8),
    borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_2,
  },
  checkboxChecked: { backgroundColor: themePalette.hex_c9a84c, borderColor: themePalette.hex_c9a84c },
  rememberText: { color: themePalette.hex_64748b, fontSize: font.small },
  forgotText: { color: themePalette.hex_c9a84c, fontSize: font.small, fontWeight: '500' },
  loginBtn: {
    backgroundColor: themePalette.hex_d4af37, borderRadius: 24, paddingVertical: s(14),
    alignItems: 'center', marginBottom: s(10),
  },
  loginBtnDisabled: { opacity: 0.4 },
  loginBtnText: { color: themePalette.hex_060913, fontSize: font.base, fontWeight: 'bold' },
  loginMethodLink: { alignItems: 'center', marginBottom: s(20) },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: s(20) },
  dividerLine: { flex: 1, height: 1, backgroundColor: themePalette.rgba_255_255_255_0_08 },
  dividerText: { color: themePalette.hex_475569, fontSize: font.xs, paddingHorizontal: s(12) },
  socialGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: s(24) },
  socialBtn: {
    width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: themePalette.rgba_255_255_255_0_02, borderRadius: s(12),
    borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_08, paddingVertical: s(12), gap: s(8),
  },
  socialBtnText: { color: themePalette.hex_ffffff, fontSize: font.sm, fontWeight: 'bold' },
  signupText: { color: themePalette.hex_64748b, fontSize: font.base, textAlign: 'center', marginBottom: s(20) },
  createAccountLink: { color: themePalette.hex_c9a84c, fontWeight: 'bold', fontSize: font.md },
  supportContainer: { alignItems: 'center' },
  supportBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: themePalette.rgba_255_255_255_0_03, borderRadius: 20,
    borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_1,
    paddingHorizontal: s(16), paddingVertical: s(8), gap: 6,
  },
  supportBtnText: { color: themePalette.hex_94a3b8, fontSize: font.small, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: themePalette.rgba_0_0_0_0_6, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: themePalette.hex_111827, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: s(20), borderWidth: 1, borderColor: themePalette.rgba_255_255_255_0_08 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: s(16), borderBottomWidth: 1, borderBottomColor: themePalette.rgba_255_255_255_0_08 },
  modalTitle: { color: themePalette.hex_ffffff, fontSize: font.base, fontWeight: 'bold' },
  countryOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: s(16), paddingVertical: s(14), gap: 10, borderBottomWidth: 1, borderBottomColor: themePalette.rgba_255_255_255_0_04 },
  countryOptionSelected: { backgroundColor: themePalette.rgba_201_168_76_0_08 },
  countryOptionName: { flex: 1, color: themePalette.hex_ffffff, fontSize: font.bodySmall },
  countryOptionCode: { color: themePalette.hex_94a3b8, fontSize: font.sm, marginRight: s(6) },
  checkCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircleSelected: { backgroundColor: themePalette.hex_c9a84c, borderColor: themePalette.hex_c9a84c },
}));
