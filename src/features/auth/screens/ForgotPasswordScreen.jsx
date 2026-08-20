import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import styles from './LoginScreen.styles';
import { useThemeColors } from '../../../theme/colors';
import { forgotPassword } from '../api/forgotPasswordApi';
const checkEmail = 'Email not found';
export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
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
            if (res.message === checkEmail) {
                Toast.show({ type: 'error', text1: res?.message });
                return;
            }
            else {
                navigation.navigate('OtpVerify', { email: email.trim() });
            }
        }
        catch (err) {
            const message = err?.response?.data?.message || 'Something went wrong. Please try again.';
            setError(message);
        }
        finally {
            setLoading(false);
        }
    }
    return (<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[
            styles.screen,
            { backgroundColor: '#ffffff', paddingTop: safeAreaInsets.top },
        ]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.container, { justifyContent: 'flex-start', paddingTop: 24 }]}>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Email</Text>
            <View style={[
            styles.inputWrap,
            {
                backgroundColor: colors.inputBackground,
                borderColor: error ? '#ef4444' : colors.inputBorder,
            },
        ]}>
              <FontAwesome name="envelope" size={16} color={colors.inputPlaceholder}/>
              <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" onChangeText={setEmail} placeholder="name@example.com" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.inputText }]} value={email}/>
            </View>
            {error ? <Text style={[styles.errorText, { color: '#ef4444', marginTop: 4 }]}>{error}</Text> : null}
          </View>

          <Pressable onPress={handleReset} disabled={loading} style={[
            styles.button,
            { backgroundColor: colors.buttonBackground, opacity: loading ? 0.7 : 1 },
        ]}>
            {loading ? (<ActivityIndicator color={colors.buttonText} size="small"/>) : (<Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Send Reset Link
              </Text>)}
          </Pressable>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[styles.authLinkText, { color: colors.subtle, textAlign: 'center' }]}>
              Back to{' '}
              <Text style={[styles.authLink, { color: colors.accent }]}>Login</Text>
            </Text>
          </Pressable>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>);
}
