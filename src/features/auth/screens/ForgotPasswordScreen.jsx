import { font } from '../../../theme/typography';
import { useState } from 'react';
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
import { forgotPassword } from '../api/forgotPasswordApi';
import { s } from '../../../theme/responsive';
import { themePalette, makeThemeStyles } from '../../../theme/colors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
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

      // backend returns "Email not found" string check (kept from old logic)
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={themePalette.hex_070a12} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header - same as LoginScreen */}
          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} />
            <Image source={logoR} style={styles.topLogo} />
          </View>



          {/* Title & Description */}
          <View style={styles.textSection}>
            <Text style={styles.title}>
              Forgot your <Text style={styles.italicTitle}>password?</Text>
            </Text>
            <Text style={styles.description}>
              {accountType === 'admin'
                ? 'Enter your admin email and we’ll send you a secure password reset link.'
                : 'No problem. Enter your registered email and we’ll send you a verification code.'}
            </Text>
          </View>

          {/* Form Area */}
          <View style={styles.form}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>

            <View style={[styles.inputContainer, error ? styles.inputError : null]}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={val => {
                  setEmail(val);
                  if (error) setError('');
                }}
                placeholder="Enter your email"
                placeholderTextColor={themePalette.hex_6b7280}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.subtext}>Use the email you registered your account with</Text>

            {/* Info Card 1 */}
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>⏱</Text>
              <Text style={styles.infoText}>
                {accountType === 'admin'
                  ? <>The reset link expires in <Text style={styles.boldText}>1 hour</Text>. Check your spam folder if it doesn’t arrive.</>
                  : <>The code expires in <Text style={styles.boldText}>10 minutes</Text>. Check your spam folder if you don’t see it.</>}
              </Text>
            </View>

            {/* Info Card 2 / Support */}
            <TouchableOpacity
              style={styles.infoCard}
              activeOpacity={0.7}
              onPress={() => Toast.show({ type: 'info', text1: 'Contact support', text2: 'support@companyvista.com' })}>
              <Text style={styles.infoIcon}>🎧</Text>
              <Text style={styles.infoTextBold}>Can&apos;t access this email? Contact support</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Pressable
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading || linkSent}
              android_ripple={{ color: themePalette.hex_b8941f }}>
              {loading ? (
                <ActivityIndicator color={themePalette.hex_070a12} />
              ) : linkSent ? (
                <>
                  <Text style={styles.submitButtonText}>Link sent — check your email</Text>
                  <Text style={styles.arrowIcon}>✓</Text>
                </>
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {accountType === 'admin' ? 'Send Reset Link' : 'Send Verification Code'}
                  </Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </>
              )}
            </Pressable>

            {linkSent && (
              <Text style={styles.linkSentHint}>
                Open the link in your email on this device to set a new password.
              </Text>
            )}

            <View style={styles.bottomLinkContainer}>
              <Text style={styles.bottomText}>Remembered it? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Back to log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = makeThemeStyles(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themePalette.hex_070a12,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: s(14),
    paddingBottom: s(16),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: s(6),
    marginTop: s(1),
  },
  topLogo: {
    width: 150,
    height: 38,
    resizeMode: 'contain',
    marginTop: s(10),
  },
  heroSection: {
    alignItems: 'center',
    marginTop: s(2),
  },

  outerCircle: {
    width: s(120),
    height: s(120),
    borderRadius: s(60),
    borderWidth: 1,
    borderColor: themePalette.hex_1e293b,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: s(92),
    height: s(92),
    borderRadius: s(46),
    borderWidth: 1,
    borderColor: themePalette.hex_334155,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIconContainer: {
    width: s(52),
    height: s(52),
    borderRadius: s(26),
    borderWidth: 1,
    borderColor: themePalette.hex_d4af37,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themePalette.hex_0f172a,
  },
  lockIcon: {
    fontSize: font.displayXL,
  },
  textSection: {
    alignItems: 'center',
    marginTop: s(2),
    marginBottom: s(6),
  },
  title: {
    color: themePalette.hex_ffffff,
    fontSize: font.displayMedium,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: s(22),
  },
  italicTitle: {
    fontStyle: 'italic',
    color: themePalette.hex_d4af37,
    fontWeight: '400',
  },
  description: {
    color: themePalette.hex_94a3b8,
    textAlign: 'center',
    marginTop: s(6),
    fontSize: font.base,
    lineHeight: 20,
    paddingHorizontal: s(10),
    marginVertical: s(22),
  },
  form: {
    width: '100%',
    marginBottom: s(12),
  },
  label: {
    color: themePalette.hex_64748b,
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: s(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themePalette.hex_d4af37,
    borderRadius: 12,
    backgroundColor: themePalette.hex_0f172a,
    paddingHorizontal: s(12),
    height: 52,
  },
  inputError: {
    borderColor: themePalette.hex_ef4444,
  },
  inputIcon: {
    color: themePalette.hex_d4af37,
    fontSize: font.lg,
    marginRight: s(10),
  },
  input: {
    flex: 1,
    color: themePalette.hex_ffffff,
    fontSize: font.md,
  },
  errorText: {
    color: themePalette.hex_fca5a5,
    fontSize: font.sm,
    marginTop: s(6),
  },
  subtext: {
    color: themePalette.hex_64748b,
    fontSize: font.sm,
    marginTop: s(4),
    marginBottom: s(10),
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themePalette.hex_0b1120,
    borderWidth: 1,
    borderColor: themePalette.hex_1e293b,
    borderRadius: 12,
    padding: s(12),
    marginBottom: s(8),
  },
  infoIcon: {
    color: themePalette.hex_94a3b8,
    fontSize: font.lg,
    marginRight: s(10),
  },
  infoText: {
    color: themePalette.hex_94a3b8,
    fontSize: font.bodySmall,
    flex: 1,
    lineHeight: 18,
  },
  infoTextBold: {
    color: themePalette.hex_e2e8f0,
    fontSize: font.bodySmall,
    fontWeight: '600',
    flex: 1,
  },
  boldText: {
    color: themePalette.hex_ffffff,
    fontWeight: '700',
  },
  footer: {
    marginTop: s(12),
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: themePalette.hex_d4af37,
    width: '100%',
    paddingVertical: s(14),
    borderRadius: s(24),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: themePalette.hex_070a12,
    fontSize: font.lg,
    fontWeight: '700',
    marginRight: s(8),
  },
  linkSentHint: {
    color: themePalette.hex_64748b,
    fontSize: font.sm,
    textAlign: 'center',
    marginTop: s(8),
  },
  arrowIcon: {
    color: themePalette.hex_070a12,
    fontSize: font.xxl,
    fontWeight: 'bold',
  },
  bottomLinkContainer: {
    flexDirection: 'row',
    marginTop: s(10),
  },
  bottomText: {
    color: themePalette.hex_64748b,
    fontSize: font.bodySmall,
  },
  linkText: {
    color: themePalette.hex_d4af37,
    fontSize: font.bodySmall,
    fontWeight: '600',
  },
}));
