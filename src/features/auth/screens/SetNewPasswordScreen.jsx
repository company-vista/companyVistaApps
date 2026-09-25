import React, { useEffect, useMemo, useState } from 'react';
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
import axios from 'axios';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPendingAddCompany, setPendingOrderData } from '../../../store/slices/authSlice';
import { setPasswordApi } from '../api/orderApi';
import { s } from '../../../theme/responsive';

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
  const strengthColor = strengthScore <= 1 ? '#EF4444' : strengthScore === 2 ? '#F59E0B' : strengthScore === 3 ? '#22D3EE' : '#10B981';
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isConfirmError = confirmPassword.length > 0 && !passwordsMatch;

  async function handleSetPassword() {
    if (!newPassword.trim()) {
      Toast.show({ type: 'error', text1: 'Password is required' });
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
      // Signup ke baad sidha Home nahi - Confirm & Review pe jaye, auto-login Status pe hoga
      if (onPasswordSet) {
        onPasswordSet();
      } else {
        dispatch(setPendingAddCompany(true));
        const from = route?.params?.from;
        // from check ko loose kiya — companyId ho to FounderDetails flow hi hai, Review pe jana chahiye
        if (from === 'FounderDetails' || companyIdFromStore || route?.params?.companyId) {
          // FounderDetails flow: after password -> ReviewAndConfirm
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
            // FIX: Always go to ReviewAndConfirm -> CompletePayment -> Status -> Home (no direct Home)
            // Chahe price 0 (quoted) ho tab bhi Review pe bhejo, Home sirf Status ke Continue ke baad khulega
            dispatch(setPendingOrderData(reviewParams));
            if (navigation.replace) navigation.replace('ReviewAndConfirm', reviewParams);
            else navigation.navigate('ReviewAndConfirm', reviewParams);
          }
        } else {
          // Non-founder: auto-login ho gaya, Root Main pe switch karega - Login pe bhejne ki zarurat nahi
          // Home khud khul jayega
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#070A12" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.headerRow}>
            <BackButton onPress={handleBack} />
            <Image source={logoR} style={styles.topLogo} />
          </View>



          <View style={styles.textSection}>
            <Text style={styles.title}>
              Set your <Text style={styles.italicTitle}>password</Text>
            </Text>
            <Text style={styles.description}>
              Create a strong password for{'\n'}
              {email ? <Text style={styles.emailHighlight}>{email}</Text> : 'your new account'}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>NEW PASSWORD</Text>
            <View style={[styles.inputContainer, newPassword.length > 0 && strengthScore === 4 && styles.inputContainerSuccess]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Enter new password"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Text style={styles.eyeIcon}>{isPasswordVisible ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.strengthBarContainer}>
              {[0, 1, 2, 3].map(i => (
                <View key={i} style={[styles.strengthSegment, i < strengthScore && { backgroundColor: strengthColor }]} />
              ))}
            </View>
            <View style={styles.strengthLabelRow}>
              <Text style={styles.subtext}>Password strength</Text>
              <Text style={[styles.strengthText, { color: newPassword ? strengthColor : '#64748B' }]}>
                {newPassword ? strengthLabel : '-'}
              </Text>
            </View>

            <View style={styles.checklistCard}>
              <CheckRow ok={checks.length} text="At least 8 characters" />
              <CheckRow ok={checks.caseMix} text="One uppercase & lowercase letter" />
              <CheckRow ok={checks.number} text="At least one number" />
              <CheckRow ok={checks.special} text="One special character (!@#$)" />
            </View>

            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={[styles.inputContainer, passwordsMatch && styles.inputContainerSuccess, isConfirmError && styles.inputContainerError]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Confirm password"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
              {passwordsMatch ? <Text style={styles.successIcon}>✓</Text> : null}
            </View>
            {confirmPassword.length > 0 && (
              <View style={styles.matchRow}>
                <Text style={[styles.matchIcon, { color: passwordsMatch ? '#10B981' : '#EF4444' }]}>{passwordsMatch ? '✓' : '✕'}</Text>
                <Text style={[styles.matchText, { color: passwordsMatch ? '#10B981' : '#EF4444' }]}>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Pressable style={[styles.submitButton, loading && { opacity: 0.7 }]} onPress={handleSetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#070A12" /> : (
                <>
                  <Text style={styles.submitButtonText}>Set Password & Continue</Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function CheckRow({ ok, text }) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkCircle, ok ? styles.checkCircleOk : styles.checkCircleOff]}>
        <Text style={[styles.checkMark, { color: ok ? '#10B981' : '#64748B' }]}>✓</Text>
      </View>
      <Text style={[styles.checkText, { color: ok ? '#10B981' : '#64748B' }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070A12' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: s(20), paddingBottom: 20, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, marginTop: 6 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  heroSection: { alignItems: 'center', marginTop: 12 },
  lockOuterCard: { width: 106, height: 106, borderRadius: 30, borderWidth: 1, borderColor: '#0F5257', backgroundColor: '#051E24', justifyContent: 'center', alignItems: 'center' },
  lockIconContainer: { width: 60, height: 60, borderRadius: 20, borderWidth: 1.5, borderColor: '#00F5D4', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B2B30' },
  lockIcon: { fontSize: 32 },
  textSection: { alignItems: 'center', marginTop: 8, marginBottom: 10 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '600', textAlign: 'center' },
  italicTitle: { fontStyle: 'italic', color: '#D4AF37', fontWeight: '400' },
  description: { color: '#94A3B8', textAlign: 'center', marginTop: 6, fontSize: 14, lineHeight: 20 },
  emailHighlight: { color: '#D4AF37', fontWeight: '700' },
  form: { width: '100%' },
  label: { color: '#64748B', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, backgroundColor: '#0F172A', paddingHorizontal: s(12), height: 52 },
  inputContainerSuccess: { borderColor: '#10B981' },
  inputContainerError: { borderColor: '#EF4444' },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  eyeIcon: { color: '#94A3B8', fontSize: 16 },
  successIcon: { color: '#10B981', fontSize: 18, fontWeight: 'bold' },
  strengthBarContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 6 },
  strengthSegment: { flex: 1, height: 3, backgroundColor: '#1E293B', borderRadius: 2, marginHorizontal: 2 },
  strengthLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  subtext: { color: '#64748B', fontSize: 12 },
  strengthText: { fontSize: 12, fontWeight: '600' },
  checklistCard: { backgroundColor: '#0B1120', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkCircle: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkCircleOk: { backgroundColor: '#064E3B' },
  checkCircleOff: { backgroundColor: '#1E293B' },
  checkMark: { fontSize: 11, fontWeight: 'bold' },
  checkText: { fontSize: 13 },
  matchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  matchIcon: { fontSize: 12, marginRight: 6 },
  matchText: { fontSize: 12 },
  footer: { marginTop: 20 },
  submitButton: { backgroundColor: '#D4AF37', width: '100%', height: 52, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  submitButtonText: { color: '#070A12', fontSize: 16, fontWeight: '700', marginRight: 8 },
  arrowIcon: { color: '#070A12', fontSize: 18, fontWeight: 'bold' },
});
