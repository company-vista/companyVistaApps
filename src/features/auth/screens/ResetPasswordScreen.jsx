import { font } from '../../../theme/typography';
import { useMemo, useState } from 'react';
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
import { resetPassword } from '../api/forgotPasswordApi';
import { s } from '../../../theme/responsive';
import { themePalette, makeThemeStyles } from '../../../theme/colors';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params || {};
  const accountType = route.params?.accountType === 'admin' ? 'admin' : 'client';
  const insets = useSafeAreaInsets();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = useMemo(() => ({
    length: newPassword.length >= 8,
    caseMix: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  }), [newPassword]);

  const strengthScore = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][strengthScore - 1] || 'Weak';
  const strengthColor = strengthScore <= 1 ? themePalette.hex_ef4444 : strengthScore === 2 ? themePalette.hex_f59e0b : strengthScore === 3 ? themePalette.hex_22d3ee : themePalette.hex_10b981;
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isConfirmError = confirmPassword.length > 0 && !passwordsMatch;

  async function handleReset() {
    if (!newPassword.trim()) {
      Toast.show({ type: 'error', text1: 'New password is required' });
      return;
    }
    if (!checks.length || !checks.caseMix || !checks.number || !checks.special) {
      Toast.show({ type: 'error', text1: 'Password does not meet requirements' });
      return;
    }
    if (!passwordsMatch) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    if (!token) {
      Toast.show({ type: 'error', text1: 'Invalid token' });
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, password: newPassword.trim(), accountType });
      Toast.show({ type: 'success', text1: 'Password reset successful' });
      navigation.replace('PasswordUpdated', { email: route.params?.email, accountType });
    } catch (error) {
      const message = error?.response?.data?.message || 'Something went wrong. Please try again.';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={themePalette.hex_070a12} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header - same as Login */}
          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} />
            <Image source={logoR} style={styles.topLogo} />
          </View>



          <View style={styles.textSection}>
            <Text style={styles.title}>
              Create a new <Text style={styles.italicTitle}>password</Text>
            </Text>
            <Text style={styles.description}>Choose a strong password you haven&apos;t used before.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>NEW PASSWORD</Text>
            <View style={[styles.inputContainer, newPassword.length > 0 && strengthScore === 4 && styles.inputContainerSuccess]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Enter new password"
                placeholderTextColor={themePalette.hex_6b7280}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Text style={styles.eyeIcon}>{isPasswordVisible ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            {/* Strength */}
            <View style={styles.strengthBarContainer}>
              {[0, 1, 2, 3].map(i => (
                <View
                  key={i}
                  style={[
                    styles.strengthSegment,
                    i < strengthScore && { backgroundColor: strengthColor },
                  ]}
                />
              ))}
            </View>
            <View style={styles.strengthLabelRow}>
              <Text style={styles.subtext}>Password strength</Text>
              <Text style={[styles.strengthText, { color: newPassword ? strengthColor : themePalette.hex_64748b }]}>
                {newPassword ? strengthLabel : '-'}
              </Text>
            </View>

            <View style={styles.checklistCard}>
              <CheckRow ok={checks.length} text="At least 8 characters" />
              <CheckRow ok={checks.caseMix} text="One uppercase & lowercase letter" />
              <CheckRow ok={checks.number} text="At least one number" />
              <CheckRow ok={checks.special} text="One special character (!@#$)" />
            </View>

            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={[
              styles.inputContainer,
              passwordsMatch && styles.inputContainerSuccess,
              isConfirmError && styles.inputContainerError,
            ]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Confirm password"
                placeholderTextColor={themePalette.hex_6b7280}
                autoCapitalize="none"
              />
              {passwordsMatch ? <Text style={styles.successIcon}>✓</Text> : null}
            </View>
            {confirmPassword.length > 0 && (
              <View style={styles.matchRow}>
                <Text style={[styles.matchIcon, { color: passwordsMatch ? themePalette.hex_10b981 : themePalette.hex_ef4444 }]}>
                  {passwordsMatch ? '✓' : '✕'}
                </Text>
                <Text style={[styles.matchText, { color: passwordsMatch ? themePalette.hex_10b981 : themePalette.hex_ef4444 }]}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Pressable
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleReset}
              disabled={loading}>
              {loading ? <ActivityIndicator color={themePalette.hex_070a12} /> : (
                <>
                  <Text style={styles.submitButtonText}>Reset Password</Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function CheckRow({ ok, text }) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkCircle, ok ? styles.checkCircleOk : styles.checkCircleOff]}>
        <Text style={[styles.checkMark, { color: ok ? themePalette.hex_10b981 : themePalette.hex_64748b }]}>✓</Text>
      </View>
      <Text style={[styles.checkText, { color: ok ? themePalette.hex_10b981 : themePalette.hex_64748b }]}>{text}</Text>
    </View>
  );
}

const styles = makeThemeStyles(() => StyleSheet.create({
  container: { flex: 1, backgroundColor: themePalette.hex_070a12 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: s(20), paddingBottom: 20, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, marginTop: 10 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  heroSection: { alignItems: 'center', marginTop: 5 },
  lockOuterCard: {
    width: 106, height: 106, borderRadius: 60, borderWidth: 1, borderColor: themePalette.hex_0f5257,
    backgroundColor: themePalette.hex_051e24, justifyContent: 'center', alignItems: 'center',
  },
  lockIconContainer: {
    width: 60, height: 60, borderRadius: 50, borderWidth: 1.5, borderColor: themePalette.hex_00f5d479,
    justifyContent: 'center', alignItems: 'center', backgroundColor: themePalette.hex_0b2b30,
  },
  lockIcon: { fontSize: font.displayLarge },
  textSection: { alignItems: 'center', marginVertical: 10 },
  title: { color: themePalette.hex_ffffff, fontSize: font.displayMedium, fontWeight: '400', textAlign: 'center' },
  italicTitle: { fontStyle: 'italic', color: themePalette.hex_d4af37, fontWeight: '400' },
  description: { color: themePalette.hex_94a3b8, textAlign: 'center', marginTop: 6, fontSize: font.base },
  form: { width: '100%' },
  label: { color: themePalette.hex_64748b, fontSize: font.small, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: themePalette.hex_1e293b,
    borderRadius: 12, backgroundColor: themePalette.hex_0f172a, paddingHorizontal: s(12), height: 52,
  },
  inputContainerSuccess: { borderColor: themePalette.hex_10b981 },
  inputContainerError: { borderColor: themePalette.hex_ef4444 },
  inputIcon: { fontSize: font.lg, marginRight: 10 },
  input: { flex: 1, color: themePalette.hex_ffffff, fontSize: font.md },
  eyeIcon: { color: themePalette.hex_94a3b8, fontSize: font.lg },
  successIcon: { color: themePalette.hex_10b981, fontSize: font.xxl, fontWeight: 'bold' },
  strengthBarContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 6 },
  strengthSegment: { flex: 1, height: 3, backgroundColor: themePalette.hex_1e293b, borderRadius: 2, marginHorizontal: 2 },
  strengthLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  subtext: { color: themePalette.hex_64748b, fontSize: font.sm },
  strengthText: { fontSize: font.sm, fontWeight: '600' },
  checklistCard: { backgroundColor: themePalette.hex_0b1120, borderWidth: 1, borderColor: themePalette.hex_1e293b, borderRadius: 12, padding: 14, marginBottom: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkCircle: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkCircleOk: { backgroundColor: themePalette.hex_064e3b },
  checkCircleOff: { backgroundColor: themePalette.hex_1e293b },
  checkMark: { fontSize: font.small, fontWeight: 'bold' },
  checkText: { fontSize: font.bodySmall },
  matchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  matchIcon: { fontSize: font.sm, marginRight: 6 },
  matchText: { fontSize: font.sm },
  footer: { marginTop: 20 },
  submitButton: {
    backgroundColor: themePalette.hex_d4af37, width: '100%', height: 52, borderRadius: 24,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  submitButtonText: { color: themePalette.hex_070a12, fontSize: font.lg, fontWeight: '700', marginRight: 8 },
  arrowIcon: { color: themePalette.hex_070a12, fontSize: font.xxl, fontWeight: 'bold' },
}));
