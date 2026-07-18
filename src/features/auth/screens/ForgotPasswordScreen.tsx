import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

import styles from './LoginScreen.styles';
import logoImage from '../../../assets/images/logoR.png';
import { useThemeColors } from '../../../theme/colors';
// import { font } from '../../../theme/typography';
import { forgotPassword } from '../api/forgotPasswordApi';

type ForgotPasswordScreenProps = {
  onBackPress: () => void;
  onOtpVerifyPress: (email: string) => void;
};

const checkEmail = "Email not found"

export default function ForgotPasswordScreen({ onBackPress, onOtpVerifyPress }: ForgotPasswordScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Email is required' });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await forgotPassword(email.trim());
      if(res.message === checkEmail){
        Toast.show({ type: 'error', text1: res?.message });
        return;
      }else{
        onOtpVerifyPress(email.trim());
      }
      
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.screen,
        { backgroundColor: colors.authBackground, paddingTop: safeAreaInsets.top },
      ]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
      <View style={[styles.container, { justifyContent: 'flex-start', paddingTop: 40 }]}>
        <View style={styles.brandMark}>
          <Image source={logoImage} style={styles.brandLogo} />
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Email</Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: error ? '#ef4444' : colors.inputBorder,
                },
              ]}>
              <FontAwesome name="envelope" size={16} color={colors.inputPlaceholder} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={colors.inputPlaceholder}
                style={[styles.input, { color: colors.inputText }]}
                value={email}
              />
            </View>
            {error ? <Text style={[styles.errorText, { color: '#ef4444', marginTop: 4 }]}>{error}</Text> : null}
          </View>

          <Pressable
            onPress={handleReset}
            disabled={loading}
            style={[
              styles.button,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
            ]}>
            {loading ? (
              <ActivityIndicator color={colors.primaryText} size="small" />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                Send Reset Link
              </Text>
            )}
          </Pressable>

          <Pressable onPress={onBackPress}>
            <Text style={[styles.authLinkText, { color: colors.subtle, textAlign: 'center' }]}>
              Back to{' '}
              <Text style={[styles.authLink, { color: colors.accent }]}>Login</Text>
            </Text>
          </Pressable>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
