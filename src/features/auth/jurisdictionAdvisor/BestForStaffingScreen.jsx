import React from 'react';
import { s } from '../../../theme/responsive';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { font } from '../../../theme/typography';
import { themePalette, useThemeColors } from '../../../theme/colors';

const FILTER_TAGS = [
  { id: '1', label: '👥 Staffing & Recruiting' },
  { id: '2', label: '🇺🇸 US clients' },
  { id: '3', label: 'Banking - Credibility' },
  { id: '4', label: 'Edit', isAction: true },
];

const FEATURES = [
  {
    boldText: 'US clients contract with US entities.',
    normalText: ' MSAs and vendor onboarding rarely accept foreign suppliers.',
  },
  {
    boldText: 'Payroll and W-2 infrastructure',
    normalText: ' is mature — Gusto, Rippling and ADP all integrate directly.',
  },
  {
    boldText: "Workers' comp and liability cover",
    normalText: ' is straightforward to obtain and expected by clients.',
  },
  {
    boldText: 'EIN enables payroll withholding',
    normalText: ' in every state you place workers.',
  },
];

export default function BestForStaffingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>
          Best for <Text style={styles.titleItalic}>staffing</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Placing workers changes the rules — here's why.
        </Text>

        <View style={styles.tagsContainer}>
          {FILTER_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagPill,
                { backgroundColor: isDark ? themePalette.hex_151329 : colors.surface, borderColor: isDark ? themePalette.hex_2d264a : colors.border },
                tag.isAction && { backgroundColor: isDark ? themePalette.hex_121724 : colors.surfaceAlt, borderColor: isDark ? themePalette.hex_1e2638 : colors.border },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tagText, { color: isDark ? themePalette.hex_a5b4fc : colors.primary }]}>{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.offshoreNoticeCard, { backgroundColor: isDark ? themePalette.hex_141212 : '#FFF7ED', borderColor: isDark ? themePalette.hex_3d2d1b : '#FED7AA' }]}>
          <View style={styles.noticeHeader}>
            <View style={[styles.warningIconBadge, { backgroundColor: isDark ? themePalette.hex_261f13 : '#FFEDD5' }]}>
              <Text style={styles.warningIcon}>⚠️</Text>
            </View>
            <Text style={[styles.noticeTitle, { color: colors.text }]}>Offshore won't work for staffing</Text>
          </View>
          <Text style={[styles.noticeDescription, { color: colors.muted }]}>
            BVI, Cayman, Belize and Seychelles cannot practically employ or place workers — no payroll infrastructure, and US clients won't contract with them. We've excluded them.
          </Text>
        </View>

        <View style={[styles.matchCard, { backgroundColor: isDark ? themePalette.hex_121622 : colors.surface, borderColor: isDark ? themePalette.hex_3d321d : '#E5D5A8' }]}>
          <View style={[styles.bestMatchBadge, { backgroundColor: isDark ? themePalette.hex_262013 : '#FFFBEB', borderColor: themePalette.hex_d1a253 }]}>
            <Text style={styles.badgeText}>★ BEST MATCH</Text>
          </View>

          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={[styles.countryCodeText, { color: isDark ? themePalette.hex_334155 : colors.subtle }]}>US</Text>
              <View>
                <Text style={[styles.countryName, { color: colors.text }]}>United States</Text>
                <Text style={[styles.stateSubtitle, { color: colors.muted }]}>LLC or C-Corp · formation state secondary</Text>
              </View>
            </View>
            <View style={styles.matchPercentageContainer}>
              <Text style={styles.matchPercentage}>95%</Text>
              <Text style={[styles.matchLabel, { color: colors.subtle }]}>MATCH</Text>
            </View>
          </View>

          <View style={[styles.featuresList, { borderColor: isDark ? themePalette.hex_1e2638 : colors.border }]}>
            {FEATURES.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={[styles.featureText, { color: colors.muted }]}>
                  <Text style={[styles.featureBold, { color: colors.text }]}>{item.boldText}</Text>
                  {item.normalText}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: s(16) + insets.bottom, backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.actionButton, !isDark && { backgroundColor: themePalette.hex_2563eb }]} activeOpacity={0.8}>
          <Text style={[styles.actionButtonText, !isDark && { color: themePalette.hex_ffffff }]}>Continue with United States  →</Text>
        </TouchableOpacity>
        <Text style={[styles.addonText, { color: colors.subtle }]}>Staffing add-ons available at checkout</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: s(8), paddingHorizontal: s(16), paddingVertical: s(12), marginTop: s(24) },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(20) },
  title: { fontSize: font.display, fontWeight: '500', marginTop: s(8) },
  titleItalic: { fontStyle: 'italic', color: themePalette.hex_d1a253, fontWeight: '300', fontFamily: 'serif' },
  subtitle: { fontSize: font.bodySmall, marginTop: s(6), marginBottom: s(16) },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8), marginBottom: s(20) },
  tagPill: { paddingHorizontal: s(12), paddingVertical: s(6), borderRadius: 16, borderWidth: 1 },
  tagText: { fontSize: font.sm, fontWeight: '500' },
  offshoreNoticeCard: { borderRadius: 16, borderWidth: 1, padding: s(16), marginBottom: s(20) },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: s(8) },
  warningIconBadge: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: s(10) },
  warningIcon: { fontSize: font.base },
  noticeTitle: { fontSize: font.md, fontWeight: 'bold' },
  noticeDescription: { fontSize: font.sm, lineHeight: 18 },
  matchCard: { borderRadius: 20, borderWidth: 1, padding: s(16), marginBottom: s(20) },
  bestMatchBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 12, paddingHorizontal: s(10), paddingVertical: s(4), marginBottom: s(16) },
  badgeText: { color: themePalette.hex_d1a253, fontSize: font.xs, fontWeight: 'bold', letterSpacing: 0.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-start', gap: s(8), alignItems: 'center', marginBottom: s(20) },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  countryCodeText: { fontSize: font.displayMedium, fontWeight: 'bold', marginRight: s(12) },
  countryName: { fontSize: font.hero, fontWeight: 'bold' },
  stateSubtitle: { fontSize: font.small, marginTop: s(2) },
  matchPercentageContainer: { alignItems: 'flex-end', marginLeft: s(8) },
  matchPercentage: { color: themePalette.hex_d1a253, fontSize: font.displayMedium, fontWeight: '300' },
  matchLabel: { fontSize: font.caption, fontWeight: 'bold', letterSpacing: 1 },
  featuresList: { borderTopWidth: 1, paddingTop: s(16) },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: s(12) },
  checkIcon: { color: themePalette.hex_10b981, fontSize: font.base, marginRight: s(10), marginTop: s(1) },
  featureText: { fontSize: font.bodySmall, lineHeight: 18, flex: 1 },
  featureBold: { fontWeight: 'bold' },
  bottomContainer: { paddingHorizontal: s(16), paddingTop: s(12), alignItems: 'center' },
  actionButton: { backgroundColor: themePalette.hex_d1a253, borderRadius: 14, height: 52, width: '100%', alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { color: themePalette.hex_0b0e17, fontSize: font.md, fontWeight: '700' },
  addonText: { fontSize: font.sm, marginTop: s(10) },
});
