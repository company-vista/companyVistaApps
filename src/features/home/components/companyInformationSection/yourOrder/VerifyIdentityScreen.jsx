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
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../../theme/colors';
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
        <View style={[styles.iconButton, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_111827, borderColor: colors.border }]}>
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

        <View style={[styles.userBar, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: themePalette.hex_b45309 }]}>
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

        <View style={[styles.uploadingCard, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a }]}>
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

        <View style={[styles.shareholderCard, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: themePalette.hex_1e3a8a }]}>
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

        <View style={[styles.shareholderCard, styles.alertCard, { backgroundColor: isLight ? themePalette.hex_fef2f2 : themePalette.rgba_153_27_27_0_15 }]}>
          <View style={[styles.avatar, { backgroundColor: themePalette.hex_881337 }]}>
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
        <TouchableOpacity style={[styles.disabledButton, { backgroundColor: isLight ? themePalette.hex_e2e8f0 : themePalette.hex_1e293b }]} disabled={true}>
          <Text style={[styles.disabledButtonText, { color: colors.muted }]}>Waiting on 2 shareholders</Text>
        </TouchableOpacity>
        <Text style={[styles.footerNote, { color: colors.muted }]}>Filing starts once all KYC is verified</Text>
      </View>
    </View>
  );
};

export default VerifyIdentityScreen;

const styles = makeThemeStyles(() => StyleSheet.create({
  container: { flex: 1, backgroundColor: themePalette.hex_070c16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: s(16), paddingBottom: s(8) },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: themePalette.hex_111827, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: themePalette.hex_1f2937 },
  iconText: { color: themePalette.hex_9ca3af, fontSize: font.lg, fontWeight: 'bold' },
  logoImage: { width: 130, height: 32 },
  progressContainer: { flexDirection: 'row', height: 2, marginTop: s(12) },
  activeProgress: { flex: 1, backgroundColor: themePalette.hex_eab308, marginRight: s(2) },
  scrollContainer: { paddingHorizontal: s(16), paddingTop: s(20), paddingBottom: s(110) },
  titleContainer: { marginBottom: s(20) },
  mainTitle: { fontSize: font.display, color: themePalette.hex_ffffff },
  italicTitle: { fontStyle: 'italic', color: themePalette.hex_eab308 },
  subTitle: { color: themePalette.hex_9ca3af, fontSize: font.bodySmall, marginTop: s(6), lineHeight: 18 },
  userBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.hex_0f172a, borderRadius: 12, borderWidth: 1, borderColor: themePalette.hex_1e293b, padding: s(12), marginBottom: s(16) },
  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: s(10) },
  avatarText: { color: themePalette.hex_ffffff, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: themePalette.hex_ffffff, fontSize: font.md, fontWeight: 'bold' },
  userRole: { color: themePalette.hex_6b7280, fontSize: font.sm, marginTop: s(2) },
  doneCount: { color: themePalette.hex_eab308, fontWeight: 'bold', fontSize: font.bodySmall },
  verifiedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.rgba_16_185_129_0_05, borderWidth: 1, borderColor: themePalette.hex_059669, borderRadius: 12, padding: s(12), marginBottom: s(12) },
  cardIconBox: { width: 38, height: 38, borderRadius: 8, backgroundColor: themePalette.rgba_5_150_105_0_2, justifyContent: 'center', alignItems: 'center', marginRight: s(12) },
  cardIcon: { fontSize: font.xxl },
  cardDetails: { flex: 1 },
  cardTitle: { color: themePalette.hex_ffffff, fontSize: font.md, fontWeight: 'bold' },
  cardSubText: { color: themePalette.hex_9ca3af, fontSize: font.sm, marginTop: s(2) },
  greenCheck: { color: themePalette.hex_10b981, fontSize: font.xxl, fontWeight: 'bold' },
  uploadingCard: { backgroundColor: themePalette.hex_0f172a, borderWidth: 1, borderColor: themePalette.hex_eab308, borderStyle: 'dashed', borderRadius: 12, padding: s(12), marginBottom: s(20) },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: s(12) },
  cardIconBoxGold: { width: 38, height: 38, borderRadius: 8, backgroundColor: themePalette.rgba_234_179_8_0_15, justifyContent: 'center', alignItems: 'center', marginRight: s(12) },
  cardSubTextGold: { color: themePalette.hex_eab308, fontSize: font.sm, marginTop: s(2) },
  uploadBarBackground: { height: 3, backgroundColor: themePalette.hex_1e293b, borderRadius: 2 },
  uploadBarFill: { height: '100%', backgroundColor: themePalette.hex_eab308, borderRadius: 2 },
  sectionHeaderContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: s(16) },
  line: { flex: 1, height: 1, backgroundColor: themePalette.hex_1e293b },
  sectionHeader: { color: themePalette.hex_6b7280, fontSize: font.small, fontWeight: 'bold', marginHorizontal: s(10), letterSpacing: 1 },
  shareholderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.hex_0f172a, borderRadius: 12, borderWidth: 1, borderColor: themePalette.hex_1e293b, padding: s(12), marginBottom: s(12) },
  resendButton: { borderWidth: 1, borderColor: themePalette.hex_eab308, borderRadius: 16, paddingHorizontal: s(14), paddingVertical: s(6) },
  resendButtonText: { color: themePalette.hex_eab308, fontSize: font.sm, fontWeight: 'bold' },
  alertCard: { backgroundColor: themePalette.rgba_153_27_27_0_15, borderColor: themePalette.hex_991b1b },
  alertSubText: { color: themePalette.hex_ef4444, fontSize: font.small, marginTop: s(2) },
  notifyButton: { borderWidth: 1, borderColor: themePalette.hex_ef4444, borderRadius: 16, paddingHorizontal: s(14), paddingVertical: s(6) },
  notifyButtonText: { color: themePalette.hex_ef4444, fontSize: font.sm, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: themePalette.hex_070c16, paddingHorizontal: s(16), paddingTop: s(12), borderTopWidth: 1, borderTopColor: themePalette.hex_1e293b },
  disabledButton: { backgroundColor: themePalette.hex_1e293b, borderRadius: 25, height: 48, justifyContent: 'center', alignItems: 'center' },
  disabledButtonText: { color: themePalette.hex_9ca3af, fontSize: font.md, fontWeight: 'bold' },
  footerNote: { color: themePalette.hex_6b7280, fontSize: font.small, textAlign: 'center', marginTop: s(8) },
  encryptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: s(10),
    backgroundColor: themePalette.rgba_16_185_129_0_08,
    borderWidth: 1,
    borderColor: themePalette.rgba_16_185_129_0_18,
    borderRadius: 8,
    paddingHorizontal: s(10),
    paddingVertical: s(8),
  },
  encryptionIcon: { fontSize: font.sm, marginRight: s(6) },
  encryptionText: { color: themePalette.hex_9ca3af, fontSize: font.small, flex: 1, lineHeight: 14, textAlign: 'center' },
}));
