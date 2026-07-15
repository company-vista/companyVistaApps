import { useRef, useState } from 'react';
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
import Toast from 'react-native-toast-message';

import styles from './LoginScreen.styles';
import logoImage from '../../../assets/images/logoR.png';
import { useThemeColors } from '../../../theme/colors';

type OtpVerifyScreenProps = {
  onBackPress: () => void;
  onOtpVerified: (token: string) => void;
  email: string;
};

export default function OtpVerifyScreen({ onBackPress, onOtpVerified, email }: OtpVerifyScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  function handleChange(text: string, index: number) {
    if (text.length > 1) {
      text = text.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e: any, index: number) {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  }

  async function handleVerify() {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Toast.show({ type: 'error', text1: 'Please enter 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      // console.log(email)
      const { API_BASE_URL } = await import('../../../config/api');
      const axios = (await import('axios')).default;
      const response = await axios.post(`${API_BASE_URL}/api/client/auth/otpverify-app`, {
        email,
        otp: otpString,
      });
      
      const token = response.data?.token;
      if (token) {
        onOtpVerified(token);
      } else {
        Toast.show({ type: 'error', text1: 'Something went wrong' });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Invalid OTP. Please try again.';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
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
          <Text style={[styles.title, { color: colors.text }]}>Verify OTP</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={{ color: colors.text, fontWeight: '700' }}>{email}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => { inputs.current[index] = ref; }}
                style={{
                  width: 44,
                  height: 52,
                  borderWidth: 1,
                  borderColor: digit ? colors.primary : colors.inputBorder,
                  borderRadius: 10,
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                value={digit}
                autoFocus={index === 0}
              />
            ))}
          </View>

          <Pressable
            onPress={handleVerify}
            disabled={loading}
            style={[
              styles.button,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
            ]}>
            {loading ? (
              <ActivityIndicator color={colors.primaryText} size="small" />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                Verify OTP
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
