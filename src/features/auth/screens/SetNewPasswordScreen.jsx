import React, { useEffect, useMemo, useState } from 'react';
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
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPendingAddCompany, setPendingOrderData } from '../../../store/slices/authSlice';
import { setPasswordApi } from '../api/orderApi';
import { s } from '../../../theme/responsive';
import { useThemeColors, themePalette } from '../../../theme/colors';
import { font } from '../../../theme/typography';

export default function SetNewPasswordScreen(props) {
  const { navigation, route } = props;
  const dispatch = useAppDispatch();
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  const email = props.email || route?.params?.email;
  useEffect(() => {
    console.log('=== SET NEW PASSWORD SCREEN DATA ===', JSON.stringify(route?.params, null, 2));
    console.log('=== SET NEW PASSWORD PENDING ORDER ===', JSON.stringify(pendingOrder, null, 2));
  }, []);
  const clientId = props.clientId || route?.params?.clientId || pendingOrder?.clientId;
  const token = props.token || route?.params?.token || pendingOrder?.token;
  const companyIdFromStore = pendingOrder?.companyId || route?.params?.companyId || route?.params?.company_id || '';
  const onPasswordSet = props.onPasswordSet || route?.params?.onPasswordSet;
  const onBackPress = props.onBackPress || route?.params?.onBackPress;
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

  async function handleSetPassword() {
    if (!newPassword.trim()) {
      Toast.show({ type: 'error', text1: 'Password is required' });
      return;
    }
    if (newPassword.length < 8) {
      Toast.show({ type: 'error', text1: 'Password must be at least 8 characters' });
      return;
    }
    if (!passwordsMatch) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    if (!clientId || !token) {
      Toast.show({ type: 'error', text1: 'Invalid session', text2: 'Please verify email again' });
      return;
    }
    setLoading(true);
    try {
      const respData = await setPasswordApi({ clientId, password: newPassword.trim(), token });
      console.log('=== SET-PASSWORD RESPONSE RAW ===', JSON.stringify(respData, null, 2));
      if (respData?.success === false) throw new Error(respData?.message || 'Set password failed');
      Toast.show({ type: 'success', text1: 'Account registered', text2: 'Please continue' });
      if (onPasswordSet) {
        onPasswordSet();
      } else {
        dispatch(setPendingAddCompany(true));
        const from = route?.params?.from;
        if (from === 'FounderDetails' || companyIdFromStore || route?.params?.companyId) {
          if (navigation?.navigate) {
            const reviewParams = {
              selectedStructure: route?.params?.selectedStructure,
              selectedState: route?.params?.selectedState,
              selectedEnding: route?.params?.selectedEnding,
              selectedCountry: route?.params?.selectedCountry,
              selectedCountryPrice: route?.params?.selectedCountryPrice,
              bestCountry: route?.params?.bestCountry,
              bestCountryPrice: route?.params?.bestCountryPrice,
              bestCountryName: route?.params?.bestCountryName,
              selectedStatePrice: route?.params?.selectedStatePrice,
              selectedStructurePrice: route?.params?.selectedStructurePrice,
              bestState: route?.params?.bestState,
              bestStatePrice: route?.params?.bestStatePrice,
              bestStatePriceNote: route?.params?.bestStatePriceNote,
              bestStateTimeframe: route?.params?.bestStateTimeframe,
              selectedAddOns: route?.params?.selectedAddOns,
              addOnsTotal: route?.params?.addOnsTotal,
              runningTotal: route?.params?.runningTotal,
              totalAmount: route?.params?.totalAmount ?? pendingOrder?.totalAmount,
              pricingType: route?.params?.pricingType ?? pendingOrder?.pricingType,
              companyName: route?.params?.companyName,
              email,
              fullName: route?.params?.fullName,
              countryOfResidence: route?.params?.countryOfResidence,
              phone: route?.params?.phone,
              advisorFlow: route?.params?.advisorFlow,
              selectedJurisdiction: route?.params?.selectedJurisdiction,
              purpose: route?.params?.purpose,
              customerLocation: route?.params?.customerLocation,
              priorities: route?.params?.priorities,
              dayOneNeeds: route?.params?.dayOneNeeds,
              physicalPresence: route?.params?.physicalPresence,
              usStatePriority: route?.params?.usStatePriority,
              countryCode: route?.params?.countryCode,
              companyId: companyIdFromStore,
              clientId,
              token,
            };
            console.log('=== SET PASSWORD -> REVIEW & SUBMIT DATA ===', JSON.stringify(reviewParams, null, 2));
            dispatch(setPendingOrderData(reviewParams));
            if (navigation.replace) navigation.replace('ReviewAndConfirm', reviewParams);
            else navigation.navigate('ReviewAndConfirm', reviewParams);
          }
        }
      }
    } catch (error) {
      console.log('=== SET-PASSWORD ERROR ===', JSON.stringify(error?.response?.data || error.message, null, 2));
      const message = error?.response?.data?.message || error?.message || 'Failed to set password.';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  }

  const handleBack = () => {
    if (onBackPress) onBackPress();
    else if (navigation?.goBack) navigation.goBack();
    else navigation?.navigate?.('Login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.headerRow}>
            <BackButton onPress={handleBack} />
            <Image source={logoR} style={styles.topLogo} />
          </View>

          <View style={styles.textSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              Set your <Text style={[styles.italicTitle, { color: isDark ? themePalette.hex_d4af37 : colors.primary }]}>password</Text>
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              Create a strong password for{'\n'}
              {email ? <Text style={{ color: isDark ? themePalette.hex_d4af37 : colors.primary, fontWeight: '700' }}>{email}</Text> : 'your new account'}
            </Text>
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
                <View key={i} style={[styles.strengthSegment, { backgroundColor: colors.border }, i < strengthScore && { backgroundColor: strengthColor }]} />
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
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: passwordsMatch ? colors.success : isConfirmError ? colors.danger : colors.inputBorder }]}>
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
                <Text style={[styles.matchText, { color: passwordsMatch ? colors.success : colors.danger }]}>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.submitButton, !isDark && { backgroundColor: themePalette.hex_2563eb }, loading && { opacity: 0.7 }]} onPress={handleSetPassword} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color={isDark ? themePalette.hex_070a12 : themePalette.hex_ffffff} /> : (
                <>
                  <Text style={[styles.submitButtonText, !isDark && { color: themePalette.hex_ffffff }]}>Set Password & Continue</Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, marginTop: 6 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  textSection: { alignItems: 'center', marginTop: 8, marginBottom: 10 },
  title: { fontSize: font.displayLarge, fontWeight: '600', textAlign: 'center' },
  italicTitle: { fontStyle: 'italic', fontWeight: '400' },
  description: { textAlign: 'center', marginTop: 6, fontSize: font.base, lineHeight: 22 },
  form: { width: '100%' },
  label: { fontSize: font.sm, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 4 },
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
