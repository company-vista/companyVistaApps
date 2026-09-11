import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../../../components/buttons/BackButton';
import logoR from '../../../../../assets/images/logoR.png';
import { font } from '../../../../../theme/typography';
import { useThemeColors } from '../../../../../theme/colors';
import { s } from '../../../../../theme/responsive';

const VerifyIdentityScreen = ({ onBackPress }) => {
  const colors = useThemeColors(); const isLight = colors.mode === 'light';
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <View style={[styles.header, { marginTop: s(8) }]}>
        <BackButton onPress={onBackPress} />
        <Image source={logoR} style={styles.logoImage} resizeMode="contain" />
        <View style={[styles.iconButton, { backgroundColor: isLight ? '#FFFFFF' : '#111827', borderColor: colors.border }]}>
          <Text style={[styles.iconText, { color: colors.muted }]}>?</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Verify your <Text style={styles.italicTitle}>identity</Text>
          </Text>
          <Text style={[styles.subTitle, { color: colors.muted }]}>Required by law for company formation. Encrypted and never shared.</Text>
        </View>

        <View style={[styles.userBar, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: '#B45309' }]}>
            <Text style={styles.avatarText}>RS</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>Rajesh Kumar Sharma</Text>
            <Text style={[styles.userRole, { color: colors.muted }]}>60% owner · Managing Member</Text>
          </View>
          <Text style={styles.doneCount}>2 of 3 done</Text>
        </View>

        <View style={styles.verifiedCard}>
          <View style={styles.cardIconBox}>
            <Text style={styles.cardIcon}>🪪</Text>
          </View>
          <View style={styles.cardDetails}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Passport</Text>
            <Text style={[styles.cardSubText, { color: colors.muted }]}>passport_rks.jpg · verified</Text>
          </View>
          <Text style={styles.greenCheck}>✓</Text>
        </View>

        <View style={styles.verifiedCard}>
          <View style={styles.cardIconBox}>
            <Text style={styles.cardIcon}>🏠</Text>
          </View>
          <View style={styles.cardDetails}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Proof of address</Text>
            <Text style={[styles.cardSubText, { color: colors.muted }]}>utility_bill.pdf · verified</Text>
          </View>
          <Text style={styles.greenCheck}>✓</Text>
        </View>

        <View style={[styles.uploadingCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A' }]}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardIconBoxGold}>
              <Text style={styles.cardIcon}>📷</Text>
            </View>
            <View style={styles.cardDetails}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Selfie verification</Text>
              <Text style={styles.cardSubTextGold}>Uploading... 68%</Text>
            </View>
          </View>
          <View style={[styles.uploadBarBackground, { backgroundColor: colors.border }]}>
            <View style={[styles.uploadBarFill, { width: '68%' }]} />
          </View>
        </View>

        <View style={styles.sectionHeaderContainer}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.sectionHeader, { color: colors.muted }]}>OTHER SHAREHOLDERS</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <View style={[styles.shareholderCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: '#1E3A8A' }]}>
            <Text style={styles.avatarText}>PM</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>Priya Menon</Text>
            <Text style={[styles.userRole, { color: colors.muted }]}>Invite sent · awaiting upload</Text>
          </View>
          <TouchableOpacity style={styles.resendButton}>
            <Text style={styles.resendButtonText}>Resend</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.shareholderCard, styles.alertCard, { backgroundColor: isLight ? '#FEF2F2' : 'rgba(153, 27, 27, 0.15)' }]}>
          <View style={[styles.avatar, { backgroundColor: '#881337' }]}>
            <Text style={styles.avatarText}>AK</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>Arun Kapoor</Text>
            <Text style={styles.alertSubText}>Passport image unclear — reupload needed</Text>
          </View>
          <TouchableOpacity style={styles.notifyButton}>
            <Text style={styles.notifyButtonText}>Notify</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.encryptionBanner, { borderColor: colors.border }]}>
          <Text style={styles.encryptionIcon}>🛡️</Text>
          <Text style={[styles.encryptionText, { color: colors.muted }]}>Bank-grade encryption. Documents are used solely for filing and deleted after 90 days.</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + s(12), backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.disabledButton, { backgroundColor: isLight ? '#E2E8F0' : '#1E293B' }]} disabled={true}>
          <Text style={[styles.disabledButtonText, { color: colors.muted }]}>Waiting on 2 shareholders</Text>
        </TouchableOpacity>
        <Text style={[styles.footerNote, { color: colors.muted }]}>Filing starts once all KYC is verified</Text>
      </View>
    </View>
  );
};

