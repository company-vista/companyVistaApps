import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { resetPassword } from '../api/forgotPasswordApi';
import { s } from '../../../theme/responsive';
import { useThemeColors, themePalette } from '../../../theme/colors';
import { font } from '../../../theme/typography';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params || {};
  const accountType = route.params?.accountType === 'admin' ? 'admin' : 'client';
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

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
  const strengthColor = strengthScore <= 1 ? colors.danger : strengthScore === 2 ? colors.warning : strengthScore === 3 ? colors.info : colors.success;
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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} />
            <Image source={logoR} style={styles.topLogo} />
          </View>

          <View style={styles.textSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              Create a new <Text style={[styles.italicTitle, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}>password</Text>
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>Choose a strong password you haven't used before.</Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.subtle }]}>NEW PASSWORD</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: newPassword.length > 0 && strengthScore === 4 ? colors.success : colors.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.subtle} />
              <TextInput
                style={[styles.input, { color: colors.inputText }]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Enter new password"
                placeholderTextColor={colors.inputPlaceholder}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.subtle} />
              </TouchableOpacity>
            </View>

            <View style={styles.strengthBarContainer}>
              {[0, 1, 2, 3].map(i => (
                <View
                  key={i}
                  style={[
                    styles.strengthSegment,
                    { backgroundColor: colors.border },
                    i < strengthScore && { backgroundColor: strengthColor },
                  ]}
                />
              ))}
            </View>
            <View style={styles.strengthLabelRow}>
              <Text style={[styles.subtext, { color: colors.subtle }]}>Password strength</Text>
              <Text style={[styles.strengthText, { color: newPassword ? strengthColor : colors.subtle }]}>
                {newPassword ? strengthLabel : '-'}
              </Text>
            </View>

            <View style={[styles.checklistCard, { backgroundColor: isDark ? themePalette.hex_0b1120 : colors.surface, borderColor: colors.border }]}>
              <CheckRow ok={checks.length} text="At least 8 characters" colors={colors} isDark={isDark} />
              <CheckRow ok={checks.caseMix} text="One uppercase & lowercase letter" colors={colors} isDark={isDark} />
              <CheckRow ok={checks.number} text="At least one number" colors={colors} isDark={isDark} />
              <CheckRow ok={checks.special} text="One special character (!@#$)" colors={colors} isDark={isDark} />
            </View>

            <Text style={[styles.label, { color: colors.subtle }]}>CONFIRM PASSWORD</Text>
            <View style={[
              styles.inputContainer,
              { backgroundColor: colors.inputBackground, borderColor: passwordsMatch ? colors.success : isConfirmError ? colors.danger : colors.inputBorder },
            ]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.subtle} />
              <TextInput
                style={[styles.input, { color: colors.inputText }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Confirm password"
                placeholderTextColor={colors.inputPlaceholder}
                autoCapitalize="none"
              />
              {passwordsMatch ? <Ionicons name="checkmark-circle" size={18} color={colors.success} /> : null}
            </View>
            {confirmPassword.length > 0 && (
              <View style={styles.matchRow}>
                <Ionicons name={passwordsMatch ? 'checkmark-circle' : 'close-circle'} size={14} color={passwordsMatch ? colors.success : colors.danger} />
                <Text style={[styles.matchText, { color: passwordsMatch ? colors.success : colors.danger }]}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, !isDark && { backgroundColor: themePalette.hex_2563eb }, loading && { opacity: 0.7 }]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? <ActivityIndicator color={isDark ? themePalette.hex_070a12 : themePalette.hex_ffffff} /> : (
                <>
                  <Text style={[styles.submitButtonText, !isDark && { color: themePalette.hex_ffffff }]}>Reset Password</Text>
                  <Text style={[styles.arrowIcon, !isDark && { color: themePalette.hex_ffffff }]}>→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function CheckRow({ ok, text, colors, isDark }) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkCircle, { backgroundColor: ok ? (isDark ? themePalette.hex_064e3b : themePalette.rgba_16_185_129_0_15) : (isDark ? themePalette.hex_1e293b : colors.inputBackground) }]}>
        <Ionicons name="checkmark" size={11} color={ok ? colors.success : colors.subtle} />
      </View>
      <Text style={[styles.checkText, { color: ok ? colors.success : colors.subtle }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: s(20), paddingBottom: 20, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, marginTop: 10 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  textSection: { alignItems: 'center', marginVertical: 10 },
  title: { fontSize: font.displayMedium, fontWeight: '400', textAlign: 'center' },
  italicTitle: { fontStyle: 'italic', fontWeight: '400' },
  description: { textAlign: 'center', marginTop: 6, fontSize: font.base, lineHeight: 22 },
  form: { width: '100%' },
  label: { fontSize: font.sm, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: s(12), height: 52, gap: 10 },
  input: { flex: 1, fontSize: font.base },
  strengthBarContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 6 },
  strengthSegment: { flex: 1, height: 3, borderRadius: 2, marginHorizontal: 2 },
  strengthLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  subtext: { fontSize: font.sm },
  strengthText: { fontSize: font.sm, fontWeight: '600' },
  checklistCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkCircle: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkText: { fontSize: font.base },
  matchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  matchText: { fontSize: font.sm },
  footer: { marginTop: 20 },
  submitButton: { backgroundColor: themePalette.hex_d4af37, width: '100%', height: 52, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitButtonText: { color: themePalette.hex_070a12, fontSize: font.lg, fontWeight: '700' },
  arrowIcon: { color: themePalette.hex_070a12, fontSize: font.xl, fontWeight: 'bold' },
});
