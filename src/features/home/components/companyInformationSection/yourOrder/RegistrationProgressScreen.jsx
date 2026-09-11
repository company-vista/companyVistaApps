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
import { useThemeColors } from '../../../../../theme/colors';
import { s } from '../../../../../theme/responsive';

const RegistrationProgressScreen = ({ onBackPress }) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <View style={[styles.header, { marginTop: s(8) }]}>
        <BackButton onPress={onBackPress} />
        <Image source={logoR} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.iconButton}>
          <Text style={styles.iconText}>?</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            Registration <Text style={styles.italicTitle}>progress</Text>
          </Text>
          <Text style={styles.subTitle}>Meridian Global Ventures LLC · Delaware</Text>
        </View>

        <View style={[styles.overallCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
          <View style={styles.overallHeader}>
            <View>
              <Text style={styles.overallLabel}>OVERALL</Text>
              <Text style={styles.overallPercentage}>60% complete</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.estLabel}>Est. completion</Text>
              <Text style={styles.estDate}>14 Jun 2026</Text>
            </View>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '60%' }]} />
          </View>
          <View style={styles.overallFooter}>
            <Text style={styles.stepText}>Step 3 of 5</Text>
            <Text style={styles.scheduleText}>On schedule</Text>
          </View>
        </View>

        <View style={styles.timelineContainer}>
          <View style={styles.timelineItem}>
            <View style={styles.leftColumn}>
              <View style={[styles.statusCircle, styles.completedCircle]}>
                <Text style={styles.completedCheck}>✓</Text>
              </View>
              <View style={[styles.timelineLine, styles.activeLine]} />
            </View>
            <View style={styles.rightColumn}>
              <Text style={styles.stepTitle}>Order placed & paid</Text>
              <Text style={styles.stepDesc}>Payment of $459 confirmed. Order #CV-2026-04821 created.</Text>
              <Text style={styles.timestamp}>🕒 6 Jun, 5:42 PM</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.leftColumn}>
              <View style={[styles.statusCircle, styles.completedCircle]}>
                <Text style={styles.completedCheck}>✓</Text>
              </View>
              <View style={[styles.timelineLine, styles.activeLine]} />
            </View>
            <View style={styles.rightColumn}>
              <Text style={styles.stepTitle}>Documents verified</Text>
              <Text style={styles.stepDesc}>All 3 shareholders passed KYC. Passports and address proofs approved.</Text>
              <Text style={styles.timestamp}>🕒 7 Jun, 11:20 AM</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.leftColumn}>
              <View style={[styles.statusCircle, styles.inProgressCircle]}>
                <View style={styles.goldDot} />
              </View>
              <View style={[styles.timelineLine, styles.inactiveLine]} />
            </View>
            <View style={styles.rightColumn}>
              <Text style={styles.stepTitleActive}>Filing with Delaware</Text>
              <Text style={styles.stepDesc}>Certificate of Formation submitted to the Delaware Division of Corporations. Awaiting state approval.</Text>
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText}>In progress - 2–4 days</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.leftColumn}>
              <View style={[styles.statusCircle, styles.pendingCircle]}>
                <View style={styles.grayDot} />
              </View>
              <View style={[styles.timelineLine, styles.inactiveLine]} />
            </View>
            <View style={styles.rightColumn}>
              <Text style={styles.stepTitlePending}>EIN application</Text>
              <Text style={styles.stepDescPending}>Federal Tax ID requested from the IRS once formation is approved.</Text>
              <Text style={styles.stepNotePending}>Typically 1–2 days after formation</Text>
            </View>
          </View>

          <View style={[styles.timelineItem, { marginBottom: s(10) }]}>
            <View style={styles.leftColumn}>
              <View style={[styles.statusCircle, styles.pendingCircle]}>
                <View style={styles.grayDot} />
              </View>
            </View>
            <View style={styles.rightColumn}>
              <Text style={styles.stepTitlePending}>Documents delivered</Text>
              <Text style={styles.stepDescPending}>Formation certificate, EIN letter, operating agreement and banking pack issued to your dashboard.</Text>
              <Text style={styles.stepNotePending}>Final step</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>YOUR DOCUMENTS</Text>
          <View style={styles.line} />
        </View>

        <View style={[styles.documentCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
          <View style={styles.docIconBox}>
            <Text style={styles.docIcon}>📄</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={[styles.docTitle, { color: colors.text }]}>Certificate of Formation</Text>
            <Text style={[styles.docSubText, { color: colors.muted }]}>Available once state approves</Text>
          </View>
          <Text style={[styles.pendingStatus, { color: colors.muted }]}>Pending</Text>
        </View>

        <View style={[styles.documentCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
          <View style={styles.docIconBox}>
            <Text style={styles.docIcon}>📑</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>EIN confirmation letter</Text>
            <Text style={styles.docSubText}>Available after IRS approval</Text>
          </View>
          <Text style={styles.pendingStatus}>Pending</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default RegistrationProgressScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070C16' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: s(16), paddingBottom: s(8) },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' },
  iconText: { color: '#9CA3AF', fontSize: 16, fontWeight: 'bold' },
  logoImage: { width: 130, height: 32 },
  scrollContainer: { paddingHorizontal: s(16), paddingTop: s(20), paddingBottom: s(40) },
  titleContainer: { marginBottom: s(20) },
  mainTitle: { fontSize: 26, color: '#FFFFFF' },
  italicTitle: { fontStyle: 'italic', color: '#EAB308' },
  subTitle: { color: '#9CA3AF', fontSize: 13, marginTop: s(4) },
  overallCard: { backgroundColor: '#0F172A', borderRadius: 14, borderWidth: 1, borderColor: '#1E293B', padding: s(16), marginBottom: s(24) },
  overallHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: s(12) },
  overallLabel: { color: '#6B7280', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  overallPercentage: { color: '#EAB308', fontSize: 24, marginTop: s(2) },
  estLabel: { color: '#6B7280', fontSize: 12 },
  estDate: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginTop: s(2) },
  progressBarBackground: { height: 4, backgroundColor: '#1E293B', borderRadius: 2, marginBottom: s(12) },
  progressBarFill: { height: '100%', backgroundColor: '#EAB308', borderRadius: 2 },
  overallFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  stepText: { color: '#9CA3AF', fontSize: 13 },
  scheduleText: { color: '#10B981', fontSize: 13, fontWeight: '600' },
  timelineContainer: { paddingLeft: s(4), marginBottom: s(10) },
  timelineItem: { flexDirection: 'row', marginBottom: s(24) },
  leftColumn: { alignItems: 'center', marginRight: s(14), width: 24 },
  statusCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  completedCircle: { backgroundColor: '#059669' },
  completedCheck: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  inProgressCircle: { borderWidth: 1.5, borderColor: '#EAB308', backgroundColor: '#070C16' },
  goldDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EAB308' },
  pendingCircle: { borderWidth: 1, borderColor: '#374151', backgroundColor: '#070C16' },
  grayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#374151' },
  timelineLine: { width: 2, position: 'absolute', top: 24, bottom: -24 },
  activeLine: { backgroundColor: '#059669' },
  inactiveLine: { backgroundColor: '#1E293B' },
  rightColumn: { flex: 1, paddingTop: s(2) },
  stepTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  stepTitleActive: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  stepTitlePending: { color: '#9CA3AF', fontSize: 15, fontWeight: '600' },
  stepDesc: { color: '#9CA3AF', fontSize: 13, lineHeight: 18, marginTop: s(4) },
  stepDescPending: { color: '#6B7280', fontSize: 13, lineHeight: 18, marginTop: s(4) },
  timestamp: { color: '#6B7280', fontSize: 12, marginTop: s(6) },
  stepNotePending: { color: '#4B5563', fontSize: 12, marginTop: s(6) },
  badgeContainer: { flexDirection: 'row', marginTop: s(10) },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(234, 179, 8, 0.1)', borderWidth: 1, borderColor: 'rgba(234, 179, 8, 0.4)', paddingHorizontal: s(12), paddingVertical: s(6), borderRadius: 16 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EAB308', marginRight: s(8) },
  badgeText: { color: '#EAB308', fontSize: 12, fontWeight: 'bold' },
  sectionHeaderContainer: { flexDirection: 'row', alignItems: 'center', marginTop: s(10), marginBottom: s(16) },
  line: { flex: 1, height: 1, backgroundColor: '#1E293B' },
  sectionHeader: { color: '#6B7280', fontSize: 12, fontWeight: 'bold', marginRight: s(12), letterSpacing: 1 },
  documentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 14, borderWidth: 1, borderColor: '#1E293B', padding: s(14), marginBottom: s(12) },
  docIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginRight: s(12) },
  docIcon: { fontSize: 18 },
  docInfo: { flex: 1 },
  docTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  docSubText: { color: '#6B7280', fontSize: 12, marginTop: s(2) },
  pendingStatus: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
});
