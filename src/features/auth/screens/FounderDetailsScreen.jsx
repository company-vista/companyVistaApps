import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  StatusBar,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { useAppDispatch } from '../../../store/hooks';
import { signupUser } from '../../../store/slices/authSlice';

const COUNTRIES = [
  { code: '+91', iso: 'IN', name: 'India' },
  { code: '+1', iso: 'US', name: 'United States' },
  { code: '+44', iso: 'GB', name: 'United Kingdom' },
  { code: '+971', iso: 'AE', name: 'UAE' },
  { code: '+65', iso: 'SG', name: 'Singapore' },
  { code: '+852', iso: 'HK', name: 'Hong Kong' },
  { code: '+372', iso: 'EE', name: 'Estonia' },
  { code: '+357', iso: 'CY', name: 'Cyprus' },
  { code: '+356', iso: 'MT', name: 'Malta' },
  { code: '+49', iso: 'DE', name: 'Germany' },
  { code: '+33', iso: 'FR', name: 'France' },
  { code: '+61', iso: 'AU', name: 'Australia' },
];

const FounderDetailsScreen = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { selectedStructure = 'LLC', selectedState = 'Delaware', companyName = '', selectedEnding = '' } = route.params || {};
  const displayCompanyName = companyName ? `${companyName} ${selectedEnding || selectedStructure}` : `Your Company ${selectedStructure}`;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [countryIso, setCountryIso] = useState('IN');
  const [phone, setPhone] = useState('');
  const [countryOfResidence, setCountryOfResidence] = useState('India');
  const [residenceIso, setResidenceIso] = useState('IN');
  const [isChecked, setIsChecked] = useState(false);
  const [showCodePicker, setShowCodePicker] = useState(false);
  const [showResidencePicker, setShowResidencePicker] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const summaryPrice = selectedStructure === 'LLC' ? '$299' : selectedStructure === 'C-Corp' ? '$399' : '$299';

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const lastVerifiedEmailRef = useRef('');

  // handle return from EmailVerification screen - preserve email even if screen remounted
  useEffect(() => {
    const verifiedEmail = route.params?.verifiedEmail;
    const isVerified = route.params?.emailVerified;
    if (verifiedEmail) {
      lastVerifiedEmailRef.current = verifiedEmail;
      // restore email if field became empty due to remount
      if (!email || email !== verifiedEmail) {
        setEmail(verifiedEmail);
      }
      if (isVerified) {
        setEmailVerified(true);
      }
      // clear param to avoid loop, keep other params (companyName etc)
      navigation.setParams({ emailVerified: undefined, verifiedEmail: undefined });
    }
  }, [route.params?.emailVerified, route.params?.verifiedEmail]);

  // reset verified only if user changes email after verification
  useEffect(() => {
    if (emailVerified && lastVerifiedEmailRef.current && email !== lastVerifiedEmailRef.current) {
      setEmailVerified(false);
    }
  }, [email]);

  const handleVerifyEmail = async () => {
    if (!isEmailValid) {
      Toast.show({ type: 'error', text1: 'Enter valid email' });
      return;
    }
    if (!fullName.trim()) {
      Toast.show({ type: 'error', text1: 'Enter full name first' });
      return;
    }
    setVerifyingEmail(true);
    try {
      // Backend currently only sends OTP via signup/step1 which creates a draft client
      // This is the ONLY working endpoint: POST https://api.companyvista.com/api/signup/step1
      // Ideal: POST /api/client/auth/send-email-otp (without creating client) - not yet implemented on backend
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || parts[0] || '';
      const result = await dispatch(
        signupUser({
          firstName,
          lastName,
          email: email.trim(),
          phoneNumber: phone.trim() || '0000000000',
          countryCode,
          companyName: displayCompanyName,
          registrationCountry: countryOfResidence,
        }),
      );
      if (signupUser.fulfilled.match(result)) {
        const { token, clientId } = result.payload;
        Toast.show({ type: 'success', text1: 'Verification code sent', text2: `Code sent to ${email}` });
        navigation.navigate('EmailVerification', {
          email: email.trim(),
          signupToken: token,
          signupClientId: clientId,
          companyName: displayCompanyName,
          companyLocation: `${selectedState} · ${selectedStructure}`,
          from: 'FounderDetails',
        });
      } else {
        const msg = result.payload?.errors?.email || result.payload?.message || 'Failed to send OTP';
        Toast.show({ type: 'error', text1: 'Failed to send code', text2: msg });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to send code', text2: e?.message || 'Network error' });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleRegisterCompany = async () => {
    // Agar email verified nahi hai to pehle OTP send / verification karwao (Verify button ka logic yahi shift ho gaya)
    if (!emailVerified) {
      await handleVerifyEmail();
      return;
    }
    // Client already created as draft on Verify (signup/step1). Register just confirms.
    // If backend later implements separate company-create endpoint, call it here instead.
    Toast.show({ type: 'success', text1: 'Company registered successfully!' });
    setTimeout(() => navigation.navigate('Login'), 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <Text style={styles.mainTitle}>
            Tell us about <Text style={styles.italicTitle}>you</Text>
          </Text>
          <Text style={styles.subtitle}>
            Details of the principal founder / member.
          </Text>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.usBadgeRow}>
                <Text style={styles.countryCodeBadge}>US</Text>
                <Text style={styles.summaryLabel}>Company</Text>
              </View>
              <Text style={styles.companyNameText}>
                {displayCompanyName}
              </Text>
            </View>
            <View style={styles.summaryRowBottom}>
              <Text style={styles.stateSubtitle}>{selectedState} · {selectedStructure}</Text>
              <Text style={styles.priceSummaryText}>{summaryPrice} + $90 state</Text>
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>
              FULL NAME <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Text style={styles.passportHint}>as per passport</Text>
          </View>
          <View style={styles.inputContainerActive}>
            <Ionicons name="person" size={16} color="#94A3B8" />
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              placeholderTextColor="#475569"
            />
          </View>
          <View style={styles.warningRow}>
            <Ionicons name="warning" size={12} color="#D97706" />
            <Text style={styles.warningText}>
              Must match passport exactly — appears on all state filings
            </Text>
          </View>

          {/* Email */}
          <Text style={styles.inputLabel}>
            EMAIL ADDRESS <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={emailVerified ? styles.successInputContainer : styles.inputContainerDefault}>
            <Ionicons name="mail" size={16} color={emailVerified ? '#10B981' : '#94A3B8'} />
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter email address"
              placeholderTextColor="#475569"
            />
            {emailVerified && <Ionicons name="checkmark-circle" size={16} color="#10B981" />}
          </View>

          {/* Verified status - Verify button hata diya gaya, ab Register Company button hi verification handle karega */}
          {emailVerified && (
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.verifiedText}>Email verified</Text>
              <TouchableOpacity onPress={() => setEmailVerified(false)}>
                <Text style={styles.changeEmailText}>Change</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Phone */}
          <Text style={styles.inputLabel}>
            PHONE NUMBER <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.phoneRow}>
            <TouchableOpacity style={styles.countryCodePicker} activeOpacity={0.8} onPress={() => setShowCodePicker(true)}>
              <Text style={styles.flagText}>{countryIso}</Text>
              <Text style={styles.codeText}>{countryCode}</Text>
              <Ionicons name="chevron-down" size={12} color="#64748B" />
            </TouchableOpacity>
            <View style={styles.phoneInputContainer}>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Phone number"
                placeholderTextColor="#475569"
              />
            </View>
          </View>
          <Text style={styles.helperText}>
            We'll send a verification code to this number
          </Text>

          {/* Country of Residence */}
          <Text style={styles.inputLabel}>
            COUNTRY OF RESIDENCE <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity style={styles.dropdownInputContainer} activeOpacity={0.8} onPress={() => setShowResidencePicker(true)}>
            <Text style={styles.flagText}>{residenceIso}</Text>
            <Text style={styles.dropdownValueText}>{countryOfResidence}</Text>
            <Ionicons name="chevron-down" size={12} color="#64748B" />
          </TouchableOpacity>
          <View style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
            <Text style={styles.successText}>
              Non-US residents can own 100% of a Delaware LLC
            </Text>
          </View>

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setIsChecked(!isChecked)}
          >
            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
              {isChecked && <Ionicons name="checkmark" size={11} color="#060913" />}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>, and confirm the
              above details are accurate.
            </Text>
          </TouchableOpacity>

        </Animated.View>

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            !(fullName.trim() && isEmailValid && phone.trim() && countryOfResidence && isChecked) && styles.primaryBtnDisabled,
            verifyingEmail && styles.primaryBtnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!(fullName.trim() && isEmailValid && phone.trim() && countryOfResidence && isChecked) || verifyingEmail}
          onPress={handleRegisterCompany}
        >
          {verifyingEmail ? (
            <ActivityIndicator size="small" color="#060913" />
          ) : (
            <Text style={styles.primaryBtnText}>{emailVerified ? '+  Register Company' : 'Continue to Verify Email->'}</Text>
          )}
        </TouchableOpacity>
        {!emailVerified && email.length > 0 && !isEmailValid && (
          <Text style={styles.verifyWarning}>Enter a valid email to continue</Text>
        )}

        <Text style={styles.footerSubtext}>
          No payment required now · <Text style={styles.goldText}>Invoice auto-generated</Text>
        </Text>

        <View style={styles.loginRow}>
          <Text style={styles.loginHint}>Already have an account? </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Code Picker Modal */}
      <Modal visible={showCodePicker} transparent animationType="fade" onRequestClose={() => setShowCodePicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCodePicker(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setShowCodePicker(false)}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.iso}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryOption, countryCode === item.code && styles.countryOptionSelected]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setCountryIso(item.iso);
                    setShowCodePicker(false);
                  }}
                >
                  <Text style={styles.flagText}>{item.iso}</Text>
                  <Text style={styles.countryOptionName}>{item.name}</Text>
                  <Text style={styles.countryOptionCode}>{item.code}</Text>
                  {countryCode === item.code && <Ionicons name="checkmark" size={16} color="#C9A84C" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Country of Residence Picker Modal */}
      <Modal visible={showResidencePicker} transparent animationType="fade" onRequestClose={() => setShowResidencePicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowResidencePicker(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country of Residence</Text>
              <TouchableOpacity onPress={() => setShowResidencePicker(false)}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.iso}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryOption, countryOfResidence === item.name && styles.countryOptionSelected]}
                  onPress={() => {
                    setCountryOfResidence(item.name);
                    setResidenceIso(item.iso);
                    setShowResidencePicker(false);
                  }}
                >
                  <Text style={styles.flagText}>{item.iso}</Text>
                  <Text style={styles.countryOptionName}>{item.name}</Text>
                  {countryOfResidence === item.name && <Ionicons name="checkmark" size={16} color="#C9A84C" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default FounderDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060913' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 34 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  mainTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '500', lineHeight: 34, marginBottom: 6 },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  subtitle: { color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: 16 },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', padding: 14, marginBottom: 20,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  usBadgeRow: { flexDirection: 'row', alignItems: 'center' },
  countryCodeBadge: { color: '#64748B', fontSize: 11, fontWeight: 'bold', marginRight: 6 },
  summaryLabel: { color: '#64748B', fontSize: 11 },
  companyNameText: { color: '#C9A84C', fontSize: 12, fontWeight: 'bold' },
  summaryRowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stateSubtitle: { color: '#64748B', fontSize: 11 },
  priceSummaryText: { color: '#C9A84C', fontSize: 12, fontWeight: 'bold' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 6 },
  inputLabel: { color: '#64748B', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.2, marginTop: 6, marginBottom: 6 },
  requiredAsterisk: { color: '#EF4444' },
  passportHint: { color: '#64748B', fontSize: 10 },
  inputContainerActive: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 12,
    borderWidth: 1, borderColor: '#C9A84C', paddingHorizontal: 14, height: 48,
  },
  inputContainerDefault: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 14, height: 48,
  },
  successInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.06)', borderRadius: 12,
    borderWidth: 1, borderColor: '#10B981', paddingHorizontal: 14, height: 48,
  },
  verifyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 8, marginBottom: 12,
  },
  verifyHint: { color: '#64748B', fontSize: 10, flex: 1, marginRight: 10 },
  verifyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#C9A84C', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: '#C9A84C',
  },
  verifyBtnDisabled: { backgroundColor: 'rgba(201,168,76,0.35)', borderColor: 'rgba(201,168,76,0.35)', opacity: 0.7 },
  verifyBtnText: { color: '#060913', fontSize: 12, fontWeight: '700' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 12 },
  verifiedText: { color: '#10B981', fontSize: 10, fontWeight: '600', flex: 1 },
  changeEmailText: { color: '#C9A84C', fontSize: 10, fontWeight: '700', textDecorationLine: 'underline' },
  verifyWarning: { color: '#D97706', fontSize: 10, textAlign: 'center', marginBottom: 10, marginTop: -4 },
  dropdownInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14, height: 48,
  },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '500', marginLeft: 10 },
  warningRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 12, gap: 6 },
  warningText: { color: '#D97706', fontSize: 10 },
  helperText: { color: '#64748B', fontSize: 10, marginTop: 6, marginBottom: 12 },
  successRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 16, gap: 6 },
  successText: { color: '#10B981', fontSize: 10 },
  phoneRow: { flexDirection: 'row', gap: 10 },
  countryCodePicker: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12, height: 48, gap: 6,
  },
  flagText: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
  codeText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  phoneInputContainer: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14, height: 48, justifyContent: 'center',
  },
  dropdownValueText: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4, marginBottom: 20 },
  checkbox: {
    width: 18, height: 18, borderRadius: 5, backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkboxChecked: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  checkboxText: { flex: 1, color: '#64748B', fontSize: 10, lineHeight: 15 },
  linkText: { color: '#C9A84C', fontWeight: 'bold' },
  primaryBtn: {
    backgroundColor: '#D4AF37', borderRadius: 24, paddingVertical: 14,
    alignItems: 'center', marginBottom: 12,
  },
  primaryBtnDisabled: { backgroundColor: 'rgba(212, 175, 55, 0.3)' },
  primaryBtnText: { color: '#060913', fontSize: 15, fontWeight: 'bold' },
  footerSubtext: { color: '#64748B', fontSize: 10, textAlign: 'center' },
  goldText: { color: '#C9A84C' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 4 },
  loginHint: { color: '#94A3B8', fontSize: 12 },
  loginLink: { color: '#C9A84C', fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  modalTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  countryOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  countryOptionSelected: { backgroundColor: 'rgba(201,168,76,0.08)' },
  countryOptionName: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  countryOptionCode: { color: '#94A3B8', fontSize: 12, marginRight: 6 },
});
