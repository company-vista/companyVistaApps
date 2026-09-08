import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
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
import { useAppSelector } from '../../../store/hooks';

const VerifyIdentityScreen = ({ navigation, route }) => {
  const authUser = useAppSelector(s => s.auth.user);
  const authName = authUser?.name || [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ').trim() || route?.params?.fullName || 'Rajesh Kumar Sharma';
  const initials = authName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0,2).toUpperCase() || 'RS';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070C15" />

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
              <Text style={styles.userRole}>60% owner · Managing Member</Text>
            </View>
          </View>
          <Text style={styles.progressText}>0 of 3 done</Text>
        </View>

        {/* Upload Status Items - abhi tick nahi, KYC ke baad verified hoga */}
        <View style={styles.documentsContainer}>
          {/* Passport - Pending */}
          <View style={styles.docCard}>
            <View style={[styles.docIconBox, { backgroundColor: 'rgba(148,163,184,0.12)' }]}>
              <CreditCard color="#94A3B8" size={20} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Passport</Text>
              <Text style={styles.docSub}>Not uploaded · tap to upload</Text>
            </View>
          </View>

          {/* Proof of address - Pending */}
          <View style={styles.docCard}>
            <View style={[styles.docIconBox, { backgroundColor: 'rgba(148,163,184,0.12)' }]}>
              <FileText color="#94A3B8" size={20} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Proof of address</Text>
              <Text style={styles.docSub}>Not uploaded · tap to upload</Text>
            </View>
          </View>

          {/* Selfie verification - Pending */}
          <View style={styles.docCard}>
            <View style={[styles.docIconBox, { backgroundColor: 'rgba(148,163,184,0.12)' }]}>
              <Camera color="#94A3B8" size={20} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Selfie verification</Text>
              <Text style={styles.docSub}>Not uploaded · tap to upload</Text>
            </View>
          </View>
        </View>

        {/* OTHER SHAREHOLDERS dummy hata diya - jab banega tab show hoga */}

        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <ShieldCheck color="#10B981" size={20} style={{ marginTop: 2 }} />
          <Text style={styles.securityText}>
            Bank-grade encryption. Documents are used solely for filing and deleted after 90 days.
          </Text>
        </View>

        {/* Bottom Button - ab RegistrationProgress pe le jayega with dynamic fill */}
        <TouchableOpacity style={styles.continueButton} activeOpacity={0.85} onPress={() => navigation?.navigate?.('RegistrationProgress', { ...route?.params, companyName: route?.params?.companyName, selectedState: route?.params?.country || route?.params?.selectedState, selectedStructure: route?.params?.selectedStructure || route?.params?.structure, shareCapital: route?.params?.shareCapital || '€25,000', shareholdersCount: route?.params?.shareholdersCount || '3 people', amount: route?.params?.amountPaid || route?.params?.amount, orderId: route?.params?.orderId })}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>Filing starts once all KYC is verified</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerifyIdentityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C15',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 34 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  stepProgressBar: {
    flexDirection: 'row',
    height: 3,
    width: '100%',
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  stepActive: {
    flex: 1,
    backgroundColor: '#EAB308',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: '#EAB308',
    fontFamily: 'serif',
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  userHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.05)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
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
    backgroundColor: '#3A311A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarGoldText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 13,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  userRole: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  progressText: {
    color: '#EAB308',
    fontSize: 12,
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
    backgroundColor: '#0F172A',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  uploadingCard: {
    backgroundColor: '#0F172A',
    borderColor: '#3A311A',
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
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  uploadingIconBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  docSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  docSubYellow: {
    color: '#EAB308',
    fontSize: 12,
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EAB308',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  otherShareholderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  errorShareholderCard: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
  },
  avatarBlue: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarBlueText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 12,
  },
  avatarRed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B1219',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarRedText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 12,
  },
  otherUserName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  otherUserSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  errorText: {
    color: '#F87171',
    fontSize: 11,
    marginTop: 2,
  },
  resendBtn: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resendBtnText: {
    color: '#EAB308',
    fontSize: 12,
    fontWeight: '600',
  },
  notifyBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  notifyBtnText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
  },
  securityText: {
    color: '#64748B',
    fontSize: 11,
    marginLeft: 10,
    flex: 1,
    lineHeight: 16,
  },
  disabledButton: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  disabledButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: '#EAB308',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  continueButtonText: {
    color: '#070C15',
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    color: '#475569',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
});
