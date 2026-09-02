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
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { forgotPassword } from '../api/forgotPasswordApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const res = await forgotPassword(trimmed);

      // backend returns "Email not found" string check (kept from old logic)
      if (res?.message === 'Email not found') {
        setError(res.message);
        Toast.show({ type: 'error', text1: res.message });
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
      <StatusBar barStyle="light-content" backgroundColor="#070A12" />

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

          {/* Lock Icon Section */}
          <View style={styles.heroSection}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <View style={styles.lockIconContainer}>
                  <Text style={styles.lockIcon}>🔓</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Title & Description */}
          <View style={styles.textSection}>
            <Text style={styles.title}>
              Forgot your <Text style={styles.italicTitle}>password?</Text>
            </Text>
            <Text style={styles.description}>
              No problem. Enter your registered email and we&apos;ll send you a verification code.
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
                placeholderTextColor="#6B7280"
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
                The code expires in <Text style={styles.boldText}>10 minutes</Text>. Check your spam
                folder if you don&apos;t see it.
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
              disabled={loading}
              android_ripple={{ color: '#B8941F' }}>
              {loading ? (
                <ActivityIndicator color="#070A12" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Send Verification Code</Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </>
              )}
            </Pressable>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    marginTop: 10,
  },
  topLogo: {
    width: 150,
    height: 38,
    resizeMode: 'contain',
    marginTop: 10,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 10,
  },

  outerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  lockIcon: {
    fontSize: 28,
  },
  textSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: '#D4AF37',
    fontWeight: '400',
  },
  description: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  form: {
    width: '100%',
  },
  label: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    height: 52,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    color: '#D4AF37',
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: 6,
  },
  subtext: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  infoIcon: {
    color: '#94A3B8',
    fontSize: 16,
    marginRight: 10,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  infoTextBold: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  boldText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    width: '100%',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#070A12',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#070A12',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomLinkContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  bottomText: {
    color: '#64748B',
    fontSize: 13,
  },
  linkText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '600',
  },
});
