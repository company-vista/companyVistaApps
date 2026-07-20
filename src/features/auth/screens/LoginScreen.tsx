import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import {
  clearLoginError,
  loginUser,
  googleLoginUser,
} from '../../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';
import styles from './LoginScreen.styles';
import Toast from 'react-native-toast-message';

import logoImage from '../../../assets/images/logoR.png';

GoogleSignin.configure({
  webClientId: '1080172574320-193qhf74d29aa4b7fuf2f01h70ahjsic.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['profile', 'email'],
});

type LoginScreenProps = {
  onSignupPress: () => void;
  onForgotPasswordPress: () => void;
  onLoginSuccess?: () => void;
};

const socialLinks = {
  google: 'https://accounts.google.com',
  facebook: 'https://www.facebook.com/companyvista',
  instagram: 'https://www.instagram.com',
  linkedin: 'https://www.linkedin.com/company/companyvista/about',
};

function openSocialLink(url: string) {
  Linking.openURL(url);
}

function LoginScreen({ onSignupPress, onForgotPasswordPress, onLoginSuccess }: LoginScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { isLoading, loginErrors: errors } = useAppSelector(state => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const emailBorderColor = errors.email ? '#f87171' : colors.inputBorder;
  const passwordBorderColor = errors.password ? '#f87171' : colors.inputBorder;

  async function handleLogin() {
    if (isLoading) {
      return;
    }

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      Toast.show({ type: 'success', text1: 'Login successful', text2: 'Welcome back!' });
      onLoginSuccess?.();
    }
  }

  async function handleGoogleSignIn() {
    if (isLoading) {
      return;
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      console.log('GoogleSignIn response:', JSON.stringify(response, null, 2));

      const idToken =
        (response as any).idToken ??
        (response as any).user?.idToken ??
        (response as any).data?.idToken;

      if (!idToken) {
        Toast.show({
          type: 'error',
          text1: 'Google login failed',
          text2: 'No ID token received. Check SHA-1 & webClientId.',
        });
        return;
      }

      const result = await dispatch(googleLoginUser({ idToken }));
      if (googleLoginUser.fulfilled.match(result)) {
        Toast.show({ type: 'success', text1: 'Login successful', text2: 'Welcome back!' });
        onLoginSuccess?.();
      }
    } catch (error: any) {
      if (error.code === 'SIGN_IN_CANCELLED') {
        return;
      }
      console.log('GoogleSignIn error:', JSON.stringify(error, null, 2));
      Toast.show({
        type: 'error',
        text1: 'Google login failed',
        text2: error.message || 'Something went wrong.',
      });
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
      <View style={styles.container}>
        <View style={styles.brandMark}>
          <Image source={logoImage} style={styles.brandLogo} />
        </View>

        <View style={styles.header}>
          {/* <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Login to continue to Company Vista</Text> */}
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Email</Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: emailBorderColor,
                },
              ]}>
              <FontAwesome name="envelope" size={16} color={colors.inputPlaceholder} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={value => {
                  setEmail(value);
                  dispatch(clearLoginError('email'));
                }}
                placeholder="name@example.com"
                placeholderTextColor={colors.inputPlaceholder}
                style={[styles.input, { color: colors.inputText }]}
                value={email}
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Password</Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: passwordBorderColor,
                },
              ]}>
              <FontAwesome name="lock" size={20} color={colors.inputPlaceholder} />
              <TextInput
                onChangeText={value => {
                  setPassword(value);
                  dispatch(clearLoginError('password'));
                }}
                placeholder="Enter password"
                placeholderTextColor={colors.inputPlaceholder}
                secureTextEntry={!isPasswordVisible}
                style={[styles.input, { color: colors.inputText }]}
                value={password}
              />
              <Pressable
                accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
                onPress={() => setIsPasswordVisible(current => !current)}
                style={styles.passwordToggle}>
                <FontAwesome
                  name={isPasswordVisible ? 'eye-slash' : 'eye'}
                  size={18}
                  color={colors.subtle}
                />
              </Pressable>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <Pressable style={styles.forgotPassword} onPress={onForgotPasswordPress}>
            <Text style={[styles.forgotPasswordText, { color: '#ef4444' }]}>Forgot Password?</Text>
          </Pressable>

          <Pressable
            disabled={isLoading}
            onPress={handleLogin}
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              isLoading ? styles.buttonDisabled : null,
            ]}>
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
            <Text style={[styles.dividerText, { color: colors.muted }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
          </View>

          <Pressable
            disabled={isLoading}
            onPress={handleGoogleSignIn}
            style={[
              styles.googleAuthButton,
              isLoading ? { opacity: 0.6 } : null,
            ]}>
            <FontAwesome name="google" size={16} color="#ea4335" />
            <Text style={styles.googleAuthText}>
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </Text>
          </Pressable>

          <Pressable onPress={onSignupPress}>
            <Text style={[styles.authLinkText, { color: colors.subtle }]}>
              Don't have an account?{' '}
              <Text style={[styles.authLink, { color: colors.accent }]}>Sign Up</Text>
            </Text>
          </Pressable>

          <View style={styles.socialSection}>
            <Text style={[styles.socialTitle, { color: colors.inputPlaceholder }]}>
              Continue with
            </Text>
            <View style={styles.socialRow}>
              <Pressable
                onPress={() => openSocialLink(socialLinks.facebook)}
                style={[styles.socialButton, styles.facebookButton]}>
                <FontAwesome name="facebook" size={15} color="#f8fafc" />
              </Pressable>
              <Pressable
                onPress={() => openSocialLink(socialLinks.instagram)}
                style={[styles.socialButton, styles.instagramButton]}>
                <FontAwesome name="instagram" size={15} color="#f8fafc" />
              </Pressable>
              <Pressable
                onPress={() => openSocialLink(socialLinks.linkedin)}
                style={[styles.socialButton, styles.linkedinButton]}>
                <FontAwesome name="linkedin" size={15} color="#f8fafc" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
