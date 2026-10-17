import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { signupUser, setPendingOrderData } from '../../../store/slices/authSlice';
import { fetchClientProfile } from '../../profile/api/clientProfileDetailsApi';
import { s } from '../../../theme/responsive';
import { getCountryData } from '../../../constants/countries';
import { useThemeColors } from '../../../theme/colors';

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
  // Add-Company flow me user pehle se login hai. Uska email already verified hai
  // aur password set hai, is liye EmailVerification + SetNewPassword screens
  // RegistrationStack me hamesha skip karne padte hain — warna unregistered
  // route par navigation fail ho jayegi.
  const isAuthenticated = useAppSelector(s => s?.auth?.isAuthenticated);
  const sessionToken = useAppSelector(s => s?.auth?.token);
  const authUser = useAppSelector(s => s?.auth?.user);
  const { selectedStructure = 'LLC', selectedState = 'Delaware', companyName = '', selectedEnding = '', selectedCountry: jurisdictionCountry, bestState } = route.params || {};
  // Jurisdiction ka asli country — yahi US vs non-US decide karta hai.
  // NOTE: bestState advisor US flow me aata hai, par StructureSelection ne
  // non-US flow me bhi bestState='Delaware' forward kar diya tha, isliye
  // bestState ko akela US ka signal nahi maan sakte. Advisor flow me country
  // sirf bestCountry/bestCountryName me bhi aa sakta hai.
  const rawCountry = jurisdictionCountry || route.params?.selectedCountry || route.params?.bestCountry || '';
  const jurisdictionCode = String(rawCountry || '').toUpperCase();
  const bestCountryName = route.params?.bestCountryName || '';
  const isUSFounder = jurisdictionCode === 'US'
    || (!jurisdictionCode && (!bestCountryName || bestCountryName === 'United States'));
  const jurisdictionCountryName = jurisdictionCode
    ? (getCountryData(jurisdictionCode)?.name
      || { US: 'USA', GB: 'UK', AE: 'UAE', SG: 'Singapore', EE: 'Estonia', HK: 'Hong Kong', CY: 'Cyprus', MT: 'Malta' }[jurisdictionCode]
      || bestCountryName
      || rawCountry)
    : (bestCountryName || null);
  const displayJurisdictionCountry = isUSFounder
    ? 'USA'
    : (jurisdictionCountryName || bestCountryName || rawCountry || 'USA');
  // ownership note dynamic: US me state name (advisor me bestState), non-US me country name
  const ownershipJurisdiction = isUSFounder
    ? (bestState || selectedState || 'a US')
    : (route.params?.bestCountryName || jurisdictionCountryName || displayJurisdictionCountry);
  const ownershipNote = isUSFounder
    ? `Non-US residents can own 100% of ${String(ownershipJurisdiction).startsWith('a ') ? ownershipJurisdiction : `a ${ownershipJurisdiction}`} LLC`
    : `Foreign-owned ${ownershipJurisdiction} companies are allowed · a local director may be required`;

  const displayCompanyName = (() => {
    const suffix = selectedEnding || selectedStructure;
    if (!isUSFounder) return companyName || 'Your Company';
    return companyName ? `${companyName} ${suffix}`.trim() : `Your Company ${suffix}`;
  })();
  const [fullName, setFullName] = useState(() => {
    if (isAuthenticated && authUser) return [authUser.firstName, authUser.lastName].filter(Boolean).join(' ').trim();
    return '';
  });
  const [email, setEmail] = useState(() => (isAuthenticated && authUser?.email ? authUser.email : ''));
  const [countryCode, setCountryCode] = useState(() => (isAuthenticated && authUser?.countryCode ? authUser.countryCode : ''));
  const [countryIso, setCountryIso] = useState(() => (isAuthenticated ? (authUser?.countryIso || authUser?.iso || '') : ''));
  const [phone, setPhone] = useState(() => (isAuthenticated ? (authUser?.phone || authUser?.phoneNumber || authUser?.mobile || '') : ''));
  const [countryOfResidence, setCountryOfResidence] = useState(() => (isAuthenticated ? (authUser?.country || authUser?.countryOfResidence || '') : ''));
  const [residenceIso, setResidenceIso] = useState(() => (isAuthenticated ? (authUser?.countryIso || '') : ''));
  const [isChecked, setIsChecked] = useState(false);
  const [showCodePicker, setShowCodePicker] = useState(false);
  const [showResidencePicker, setShowResidencePicker] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [isAutoContinuing, setIsAutoContinuing] = useState(false);
  const autoContinueRef = useRef(false);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // NOTE: useNativeDriver MUST stay false here. On Android + New Architecture
    // a native-driver `translateY` transform is applied directly to the native
    // view and never committed to the shadow tree, so touch hit-testing uses a
    // stale position and children's onPress never fires (react-native#36504).
    // That made the country-code / country-of-residence pickers unresponsive.
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start();
  }, []);

  // Frontend me price calculate nahi karna — backend computeOrderTotal karega
  // Sirf raw selections (selectedAddOns etc.) backend bhejenge, total backend se aayega

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // TESTING: true karo to email verify + SetNewPassword skip ho jayega (signup ke baad direct Register)
  const SKIP_VERIFY_FOR_TESTING = false;

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

  // Existing client (Add Company) ke liye form HAMESHA skip hota hai — email hi
  // criterion hai. Login ke waqt phone/countryCode store me missing ho sakte hain
  // (login response me hamesha nahi aate), to backend GET profile se fetch
  // karke fill karte hain, phir auto-submit Review par.
  // IMPORTANT: agar client Review se wapas (back/Edit) aaya ho — params me
  // `from: 'FounderDetails'` hota hai — to form dikhaya jaata hai taaki wo edit
  // kar sake. Sirf fresh wizard entry par auto-skip hota hai.
  useEffect(() => {
    if (!isAuthenticated || autoContinueRef.current) return;
    if (route.params?.from === 'FounderDetails') return;
    const hasEmail = !!(email.trim() || authUser?.email);
    if (!hasEmail) return;
    autoContinueRef.current = true;
    setIsAutoContinuing(true);
    const run = async () => {
      try {
        await handleVerifyEmail();
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Failed to load profile', text2: e?.message || 'Please fill the form manually' });
      } finally {
        setIsAutoContinuing(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerifyEmail = async () => {
    // Add-Company flow me login response me phone/countryCode na ho to backend
    // profile se uthao — wo hamesha current saved values deta hai.
    let profileUser = null;
    const phoneMissing = !phone.trim();
    const codeMissing = !countryCode.trim();
    const residenceMissing = !countryOfResidence.trim();
    if (isAuthenticated && sessionToken && (phoneMissing || codeMissing || residenceMissing)) {
      const profileRes = await fetchClientProfile(sessionToken);
      if (profileRes?.isSuccess && profileRes?.user) {
        profileUser = profileRes.user;
      }
    }
    const effPhone = (profileUser?.phone || profileUser?.phoneNumber || profileUser?.mobile || phone || '').trim();
    const effCountryCode = profileUser?.countryCode || countryCode || '';
    const effCountryIso = profileUser?.countryIso || countryIso || (profileUser?.countryCode ? profileUser.countryCode.replace(/[^A-Za-z]/g, '').toUpperCase() : '');
    const effResidence = profileUser?.country || profileUser?.countryOfResidence || countryOfResidence || '';
    const effFullName = [profileUser?.firstName, profileUser?.lastName].filter(Boolean).join(' ')?.trim() || fullName.trim();
    const effEmail = (profileUser?.email || email).trim().toLowerCase();
    if (SKIP_VERIFY_FOR_TESTING) {
      lastVerifiedEmailRef.current = effEmail;
      setEmailVerified(true);
      Toast.show({ type: 'success', text1: 'Skipped verification (testing)' });
      return;
    }
    if (!isEmailValid && !effEmail) {
      Toast.show({ type: 'error', text1: 'Enter valid email' });
      return;
    }
    if (!effFullName) {
      Toast.show({ type: 'error', text1: 'Enter full name first' });
      return;
    }
    setVerifyingEmail(true);
    try {
      // New company signup: POST /api/company-signup -> createCompanySignup (replaces old POST /api/signup/step1)
      // Creates Client (pending) + Company (pending) + Quote (awaiting_quote if quoted pricing)
      // Portal payload exact — backend computeOrderTotal ke liye raw data, frontend calculate nahi karega
      const parts = effFullName.split(/\s+/);
      const firstName = parts[0] || '';
      const rest = parts.slice(1);
      const lastName = rest.join(' ') || firstName;
      const trimmedPhone = effPhone;
      const countryCodeObj = { code: effCountryCode || '+91', iso: effCountryIso || '' };
      const residence = effResidence || '';
      const isUSA = isUSFounder;
      const legalEnding = selectedEnding || selectedStructure || '';
      const usState = { name: route.params?.bestState || selectedState || '', timeframe: route.params?.bestStateTimeframe || '' };
      const country = { name: route.params?.selectedCountry || route.params?.bestCountry || route.params?.bestCountryName || '' };
      const structure = { id: selectedStructure || route.params?.selectedStructure || '' };
      const statePrice = route.params?.bestStatePrice ?? route.params?.selectedStatePrice ?? 0;
      // LLC structure price sirf USA me add hota hai. Quoted/custom country ho ya
      // non-US fixed (GB/SG/EE/AE) — structure price 0 hi bhejo, warna company me
      // $299 structure + $299 state (registrationRequestData) leak ho jata hai.
      const structurePrice = isUSA ? (route.params?.selectedStructurePrice ?? 299) : 0;
      const residentialAddress = route.params?.residentialAddress || route.params?.addressLine1 || residence || '';
      const signupPayload = {
        firstName,
        lastName,
        fullName: effFullName,
        email: effEmail,
        phone: trimmedPhone,
        phoneNumber: trimmedPhone,
        countryCode: countryCodeObj.code,
        countryIso: countryCodeObj.iso,
        countryOfResidence: residence.trim(),
        residence: residence.trim(),
        dateOfBirth: route.params?.dateOfBirth || '',
        companyName: `${(companyName || '').trim()} ${isUSA ? legalEnding : ''}`.trim() || displayCompanyName.trim(),
        rawCompanyName: (companyName || '').trim() || displayCompanyName.trim(),
        selectedEnding: isUSA ? legalEnding : '',
        selectedStructure: structure?.id || '',
        selectedState: isUSA ? (usState?.name || '') : '',
        selectedCountry: country?.name || '',
        selectedCountryPrice: route.params?.selectedCountryPrice ?? 0,
        selectedStatePrice: route.params?.selectedStatePrice ?? 0,
        bestCountryPrice: route.params?.bestCountryPrice ?? 0,
        bestState: isUSA ? (usState?.name || '') : '',
        bestStatePrice: statePrice,
        bestStateTimeframe: isUSA ? (usState?.timeframe || '') : '',
        selectedStructurePrice: structurePrice,
        selectedAddOns: route.params?.selectedAddOns || {},
        addOnsTotal: route.params?.addOnsTotal ?? 0,
        runningTotal: route.params?.runningTotal ?? 0,
        address: { addressLine1: residentialAddress.trim(), country: residence.trim() },
        registrationCountry: country?.name || '',
        purpose: route.params?.purpose || route.params?.industry || '',
        priorities: route.params?.priorities || route.params?.advisorPriorities || [],
        dayOneNeeds: route.params?.dayOneNeeds || route.params?.advisorNeeds || [],
        customerLocation: route.params?.customerLocation || route.params?.advisorRegion || '',
        expectedRevenue: route.params?.expectedRevenue || route.params?.revenueBand || '',
        businessDescription: (route.params?.businessDescription || '').trim(),
        advisorFlow: !!route.params?.advisorFlow,
        // Live session token. Backend ka protectClient Bearer token padhta hai;
        // iske bina req.client undefined hota hai aur verified email par 409
        // aata hai — yani dobara company banane ke liye signup flow chalta hai.
        // Signup response ka token yahan use NAHI hota (wo naya client ke liye
        // hota hai, hum to logged-in client hain).
        authToken: sessionToken || undefined,
      };
      // ── Already logged in (Add Company flow) ────────────────────────────
      // Backend save yahan NAHI hota — ReviewAndConfirm ke "Your Order" /
      // "Continue" click par signupUser call kiya jaata hai (handleConfirm me
      // `signupPayload` se hai). Isse Review -> back -> CompanyNaming -> aage
      // karne par har baar nayi company backend me nahi ban jaati (pehle
      // FounderDetails auto-skip har mount par signupUser fire karta tha,
      // duplicate companies create ho jaati thin).
      if (isAuthenticated) {
        const reviewParams = {
          ...(route.params || {}),
          email: effEmail,
          companyName: displayCompanyName,
          companyLocation: `${selectedState} · ${selectedStructure}`,
          from: 'FounderDetails',
          selectedStructure,
          selectedState,
          selectedEnding,
          selectedCountry: route.params?.selectedCountry || effResidence,
          selectedAddOns: route.params?.selectedAddOns,
          addOnsTotal: route.params?.addOnsTotal ?? 0,
          runningTotal: route.params?.runningTotal ?? 0,
          fullName: effFullName,
          phone: trimmedPhone,
          countryOfResidence: effResidence,
          countryCode: effCountryCode,
          advisorFlow: !!route.params?.advisorFlow,
          token: sessionToken || undefined,
          signupPayload,
          signupDeferred: true,
        };
        // isAddCompanyFlow poore wizard me spread hota hai (har screen
        // `...route.params` aage bhejti hai). Iske bina Status aur
        // VerifyIdentity ko pata hi nahi chalega ki wo modal ke andar
        // hain, aur flow payment ke baad usi screen pe atak jayega —
        // modal kabhi band nahi hota.
        const addCompanyParams = { ...reviewParams, isAddCompanyFlow: true };
        dispatch(setPendingOrderData(addCompanyParams));
        Toast.show({ type: 'success', text1: 'Review your details', text2: 'Tap Your Order to save the company' });
        navigation.replace('ReviewAndConfirm', addCompanyParams);
        return;
      }
      const result = await dispatch(signupUser(signupPayload));
      if (signupUser.fulfilled.match(result)) {
        const { token, clientId, companyId, pricingType, totalAmount } = result.payload;
        Toast.show({ type: 'success', text1: 'Verification code sent', text2: `Code sent to ${effEmail}${companyId ? ` · ${pricingType || ''} $${totalAmount ?? ''}` : ''}` });
        navigation.navigate('EmailVerification', {
          ...(route.params || {}),
          email: effEmail,
          signupToken: token,
          signupClientId: clientId,
          companyId,
          totalAmount,
          pricingType,
          companyName: displayCompanyName,
          companyLocation: `${selectedState} · ${selectedStructure}`,
          from: 'FounderDetails',
          selectedStructure,
          selectedState,
          selectedEnding,
          selectedCountry: route.params?.selectedCountry || effResidence,
          selectedAddOns: route.params?.selectedAddOns,
          fullName: effFullName,
          phone: trimmedPhone,
          countryOfResidence: effResidence,
          countryCode: effCountryCode,
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
    // Testing: skip verify -> direct next page (ReviewAndConfirm) after Verify
    if (SKIP_VERIFY_FOR_TESTING && !emailVerified) {
      await handleVerifyEmail();
      // after verify, auto-open next page (SetNewPassword ke baad wala ReviewAndConfirm)
      const nextParams = {
        ...(route.params || {}),
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        countryOfResidence,
        countryCode,
      };
      Toast.show({ type: 'success', text1: 'Skipped verify & password (testing)' });
      setTimeout(() => navigation.navigate('ReviewAndConfirm', nextParams), 500);
      return;
    }
    if (!emailVerified) {
      await handleVerifyEmail();
      return;
    }
    Toast.show({ type: 'success', text1: 'Company registered successfully!' });
    // Add-Company flow: login pehle se hai, is liye Login screen par bhejne
    // ka koi matlab nahi (wo route iss stack me hai hi nahi). Wapas Home.
    if (isAuthenticated) {
      setTimeout(() => navigation.navigate('Home'), 800);
      return;
    }
    setTimeout(() => navigation.navigate('Login'), 800);
  };

  if (isAutoContinuing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} transparent backgroundColor="transparent" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={{ color: colors.muted, marginTop: 12, fontSize: 14 }}>Using your saved profile — setting up your company…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} transparent backgroundColor="transparent" />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: s(32) + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Tell us about <Text style={styles.italicTitle}>you</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Details of the principal founder / member.
          </Text>

          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}>
            <View style={styles.summaryField}>
              <Text style={[styles.summaryFieldLabel, { color: colors.muted }]}>COMPANY NAME</Text>
              <Text style={styles.companyNameText} numberOfLines={1}>{displayCompanyName}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]} />
            <View style={styles.summaryRowBottom}>
              <View style={styles.summaryFieldHalf}>
                <Text style={[styles.summaryFieldLabel, { color: colors.muted }]}>JURISDICTION</Text>
                <Text style={[styles.stateSubtitle, { color: colors.muted }]}>{isUSFounder ? `${bestState || selectedState} · ${selectedStructure}` : (displayJurisdictionCountry || jurisdictionCountry || route.params?.selectedCountry || '—')}</Text>
              </View>
              <View style={styles.summaryFieldHalf}>
                <Text style={[styles.summaryFieldLabel, { color: colors.muted }]}>COUNTRY</Text>
                <Text style={[styles.stateSubtitle, { color: colors.muted }]}>{displayJurisdictionCountry}</Text>
              </View>
              {/* TOTAL frontend me calculate nahi karna — backend se aayega */}
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.labelRow}>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>
              FULL NAME <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Text style={[styles.passportHint, { color: colors.muted }]}>as per passport</Text>
          </View>
          <View style={[styles.inputContainerActive, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.inputBackground }]}>
            <Ionicons name="person" size={16} color={colors.muted} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              placeholderTextColor={colors.subtle}
            />
          </View>
          <View style={styles.warningRow}>
            <Ionicons name="warning" size={12} color="#D97706" />
            <Text style={styles.warningText}>
              Must match passport exactly — appears on all state filings
            </Text>
          </View>

          {/* Email */}
          <Text style={[styles.inputLabel, { color: colors.muted }]}>
            EMAIL ADDRESS <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={emailVerified ? styles.successInputContainer : [styles.inputContainerDefault, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.inputBackground, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.inputBorder }]}>
            <Ionicons name="mail" size={16} color={emailVerified ? '#10B981' : colors.muted} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter email address"
              placeholderTextColor={colors.subtle}
            />
            {emailVerified && <Ionicons name="checkmark-circle" size={16} color="#10B981" />}
          </View>

          {/* Verified status */}
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
          <Text style={[styles.inputLabel, { color: colors.muted }]}>
            PHONE NUMBER <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.phoneRow}>
            <TouchableOpacity style={[styles.countryCodePicker, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.inputBackground, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.inputBorder }]} activeOpacity={0.8} onPress={() => setShowCodePicker(true)}>
              {countryIso ? <Text style={[styles.flagText, { color: colors.subtle }]}>{countryIso}</Text> : null}
              <Text style={[styles.codeText, { color: colors.text }, !countryCode && { color: colors.subtle }]}>{countryCode || 'Select'}</Text>
              <Ionicons name="chevron-down" size={12} color={colors.subtle} />
            </TouchableOpacity>
            <View style={[styles.phoneInputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.inputBackground, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.inputBorder }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Phone number"
                placeholderTextColor={colors.subtle}
              />
            </View>
          </View>
          <Text style={[styles.helperText, { color: colors.subtle }]}>
            We'll send a verification code to this number
          </Text>

          {/* Country of Residence */}
          <Text style={[styles.inputLabel, { color: colors.muted }]}>
            COUNTRY OF RESIDENCE <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity style={[styles.dropdownInputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.inputBackground, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.inputBorder }]} activeOpacity={0.8} onPress={() => setShowResidencePicker(true)}>
            {residenceIso ? <Text style={[styles.flagText, { color: colors.subtle }]}>{residenceIso}</Text> : null}
            <Text style={[styles.dropdownValueText, { color: colors.text }, !countryOfResidence && { color: colors.subtle }]}>{countryOfResidence || 'Select'}</Text>
            <Ionicons name="chevron-down" size={12} color={colors.subtle} />
          </TouchableOpacity>
          <View style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
            <Text style={styles.successText}>
              {ownershipNote}
            </Text>
          </View>

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setIsChecked(!isChecked)}
          >
            <View style={[styles.checkbox, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.surfaceAlt, borderColor: isDark ? 'rgba(255,255,255,0.2)' : colors.border }, isChecked && styles.checkboxChecked]}>
              {isChecked && <Ionicons name="checkmark" size={11} color={isDark ? '#060913' : '#FFFFFF'} />}
            </View>
            <Text style={[styles.checkboxText, { color: colors.muted }]}>
              I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>, and confirm the
              above details are accurate.
            </Text>
          </TouchableOpacity>

        </Animated.View>

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { backgroundColor: colors.buttonBackground },
            !(fullName.trim() && isEmailValid && phone.trim() && countryCode && countryOfResidence && isChecked) && styles.primaryBtnDisabled,
            verifyingEmail && styles.primaryBtnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!(fullName.trim() && isEmailValid && phone.trim() && countryCode && countryOfResidence && isChecked) || verifyingEmail}
          onPress={handleRegisterCompany}
        >
          {verifyingEmail ? (
            <ActivityIndicator size="small" color={colors.buttonText} />
          ) : (
            <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>{emailVerified ? '+  Register Company' : 'Submit->'}</Text>
          )}
        </TouchableOpacity>
        {!emailVerified && email.length > 0 && !isEmailValid && (
          <Text style={styles.verifyWarning}>Enter a valid email to continue</Text>
        )}

        <Text style={[styles.footerSubtext, { color: colors.subtle }]}>
          No payment required now · <Text style={styles.goldText}>Invoice auto-generated</Text>
        </Text>

        {/* Logged-out users ke liye hi. Add-Company flow me user pehle se login
            hai — "Log in" link confuse karta tha aur Login route iss stack me
            registered bhi nahi hai. */}
        {!isAuthenticated && (
          <View style={styles.loginRow}>
            <Text style={[styles.loginHint, { color: colors.muted }]}>Already have an account? </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Country Code Picker Modal */}
      <Modal visible={showCodePicker} transparent animationType="fade" onRequestClose={() => setShowCodePicker(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowCodePicker(false)} />
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setShowCodePicker(false)}>
                <Ionicons name="close" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.iso}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryOption, { borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }, countryCode === item.code && styles.countryOptionSelected]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setCountryIso(item.iso);
                    setShowCodePicker(false);
                  }}
                >
                  <Text style={[styles.flagText, { color: colors.subtle }]}>{item.iso}</Text>
                  <Text style={[styles.countryOptionName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.countryOptionCode, { color: colors.muted }]}>{item.code}</Text>
                  {countryCode === item.code && <Ionicons name="checkmark" size={16} color="#C9A84C" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Country of Residence Picker Modal */}
      <Modal visible={showResidencePicker} transparent animationType="fade" onRequestClose={() => setShowResidencePicker(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowResidencePicker(false)} />
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country of Residence</Text>
              <TouchableOpacity onPress={() => setShowResidencePicker(false)}>
                <Ionicons name="close" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.iso}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryOption, { borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }, countryOfResidence === item.name && styles.countryOptionSelected]}
                  onPress={() => {
                    setCountryOfResidence(item.name);
                    setResidenceIso(item.iso);
                    setShowResidencePicker(false);
                  }}
                >
                  <Text style={[styles.flagText, { color: colors.subtle }]}>{item.iso}</Text>
                  <Text style={[styles.countryOptionName, { color: colors.text }]}>{item.name}</Text>
                  {countryOfResidence === item.name && <Ionicons name="checkmark" size={16} color="#C9A84C" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FounderDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(24) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(16), marginTop: s(34) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  mainTitle: { fontSize: 20, fontWeight: '500', lineHeight: 34, marginBottom: s(6) },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  subtitle: { fontSize: 12, lineHeight: 18, marginBottom: s(16) },
  summaryCard: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: s(16),
    borderWidth: 1, padding: s(18), marginBottom: s(20), minHeight: 105,
  },
  summaryField: { marginBottom: s(8) },
  summaryFieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: s(4) },
  summaryDivider: { height: 1, marginVertical: s(8) },
  summaryFieldHalf: { flex: 1 },
  companyNameText: { color: '#C9A84C', fontSize: 16, fontWeight: 'bold' },
  summaryRowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: s(12) },
  stateSubtitle: { fontSize: s(15), fontWeight: '600' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: s(14), marginBottom: s(8) },
  inputLabel: { fontSize: s(11), fontWeight: 'bold', letterSpacing: 1.2, marginTop: s(14), marginBottom: s(8) },
  requiredAsterisk: { color: '#EF4444' },
  passportHint: { fontSize: 10 },
  inputContainerActive: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1, borderColor: '#C9A84C', paddingHorizontal: s(14), height: 48,
  },
  inputContainerDefault: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1, paddingHorizontal: s(14), height: 48,
  },
  successInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.06)', borderRadius: 12,
    borderWidth: 1, borderColor: '#10B981', paddingHorizontal: s(14), height: 48,
  },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: s(8), marginBottom: s(12) },
  verifiedText: { color: '#10B981', fontSize: 10, fontWeight: '600', flex: 1 },
  changeEmailText: { color: '#C9A84C', fontSize: 10, fontWeight: '700', textDecorationLine: 'underline' },
  verifyWarning: { color: '#D97706', fontSize: 10, textAlign: 'center', marginBottom: s(10), marginTop: -4 },
  dropdownInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: s(14), height: 48,
  },
  textInput: { flex: 1, fontSize: 13, fontWeight: '500', marginLeft: s(10) },
  warningRow: { flexDirection: 'row', alignItems: 'center', marginTop: s(8), marginBottom: s(16), gap: s(6) },
  warningText: { color: '#D97706', fontSize: 10 },
  helperText: { fontSize: s(10), marginTop: s(8), marginBottom: s(16) },
  successRow: { flexDirection: 'row', alignItems: 'center', marginTop: s(8), marginBottom: s(18), gap: s(6) },
  successText: { color: '#10B981', fontSize: s(12) },
  phoneRow: { flexDirection: 'row', gap: 10 },
  countryCodePicker: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: s(12), height: 48, gap: 6,
  },
  flagText: { fontSize: 10, fontWeight: 'bold' },
  codeText: { fontSize: 13, fontWeight: 'bold' },
  phoneInputContainer: {
    flex: 1, borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: s(14), height: 48, justifyContent: 'center',
  },
  dropdownValueText: { flex: 1, fontSize: 13, fontWeight: '500' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: s(4), marginBottom: s(20) },
  checkbox: {
    width: 18, height: 18, borderRadius: 5,
    alignItems: 'center', justifyContent: 'center', marginRight: s(10), marginTop: s(2),
    borderWidth: 1,
  },
  checkboxChecked: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  checkboxText: { flex: 1, fontSize: 10, lineHeight: 15 },
  linkText: { color: '#C9A84C', fontWeight: 'bold' },
  primaryBtn: {
    borderRadius: 24, paddingVertical: s(14),
    alignItems: 'center', marginBottom: s(12),
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { fontSize: 15, fontWeight: 'bold' },
  footerSubtext: { fontSize: 11, textAlign: 'center' },
  goldText: { color: '#C9A84C' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: s(16), marginBottom: s(4) },
  loginHint: { fontSize: 14 },
  loginLink: { color: '#C9A84C', fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: s(20), borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: s(16), borderBottomWidth: 1 },
  modalTitle: { fontSize: 14, fontWeight: 'bold' },
  countryOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: s(16), paddingVertical: s(14), gap: 10, borderBottomWidth: 1 },
  countryOptionSelected: { backgroundColor: 'rgba(201,168,76,0.08)' },
  countryOptionName: { flex: 1, fontSize: 13 },
  countryOptionCode: { fontSize: 12, marginRight: s(6) },
});