export default VerifyIdentityScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070C16' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: s(16), paddingBottom: s(8) },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' },
  iconText: { color: '#9CA3AF', fontSize: 16, fontWeight: 'bold' },
  logoImage: { width: 130, height: 32 },
  progressContainer: { flexDirection: 'row', height: 2, marginTop: s(12) },
  activeProgress: { flex: 1, backgroundColor: '#EAB308', marginRight: s(2) },
  scrollContainer: { paddingHorizontal: s(16), paddingTop: s(20), paddingBottom: s(110) },
  titleContainer: { marginBottom: s(20) },
  mainTitle: { fontSize: font.display, color: '#FFFFFF' },
  italicTitle: { fontStyle: 'italic', color: '#EAB308' },
  subTitle: { color: '#9CA3AF', fontSize: 13, marginTop: s(6), lineHeight: 18 },
  userBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', padding: s(12), marginBottom: s(16) },
  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: s(10) },
  avatarText: { color: '#FFFFFF', fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  userRole: { color: '#6B7280', fontSize: 12, marginTop: s(2) },
  doneCount: { color: '#EAB308', fontWeight: 'bold', fontSize: 13 },
  verifiedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderWidth: 1, borderColor: '#059669', borderRadius: 12, padding: s(12), marginBottom: s(12) },
  cardIconBox: { width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(5, 150, 105, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: s(12) },
  cardIcon: { fontSize: 18 },
  cardDetails: { flex: 1 },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  cardSubText: { color: '#9CA3AF', fontSize: 12, marginTop: s(2) },
  greenCheck: { color: '#10B981', fontSize: 18, fontWeight: 'bold' },
  uploadingCard: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#EAB308', borderStyle: 'dashed', borderRadius: 12, padding: s(12), marginBottom: s(20) },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: s(12) },
  cardIconBoxGold: { width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(234, 179, 8, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: s(12) },
  cardSubTextGold: { color: '#EAB308', fontSize: 12, marginTop: s(2) },
  uploadBarBackground: { height: 3, backgroundColor: '#1E293B', borderRadius: 2 },
  uploadBarFill: { height: '100%', backgroundColor: '#EAB308', borderRadius: 2 },
  sectionHeaderContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: s(16) },
  line: { flex: 1, height: 1, backgroundColor: '#1E293B' },
  sectionHeader: { color: '#6B7280', fontSize: 11, fontWeight: 'bold', marginHorizontal: s(10), letterSpacing: 1 },
  shareholderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', padding: s(12), marginBottom: s(12) },
  resendButton: { borderWidth: 1, borderColor: '#EAB308', borderRadius: 16, paddingHorizontal: s(14), paddingVertical: s(6) },
  resendButtonText: { color: '#EAB308', fontSize: 12, fontWeight: 'bold' },
  alertCard: { backgroundColor: 'rgba(153, 27, 27, 0.15)', borderColor: '#991B1B' },
  alertSubText: { color: '#EF4444', fontSize: 11, marginTop: s(2) },
  notifyButton: { borderWidth: 1, borderColor: '#EF4444', borderRadius: 16, paddingHorizontal: s(14), paddingVertical: s(6) },
  notifyButtonText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#070C16', paddingHorizontal: s(16), paddingTop: s(12), borderTopWidth: 1, borderTopColor: '#1E293B' },
  disabledButton: { backgroundColor: '#1E293B', borderRadius: 25, height: 48, justifyContent: 'center', alignItems: 'center' },
  disabledButtonText: { color: '#9CA3AF', fontSize: 15, fontWeight: 'bold' },
  footerNote: { color: '#6B7280', fontSize: 11, textAlign: 'center', marginTop: s(8) },
  encryptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: s(10),
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.18)',
    borderRadius: 8,
    paddingHorizontal: s(10),
    paddingVertical: s(8),
  },
  encryptionIcon: { fontSize: 12, marginRight: s(6) },
  encryptionText: { color: '#9CA3AF', fontSize: 11, flex: 1, lineHeight: 14, textAlign: 'center' },
});
