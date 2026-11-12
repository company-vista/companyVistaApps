import { font } from '../../../theme/typography';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import {
  Check,
  Camera,
  FileText,
  CreditCard,
  ShieldCheck,
} from 'lucide-react-native';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setAuthSession, setHasCompletedPayment, setPendingCloseAddCompany } from '../../../store/slices/authSlice';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { s } from '../../../theme/responsive';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { themePalette, makeThemeStyles } from '../../../theme/colors';

const DocUploadButton = ({ filled, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.uploadBtn, filled && styles.uploadBtnFilled]}
  >
    {filled ? <Check color={themePalette.hex_10b981} size={14} /> : <Camera color={themePalette.hex_eab308} size={14} />}
    <Text style={[styles.uploadBtnText, filled && styles.uploadBtnTextFilled]}>
      {filled ? 'Change' : 'Upload'}
    </Text>
  </TouchableOpacity>
);

const VerifyIdentityScreen = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(s => s.auth.user);
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const authToken = useAppSelector(s => s.auth.token);
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  // Add Company flow: RegistrationStack ye screens apne params me aage nahi
  // bhejta, to origin ka asli pata yahi hai ki hum modal ke andar hain ya nahi.
  // FounderDetails → ReviewAndConfirm → CompletePayment → Status →
  // Shareholders → VerifyIdentity, har screen pe params spread hota hai, is liye
  // ye flag poore chain me survive karta hai.
  const isAddCompanyFlow = route?.params?.isAddCompanyFlow === true;
  const authName = authUser?.name || [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ').trim() || route?.params?.fullName || 'Rajesh Kumar Sharma';
  const initials = authName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0,2).toUpperCase() || 'RS';
  const shareholders = route?.params?.shareholders || [];
  const companyId = route?.params?.companyId || pendingOrder?.companyId || '';
  const token = route?.params?.token || authToken || pendingOrder?.token || '';
  // clientId: prefer founder clientId (pendingOrder/authUser) else first shareholder's clientId
  const primaryShareholderForId = shareholders.find(s => s.clientId) || null;
  const clientId = route?.params?.clientId || pendingOrder?.clientId || authUser?._id || authUser?.id || primaryShareholderForId?.clientId || '';
  // founder ka percentage ShareholdersScreen se aata hai (ownership '60%' ya sharePercentage)
  const founderShareholder = primaryShareholderForId || shareholders[0] || null;
  const sharePercentNum = parseInt(String(founderShareholder?.ownership ?? founderShareholder?.sharePercentage ?? '').replace('%', ''), 10);
  const founderRoleText = String(founderShareholder?.role || founderShareholder?.designation || '').trim();
  const userRoleText = [sharePercentNum > 0 ? `${sharePercentNum}% owner` : '', founderRoleText || 'Managing Member'].filter(Boolean).join(' · ');

  const handleContinue = () => {
    const token = route?.params?.signupToken || route?.params?.token || pendingOrder?.token || authToken || '';
    const clientId = route?.params?.clientId || route?.params?.signupClientId || pendingOrder?.clientId || pendingOrder?.orderId || '';
    const emailForSession = route?.params?.email || route?.params?.userEmail || authUser?.email || '';
    const fullName = route?.params?.fullName || authName || '';
    if (!isAuthenticated) {
      if (token) {
        dispatch(setAuthSession({ user: { _id: clientId || undefined, id: clientId || undefined, email: emailForSession, name: fullName || emailForSession || 'User', firstName: fullName.split(' ')[0] || '', lastName: fullName.split(' ').slice(1).join(' ') || '', isEmailVerified: true, hasCompletedOnboarding: true }, token }));
      } else {
        dispatch(setAuthSession({ user: { _id: clientId || 'demo-id', id: clientId || 'demo-id', email: emailForSession || 'user@demo.com', name: fullName || 'User', firstName: fullName.split(' ')[0] || 'User', lastName: fullName.split(' ').slice(1).join(' ') || '', isEmailVerified: true, hasCompletedOnboarding: true }, token: 'demo-token-' + Date.now() }));
      }
    }
    // Payment ho chuka hai -> Home dikhao, tracking nahi. Dubara login pe bhi Home dikhe isliye flag persist karo
    dispatch(setHasCompletedPayment(true));
    if (isAuthenticated) {
      // ── Add Company (RegistrationStack modal) vs MainStack ke screens ──────
      // Ye screen DONO jagah mounted hai: AuthStack (signup), RegistrationStack
      // (Home se Add Company — modal ke andar) aur MainStack (resume payment).
      //
      // Pehle yahan popToTop() tha, jo dono me galat tha:
      //  - MainStack me: screen seedha pop ho jata tha, company list refresh
      //    nahi hota tha.
      //  - RegistrationStack me: popToTop sirf modal ke ANDAR RegistrationLanding
      //    par wapas jata hai. Modal kabhi nahi band hota, to Home screen
      //    chhupi rehti hai — nayi company list me dikhti hi nahi.
      //
      // Ab dono ka ek hi raasta: Home ko signal bhejo, wo navigation.goBack()
      // se modal band karega aur apne focus effect se list refresh + nayi
      // company auto-select karega. Ye signal tabhi bhejna chahiye jab
      // Add Company flow chal raha hai (route param ke through), warna
      // MainStack ke resume-payment flow me Home par koi extra goBack kar
      // dobara peeche nikal dega.
      if (isAddCompanyFlow) {
        dispatch(setPendingCloseAddCompany(true));
      } else if (navigation?.popToTop) {
        navigation.popToTop();
      } else {
        navigation?.navigate?.('Home');
      }
    }
  };
  const [passportUri, setPassportUri] = React.useState(null);
  const [addressUri, setAddressUri] = React.useState(null);
  const [selfieUri, setSelfieUri] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [kycStatus, setKycStatus] = React.useState(null); // 'pending' | 'complete' | null
  const [fetchingKyc, setFetchingKyc] = React.useState(false);

  // GET /kyc/:companyId — show current status (fallback chain, 404 -> next)
  React.useEffect(() => {
    if (!companyId) return;
    let mounted = true;
    const fetchKyc = async () => {
      setFetchingKyc(true);
      const headers = token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
      const endpoints = [
        `${API_BASE_URL}/api/kyc/${companyId}`,
        `${API_BASE_URL}/api/company-signup/kyc/${companyId}`,
        `${API_BASE_URL}/api/company/kyc/${companyId}`,
        `${API_BASE_URL}/api/client/kyc/${companyId}`,
        `${API_BASE_URL}/api/clients/kyc/${companyId}`,
        `${API_BASE_URL}/api/companies/kyc/${companyId}`,
      ];
      for (const url of endpoints) {
        try {
          console.log('=== getKycStatus TRY ===', url);
          const r = await axios.get(url, { headers, timeout: 8000 });
          if (!mounted) return;
          const status = r.data?.kycStatus || r.data?.status || r.data?.data?.kycStatus || null;
          console.log('=== getKycStatus SUCCESS ===', url, JSON.stringify(r.data, null, 2));
          if (status) setKycStatus(String(status).toLowerCase());
          break;
        } catch (e) {
          const code = e?.response?.status;
          console.log('=== getKycStatus FAILED ===', url, code, e?.response?.data || e.message);
          if (code === 404) continue;
          break;
        }
      }
      if (mounted) setFetchingKyc(false);
    };
    fetchKyc();
    return () => { mounted = false; };
  }, [companyId, token]);

  // camera se photo (client se seedha photo lena hai)
  const openCamera = (type) => {
    launchCamera({ mediaType: 'photo', quality: 0.9, saveToPhotos: false }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Toast.show({ type: 'error', text1: res.errorMessage || 'Camera error' });
        return;
      }
      const asset = res.assets?.[0];
      const uri = asset?.uri;
      if (!uri) return;
      if (type === 'passport') setPassportUri(uri);
      if (type === 'address') setAddressUri(uri);
      if (type === 'selfie') setSelfieUri(uri);
      Toast.show({ type: 'success', text1: `${type} photo captured — tap Upload to send` });
    });
  };

  // gallery se file/photo pick (PDF bhi chalega)
  const openGallery = (type) => {
    launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Toast.show({ type: 'error', text1: res.errorMessage || 'Gallery error' });
        return;
      }
      const asset = res.assets?.[0];
      const uri = asset?.uri;
      if (!uri) return;
      if (type === 'passport') setPassportUri(uri);
      if (type === 'address') setAddressUri(uri);
      if (type === 'selfie') setSelfieUri(uri);
      Toast.show({ type: 'success', text1: `${type} file selected — tap Upload to send` });
    });
  };

  // dono option dene wala picker: camera ya gallery
  const openPicker = (type) => {
    const title = { passport: 'Passport photo', address: 'Proof of address', selfie: 'Selfie verification' }[type] || 'Upload document';
    Alert.alert(title, 'Take a photo or choose an existing file', [
      { text: 'Take Photo', onPress: () => openCamera(type) },
      { text: 'Choose from Gallery', onPress: () => openGallery(type) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const buildFile = (uri, field) => {
    const name = uri.split('/').pop() || `${field}.jpg`;
    const ext = name.split('.').pop()?.toLowerCase() || 'jpg';
    const mime = ext === 'png' ? 'image/png' : ext === 'pdf' ? 'application/pdf' : 'image/jpeg';
    return { uri, type: mime, name };
  };

  const handleUploadKyc = async () => {
    if (!companyId || !clientId) {
      Toast.show({ type: 'error', text1: 'Missing IDs', text2: 'companyId/clientId required' });
      return;
    }
    if (!passportUri && !addressUri && !selfieUri) {
      Toast.show({ type: 'error', text1: 'No files', text2: 'Select passport, addressProof and/or selfie' });
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      if (passportUri) form.append('passport', buildFile(passportUri, 'passport'));
      if (addressUri) form.append('addressProof', buildFile(addressUri, 'addressProof'));
      if (selfieUri) form.append('selfie', buildFile(selfieUri, 'selfie'));
      // Do NOT set Content-Type manually — axios will add boundary
      const headers = token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
      const endpoints = [
        `${API_BASE_URL}/api/kyc/${companyId}/${clientId}`,
        `${API_BASE_URL}/api/company-signup/kyc/${companyId}/${clientId}`,
        `${API_BASE_URL}/api/company/kyc/${companyId}/${clientId}`,
        `${API_BASE_URL}/api/client/kyc/${companyId}/${clientId}`,
        `${API_BASE_URL}/api/clients/kyc/${companyId}/${clientId}`,
        `${API_BASE_URL}/api/companies/kyc/${companyId}/${clientId}`,
        `${API_BASE_URL}/api/company/${companyId}/kyc/${clientId}`,
      ];
      let lastErr = null;
      let success = null;
      for (const url of endpoints) {
        try {
          console.log('=== submitKyc TRY ===', url, { hasPassport: !!passportUri, hasAddress: !!addressUri, hasSelfie: !!selfieUri });
          const r = await axios.post(url, form, { headers, timeout: 25000 });
          console.log('=== submitKyc SUCCESS ===', url, JSON.stringify(r.data, null, 2));
          success = r.data;
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          const code = e?.response?.status;
          const msg = e?.response?.data?.message || e.message;
          console.log('=== submitKyc FAILED ===', url, code, JSON.stringify(e?.response?.data || msg, null, 2));
          if (code === 404) continue; // try next prefix
          throw e;
        }
      }
      if (lastErr) throw lastErr;
      const status = String(success?.kycStatus || '').toLowerCase();
      if (status) setKycStatus(status);
      Toast.show({ type: 'success', text1: success?.message || 'Documents uploaded', text2: status ? `KYC ${status}` : '' });
    } catch (e) {
      console.log('=== submitKyc FINAL FAILED ===', JSON.stringify(e?.response?.data || e.message, null, 2));
      const msg = e?.response?.data?.message || e.message || 'Upload failed — route not found (check backend mount)';
      Toast.show({ type: 'error', text1: 'KYC upload failed', text2: msg });
    } finally {
      setUploading(false);
    }
  };

  // fill state sirf photo/file se — passport number ya address text nahi, client se capture/upload hoga
  const isPassportFilled = !!passportUri;
  const isAddressFilled = !!addressUri;
  const isSelfieFilled = !!selfieUri;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={themePalette.hex_070c15} />

      {/* CompanyNaming jaisa Back + Logo header */}
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation?.goBack?.()} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            Verify your <Text style={styles.italicTitle}>identity</Text>
          </Text>
          <Text style={styles.subTitle}>
            Required by law for company formation. Encrypted and never shared.
          </Text>
        </View>

        {/* Current User Header Card */}
        <View style={styles.userHeaderCard}>
          <View style={styles.userInfoLeft}>
            <View style={styles.avatarGold}>
              <Text style={styles.avatarGoldText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{authName}</Text>
              <Text style={styles.userRole}>{userRoleText}</Text>
            </View>
          </View>
          <Text style={styles.progressText}>{kycStatus === 'complete' ? '3 of 3 done' : `${[passportUri, addressUri, selfieUri].filter(Boolean).length} of 3 selected`}{fetchingKyc ? '…' : ''}</Text>
        </View>

        {/* Upload Status Items - tap to open gallery */}
        <View style={styles.documentsContainer}>
          {/* Passport */}
          <TouchableOpacity activeOpacity={0.8} onPress={() => openPicker('passport')} style={[styles.docCard, isPassportFilled && styles.verifiedCard]}>
            <View style={[styles.docIconBox, { backgroundColor: isPassportFilled ? themePalette.rgba_16_185_129_0_12 : themePalette.rgba_148_163_184_0_12 }]}>
              <CreditCard color={isPassportFilled ? themePalette.hex_10b981 : themePalette.hex_94a3b8} size={20} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Passport</Text>
              <Text style={[styles.docSub, isPassportFilled && styles.docSubYellow]} numberOfLines={1}>{passportUri ? `Added: ${passportUri.split('/').pop()}` : 'Not uploaded · tap to add photo'}</Text>
            </View>
            <DocUploadButton filled={isPassportFilled} onPress={() => openPicker('passport')} />
          </TouchableOpacity>

          {/* Proof of address */}
          <TouchableOpacity activeOpacity={0.8} onPress={() => openPicker('address')} style={[styles.docCard, isAddressFilled && styles.verifiedCard]}>
            <View style={[styles.docIconBox, { backgroundColor: isAddressFilled ? themePalette.rgba_16_185_129_0_12 : themePalette.rgba_148_163_184_0_12 }]}>
              <FileText color={isAddressFilled ? themePalette.hex_10b981 : themePalette.hex_94a3b8} size={20} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Proof of address</Text>
              <Text style={[styles.docSub, isAddressFilled && styles.docSubYellow]} numberOfLines={2}>{addressUri ? `Added: ${addressUri.split('/').pop()}` : 'Not uploaded · tap to add photo or bill'}</Text>
            </View>
            <DocUploadButton filled={isAddressFilled} onPress={() => openPicker('address')} />
          </TouchableOpacity>

          {/* Selfie verification */}
          <TouchableOpacity activeOpacity={0.8} onPress={() => openPicker('selfie')} style={[styles.docCard, isSelfieFilled && styles.verifiedCard]}>
            <View style={[styles.docIconBox, { backgroundColor: isSelfieFilled ? themePalette.rgba_16_185_129_0_12 : themePalette.rgba_148_163_184_0_12 }]}>
              <Camera color={isSelfieFilled ? themePalette.hex_10b981 : themePalette.hex_94a3b8} size={20} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Selfie verification</Text>
              <Text style={[styles.docSub, isSelfieFilled && styles.docSubYellow]}>{selfieUri ? `Added: ${selfieUri.split('/').pop()}` : 'Not uploaded · tap to take a selfie'}</Text>
            </View>
            <DocUploadButton filled={isSelfieFilled} onPress={() => openPicker('selfie')} />
          </TouchableOpacity>
        </View>

        {/* OTHER SHAREHOLDERS dummy hata diya - jab banega tab show hoga */}

        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <ShieldCheck color={themePalette.hex_10b981} size={20} style={{ marginTop: 2 }} />
          <Text style={styles.securityText}>
            Bank-grade encryption. Documents are used solely for filing and deleted after 90 days.
          </Text>
        </View>

        {/* Upload KYC Button — POST /kyc/:companyId/:clientId */}
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: themePalette.hex_0f172a, borderWidth: 1, borderColor: themePalette.rgba_234_179_8_0_3 }, uploading && { opacity: 0.6 }]}
          activeOpacity={0.85}
          onPress={handleUploadKyc}
          disabled={uploading || (!passportUri && !addressUri && !selfieUri)}
        >
          <Text style={[styles.continueButtonText, { color: themePalette.hex_eab308 }]}>{uploading ? 'Uploading...' : kycStatus === 'complete' ? 'KYC Complete — Re-upload?' : 'Upload KYC Documents'}</Text>
        </TouchableOpacity>
        {kycStatus ? <Text style={{ color: kycStatus === 'complete' ? themePalette.hex_10b981 : themePalette.hex_eab308, fontSize: font.small, textAlign: 'center', marginTop: 6 }}>KYC Status: {kycStatus}{fetchingKyc ? ' (refreshing...)' : ''}</Text> : null}
        {!companyId || !clientId ? <Text style={{ color: themePalette.hex_ef4444, fontSize: font.small, textAlign: 'center', marginTop: 6 }}>Missing companyId/clientId — upload will fail</Text> : null}

        {/* Bottom Button - KYC complete -> direct RegistrationTracking */}
        <TouchableOpacity style={[styles.continueButton, kycStatus !== 'complete' && { opacity: 0.7 }]} activeOpacity={0.85} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue{kycStatus !== 'complete' ? ' (skip KYC)' : ''}</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>Filing starts once all KYC is verified</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerifyIdentityScreen;

const styles = makeThemeStyles(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themePalette.hex_070c15,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 34 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  stepProgressBar: {
    flexDirection: 'row',
    height: 3,
    width: '100%',
    backgroundColor: themePalette.hex_1e293b,
    marginVertical: 4,
  },
  stepActive: {
    flex: 1,
    backgroundColor: themePalette.hex_eab308,
  },
  scrollContent: {
    paddingHorizontal: s(16),
    paddingVertical: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: font.displayLarge,
    color: themePalette.hex_ffffff,
    fontWeight: '400',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: themePalette.hex_eab308,
    fontFamily: 'serif',
  },
  subTitle: {
    color: themePalette.hex_94a3b8,
    fontSize: font.bodySmall,
    marginTop: 6,
    lineHeight: 18,
  },
  userHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themePalette.rgba_234_179_8_0_05,
    borderColor: themePalette.rgba_234_179_8_0_2,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarGold: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: themePalette.hex_3a311a,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarGoldText: {
    color: themePalette.hex_d97706,
    fontWeight: '700',
    fontSize: font.bodySmall,
  },
  userName: {
    color: themePalette.hex_ffffff,
    fontSize: font.base,
    fontWeight: '700',
  },
  userRole: {
    color: themePalette.hex_64748b,
    fontSize: font.small,
    marginTop: 2,
  },
  progressText: {
    color: themePalette.hex_eab308,
    fontSize: font.sm,
    fontWeight: '700',
  },
  documentsContainer: {
    marginBottom: 20,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  verifiedCard: {
    backgroundColor: themePalette.hex_0f172a,
    borderColor: themePalette.rgba_16_185_129_0_3,
  },
  uploadingCard: {
    backgroundColor: themePalette.hex_0f172a,
    borderColor: themePalette.hex_3a311a,
    borderStyle: 'dashed',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  uploadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verifiedIconBox: {
    backgroundColor: themePalette.rgba_16_185_129_0_12,
  },
  uploadingIconBox: {
    backgroundColor: themePalette.rgba_234_179_8_0_12,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    color: themePalette.hex_ffffff,
    fontSize: font.base,
    fontWeight: '600',
  },
  docSub: {
    color: themePalette.hex_64748b,
    fontSize: font.sm,
    marginTop: 2,
  },
  docSubYellow: {
    color: themePalette.hex_eab308,
    fontSize: font.sm,
    marginTop: 2,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themePalette.rgba_234_179_8_0_35,
    backgroundColor: themePalette.rgba_234_179_8_0_08,
  },
  uploadBtnFilled: {
    borderColor: themePalette.rgba_16_185_129_0_35,
    backgroundColor: themePalette.rgba_16_185_129_0_08,
  },
  uploadBtnText: {
    color: themePalette.hex_eab308,
    fontSize: font.sm,
    fontWeight: '700',
  },
  uploadBtnTextFilled: {
    color: themePalette.hex_10b981,
  },
  progressTrack: {
    height: 3,
    backgroundColor: themePalette.hex_1e293b,
    borderRadius: 2,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: themePalette.hex_eab308,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    color: themePalette.hex_475569,
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: themePalette.hex_1e293b,
  },
  otherShareholderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themePalette.hex_0f172a,
    borderColor: themePalette.rgba_255_255_255_0_08,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  errorShareholderCard: {
    borderColor: themePalette.rgba_239_68_68_0_3,
    backgroundColor: themePalette.rgba_239_68_68_0_03,
  },
  avatarBlue: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themePalette.hex_1e293b,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarBlueText: {
    color: themePalette.hex_38bdf8,
    fontWeight: '700',
    fontSize: font.sm,
  },
  avatarRed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themePalette.hex_3b1219,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarRedText: {
    color: themePalette.hex_f87171,
    fontWeight: '700',
    fontSize: font.sm,
  },
  otherUserName: {
    color: themePalette.hex_ffffff,
    fontSize: font.base,
    fontWeight: '600',
  },
  otherUserSub: {
    color: themePalette.hex_64748b,
    fontSize: font.small,
    marginTop: 2,
  },
  errorText: {
    color: themePalette.hex_f87171,
    fontSize: font.small,
    marginTop: 2,
  },
  resendBtn: {
    backgroundColor: themePalette.rgba_234_179_8_0_1,
    borderColor: themePalette.rgba_234_179_8_0_3,
    borderWidth: 1,
    paddingHorizontal: s(12),
    paddingVertical: 6,
    borderRadius: 8,
  },
  resendBtnText: {
    color: themePalette.hex_eab308,
    fontSize: font.sm,
    fontWeight: '600',
  },
  notifyBtn: {
    backgroundColor: themePalette.rgba_239_68_68_0_15,
    borderColor: themePalette.rgba_239_68_68_0_3,
    borderWidth: 1,
    paddingHorizontal: s(12),
    paddingVertical: 6,
    borderRadius: 8,
  },
  notifyBtnText: {
    color: themePalette.hex_f87171,
    fontSize: font.sm,
    fontWeight: '600',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: themePalette.rgba_16_185_129_0_05,
    borderColor: themePalette.rgba_16_185_129_0_2,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
  },
  securityText: {
    color: themePalette.hex_64748b,
    fontSize: font.small,
    marginLeft: 10,
    flex: 1,
    lineHeight: 16,
  },
  disabledButton: {
    backgroundColor: themePalette.hex_1e293b,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  disabledButtonText: {
    color: themePalette.hex_64748b,
    fontSize: font.md,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: themePalette.hex_eab308,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  continueButtonText: {
    color: themePalette.hex_070c15,
    fontSize: font.lg,
    fontWeight: '700',
  },
  footerNote: {
    color: themePalette.hex_475569,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
}));
