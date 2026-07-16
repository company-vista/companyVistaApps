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
import { font } from '../../../theme/typography';

type ResetPasswordScreenProps = {
  onBackPress: () => void;
  token?: string;
};

export default function ResetPasswordScreen({ onBackPress, token }: ResetPasswordScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset() {
    if (!newPassword.trim()) {
      Toast.show({ type: 'error', text1: 'New password is required' });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const { API_BASE_URL } = await import('../../../config/api');
      const axios = (await import('axios')).default;
      await axios.post(`${API_BASE_URL}/api/client/auth/reset-password/${token}`, {
        password: newPassword.trim(),
      });
      Toast.show({ type: 'success', text1: 'Password reset successful' });
      setTimeout(() => onBackPress(), 1500);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Something went wrong. Please try again.';
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
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Enter your new password below.
          </Text>
        </View>

        <View style={styles.form}>
          {!done ? (
            <>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.muted }]}>New Password</Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                    },
                  ]}>
                  <FontAwesome name="lock" size={16} color={colors.inputPlaceholder} />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.inputPlaceholder}
                    secureTextEntry={!showNew}
                    style={[styles.input, { color: colors.inputText }]}
                    value={newPassword}
                  />
                  <Pressable onPress={() => setShowNew(v => !v)} style={styles.passwordToggle}>
                    <FontAwesome
                      name={showNew ? 'eye-slash' : 'eye'}
                      size={16}
                      color={colors.inputPlaceholder}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.muted }]}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                    },
                  ]}>
                  <FontAwesome name="lock" size={16} color={colors.inputPlaceholder} />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.inputPlaceholder}
                    secureTextEntry={!showConfirm}
                    style={[styles.input, { color: colors.inputText }]}
                    value={confirmPassword}
                  />
                  <Pressable onPress={() => setShowConfirm(v => !v)} style={styles.passwordToggle}>
                    <FontAwesome
                      name={showConfirm ? 'eye-slash' : 'eye'}
                      size={16}
                      color={colors.inputPlaceholder}
                    />
                  </Pressable>
                </View>
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
                    Reset Password
                  </Text>
                )}
              </Pressable>
            </>
          ) : (
            <View style={styles.field}>
              <Text style={[styles.subtitle, { color: colors.muted, textAlign: 'center' }]}>
                Your password has been reset successfully.
              </Text>
            </View>
          )}

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
