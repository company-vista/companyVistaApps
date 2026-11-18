import React, { useState } from 'react';
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
import { forgotPassword } from '../api/forgotPasswordApi';
import { s } from '../../../theme/responsive';
import { useThemeColors, themePalette } from '../../../theme/colors';
import { font } from '../../../theme/typography';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';
  const accountType = route.params?.accountType === 'admin' ? 'admin' : 'client';
  const [email, setEmail] = useState(route.params?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkSent, setLinkSent] = useState(false);

  async function handleSubmit() {
    const trimmed = email.trim();

    if (!trimmed) {
      setError('Email is required');
      Toast.show({ type: 'error', text1: 'Email is required' });
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email address');
      Toast.show({ type: 'error', text1: 'Invalid email address' });
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await forgotPassword(trimmed, accountType);

      if (res?.message === 'Email not found') {
        setError(res.message);
        Toast.show({ type: 'error', text1: res.message });
        return;
      }

      if (res?.success === false) {
        throw new Error(res?.message || 'Unable to send password reset email.');
      }

      if (accountType === 'admin') {
        setLinkSent(true);
        Toast.show({ type: 'success', text1: 'Reset link sent', text2: 'Check your email to continue.' });
        return;
      }

      Toast.show({ type: 'success', text1: res?.message || 'Verification code sent!' });
      navigation.navigate('OtpVerify', { email: trimmed });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      setError(message);
      Toast.show({ type: 'error', text1: 'Failed to send code', text2: message });
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} />
            <Image source={logoR} style={styles.topLogo} />
          </View>

          <View style={styles.textSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              Forgot your <Text style={[styles.italicTitle, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}>password?</Text>
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              {accountType === 'admin'
                ? "Enter your admin email and we'll send you a secure password reset link."
                : "No problem. Enter your registered email and we'll send you a verification code."}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.subtle }]}>EMAIL ADDRESS</Text>

            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: error ? colors.danger : colors.inputBorder }]}>
              <Ionicons name="mail-outline" size={18} color={isDark ? themePalette.hex_d4af37 : colors.subtle} />
              <TextInput
                style={[styles.input, { color: colors.inputText }]}
                value={email}
                onChangeText={val => {
                  setEmail(val);
                  if (error) setError('');
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
            {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
            <Text style={[styles.subtext, { color: colors.subtle }]}>Use the email you registered your account with</Text>

            <View style={[styles.infoCard, { backgroundColor: isDark ? themePalette.hex_0b1120 : colors.surface, borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={18} color={colors.muted} style={{ marginRight: s(10) }} />
              <Text style={[styles.infoText, { color: colors.muted }]}>
                {accountType === 'admin'
                  ? <>The reset link expires in <Text style={[styles.boldText, { color: colors.text }]}>1 hour</Text>. Check your spam folder if it doesn't arrive.</>
                  : <>The code expires in <Text style={[styles.boldText, { color: colors.text }]}>10 minutes</Text>. Check your spam folder if you don't see it.</>}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: isDark ? themePalette.hex_0b1120 : colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => Toast.show({ type: 'info', text1: 'Contact support', text2: 'support@companyvista.com' })}>
              <Ionicons name="headset-outline" size={18} color={colors.muted} style={{ marginRight: s(10) }} />
              <Text style={[styles.infoTextBold, { color: colors.text }]}>Can't access this email? Contact support</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, !isDark && { backgroundColor: themePalette.hex_2563eb }, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading || linkSent}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={isDark ? themePalette.hex_070a12 : themePalette.hex_ffffff} />
              ) : linkSent ? (
                <>
                  <Text style={[styles.submitButtonText, !isDark && { color: themePalette.hex_ffffff }]}>Link sent — check your email</Text>
                  <Text style={[styles.arrowIcon, !isDark && { color: themePalette.hex_ffffff }]}>✓</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.submitButtonText, !isDark && { color: themePalette.hex_ffffff }]}>
                    {accountType === 'admin' ? 'Send Reset Link' : 'Send Verification Code'}
                  </Text>
                  <Text style={[styles.arrowIcon, !isDark && { color: themePalette.hex_ffffff }]}>→</Text>
                </>
              )}
            </TouchableOpacity>

            {linkSent && (
              <Text style={[styles.linkSentHint, { color: colors.subtle }]}>
                Open the link in your email on this device to set a new password.
              </Text>
            )}

            <View style={styles.bottomLinkContainer}>
              <Text style={[styles.bottomText, { color: colors.muted }]}>Remembered it? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.linkText, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}>Back to log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: s(14), paddingBottom: s(16) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(6), marginTop: s(1) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  textSection: { alignItems: 'center', marginTop: s(2), marginBottom: s(6) },
  title: { fontSize: font.displayMedium, fontWeight: '500', textAlign: 'center', marginVertical: s(22) },
  italicTitle: { fontStyle: 'italic', fontWeight: '400' },
  description: { textAlign: 'center', marginTop: s(6), fontSize: font.base, lineHeight: 22, paddingHorizontal: s(10), marginVertical: s(22) },
  form: { width: '100%', marginBottom: s(12) },
  label: { fontSize: font.sm, fontWeight: '700', letterSpacing: 1, marginBottom: s(8) },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: s(12), height: 52, gap: 10 },
  input: { flex: 1, fontSize: font.base },
  errorText: { fontSize: font.sm, marginTop: s(6) },
  subtext: { fontSize: font.sm, marginTop: s(4), marginBottom: s(10) },
  infoCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: s(12), marginBottom: s(8) },
  infoText: { fontSize: font.base, flex: 1, lineHeight: 20 },
  infoTextBold: { fontSize: font.base, fontWeight: '600', flex: 1 },
  boldText: { fontWeight: '700' },
  footer: { marginTop: s(12), alignItems: 'center' },
  submitButton: { backgroundColor: themePalette.hex_d4af37, width: '100%', paddingVertical: s(14), borderRadius: s(24), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitButtonText: { color: themePalette.hex_070a12, fontSize: font.lg, fontWeight: '700' },
  linkSentHint: { fontSize: font.sm, textAlign: 'center', marginTop: s(8) },
  arrowIcon: { color: themePalette.hex_070a12, fontSize: font.xl, fontWeight: 'bold' },
  bottomLinkContainer: { flexDirection: 'row', marginTop: s(10) },
  bottomText: { fontSize: font.base },
  linkText: { fontSize: font.base, fontWeight: '600' },
});
