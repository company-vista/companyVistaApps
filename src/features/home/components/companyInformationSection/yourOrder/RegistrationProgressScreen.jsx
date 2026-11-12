import { font } from '../../../../../theme/typography';
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
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../../theme/colors';
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

        <View style={[styles.overallCard, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }]}>
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

        <View style={[styles.documentCard, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }]}>
          <View style={styles.docIconBox}>
            <Text style={styles.docIcon}>📄</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={[styles.docTitle, { color: colors.text }]}>Certificate of Formation</Text>
            <Text style={[styles.docSubText, { color: colors.muted }]}>Available once state approves</Text>
          </View>
          <Text style={[styles.pendingStatus, { color: colors.muted }]}>Pending</Text>
        </View>

        <View style={[styles.documentCard, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }]}>
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

const styles = makeThemeStyles(() => StyleSheet.create({
  container: { flex: 1, backgroundColor: themePalette.hex_070c16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: s(16), paddingBottom: s(8) },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: themePalette.hex_111827, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: themePalette.hex_1f2937 },
  iconText: { color: themePalette.hex_9ca3af, fontSize: font.lg, fontWeight: 'bold' },
  logoImage: { width: 130, height: 32 },
  scrollContainer: { paddingHorizontal: s(16), paddingTop: s(20), paddingBottom: s(40) },
  titleContainer: { marginBottom: s(20) },
  mainTitle: { fontSize: font.displayLarge, color: themePalette.hex_ffffff },
  italicTitle: { fontStyle: 'italic', color: themePalette.hex_eab308 },
  subTitle: { color: themePalette.hex_9ca3af, fontSize: font.bodySmall, marginTop: s(4) },
  overallCard: { backgroundColor: themePalette.hex_0f172a, borderRadius: 14, borderWidth: 1, borderColor: themePalette.hex_1e293b, padding: s(16), marginBottom: s(24) },
  overallHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: s(12) },
  overallLabel: { color: themePalette.hex_6b7280, fontSize: font.small, fontWeight: 'bold', letterSpacing: 0.5 },
  overallPercentage: { color: themePalette.hex_eab308, fontSize: font.displayMedium, marginTop: s(2) },
  estLabel: { color: themePalette.hex_6b7280, fontSize: font.sm },
  estDate: { color: themePalette.hex_ffffff, fontSize: font.md, fontWeight: 'bold', marginTop: s(2) },
  progressBarBackground: { height: 4, backgroundColor: themePalette.hex_1e293b, borderRadius: 2, marginBottom: s(12) },
  progressBarFill: { height: '100%', backgroundColor: themePalette.hex_eab308, borderRadius: 2 },
  overallFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  stepText: { color: themePalette.hex_9ca3af, fontSize: font.bodySmall },
  scheduleText: { color: themePalette.hex_10b981, fontSize: font.bodySmall, fontWeight: '600' },
  timelineContainer: { paddingLeft: s(4), marginBottom: s(10) },
  timelineItem: { flexDirection: 'row', marginBottom: s(24) },
  leftColumn: { alignItems: 'center', marginRight: s(14), width: 24 },
  statusCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  completedCircle: { backgroundColor: themePalette.hex_059669 },
  completedCheck: { color: themePalette.hex_ffffff, fontSize: font.sm, fontWeight: 'bold' },
  inProgressCircle: { borderWidth: 1.5, borderColor: themePalette.hex_eab308, backgroundColor: themePalette.hex_070c16 },
  goldDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: themePalette.hex_eab308 },
  pendingCircle: { borderWidth: 1, borderColor: themePalette.hex_374151, backgroundColor: themePalette.hex_070c16 },
  grayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: themePalette.hex_374151 },
  timelineLine: { width: 2, position: 'absolute', top: 24, bottom: -24 },
  activeLine: { backgroundColor: themePalette.hex_059669 },
  inactiveLine: { backgroundColor: themePalette.hex_1e293b },
  rightColumn: { flex: 1, paddingTop: s(2) },
  stepTitle: { color: themePalette.hex_ffffff, fontSize: font.md, fontWeight: 'bold' },
  stepTitleActive: { color: themePalette.hex_ffffff, fontSize: font.lg, fontWeight: 'bold' },
  stepTitlePending: { color: themePalette.hex_9ca3af, fontSize: font.md, fontWeight: '600' },
  stepDesc: { color: themePalette.hex_9ca3af, fontSize: font.bodySmall, lineHeight: 18, marginTop: s(4) },
  stepDescPending: { color: themePalette.hex_6b7280, fontSize: font.bodySmall, lineHeight: 18, marginTop: s(4) },
  timestamp: { color: themePalette.hex_6b7280, fontSize: font.sm, marginTop: s(6) },
  stepNotePending: { color: themePalette.hex_4b5563, fontSize: font.sm, marginTop: s(6) },
  badgeContainer: { flexDirection: 'row', marginTop: s(10) },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.rgba_234_179_8_0_1, borderWidth: 1, borderColor: themePalette.rgba_234_179_8_0_4, paddingHorizontal: s(12), paddingVertical: s(6), borderRadius: 16 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: themePalette.hex_eab308, marginRight: s(8) },
  badgeText: { color: themePalette.hex_eab308, fontSize: font.sm, fontWeight: 'bold' },
  sectionHeaderContainer: { flexDirection: 'row', alignItems: 'center', marginTop: s(10), marginBottom: s(16) },
  line: { flex: 1, height: 1, backgroundColor: themePalette.hex_1e293b },
  sectionHeader: { color: themePalette.hex_6b7280, fontSize: font.sm, fontWeight: 'bold', marginRight: s(12), letterSpacing: 1 },
  documentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.hex_0f172a, borderRadius: 14, borderWidth: 1, borderColor: themePalette.hex_1e293b, padding: s(14), marginBottom: s(12) },
  docIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: themePalette.hex_1e293b, justifyContent: 'center', alignItems: 'center', marginRight: s(12) },
  docIcon: { fontSize: font.xxl },
  docInfo: { flex: 1 },
  docTitle: { color: themePalette.hex_ffffff, fontSize: font.md, fontWeight: 'bold' },
  docSubText: { color: themePalette.hex_6b7280, fontSize: font.sm, marginTop: s(2) },
  pendingStatus: { color: themePalette.hex_6b7280, fontSize: font.bodySmall, fontWeight: '500' },
}));
