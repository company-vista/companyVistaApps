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
import { themePalette, makeThemeStyles } from '../../../theme/colors';

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
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={themePalette.hex_0b0e17} />

      {/* Top Header Navigation */}
      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>
          Best for <Text style={styles.titleItalic}>staffing</Text>
        </Text>
        <Text style={styles.subtitle}>
          Placing workers changes the rules — here's why.
        </Text>

        {/* Filter Tags */}
        <View style={styles.tagsContainer}>
          {FILTER_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagPill,
                tag.isAction && styles.actionTagPill,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.tagText}>{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Warning Box */}
        <View style={styles.offshoreNoticeCard}>
          <View style={styles.noticeHeader}>
            <View style={styles.warningIconBadge}>
              <Text style={styles.warningIcon}>⚠️</Text>
            </View>
            <Text style={styles.noticeTitle}>
              Offshore won't work for staffing
            </Text>
          </View>
          <Text style={styles.noticeDescription}>
            BVI, Cayman, Belize and Seychelles cannot practically employ or place workers — no payroll infrastructure, and US clients won't contract with them. We've excluded them.
          </Text>
        </View>

        {/* Best Match Main Card */}
        <View style={styles.matchCard}>
          {/* Badge */}
          <View style={styles.bestMatchBadge}>
            <Text style={styles.badgeText}>★ BEST MATCH</Text>
          </View>

          {/* Header Info */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.countryCodeText}>US</Text>
              <View>
                <Text style={styles.countryName}>United States</Text>
                <Text style={styles.stateSubtitle}>
                  LLC or C-Corp · formation state secondary
                </Text>
              </View>
            </View>

            <View style={styles.matchPercentageContainer}>
              <Text style={styles.matchPercentage}>95%</Text>
              <Text style={styles.matchLabel}>MATCH</Text>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            {FEATURES.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.featureText}>
                  <Text style={styles.featureBold}>{item.boldText}</Text>
                  {item.normalText}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomContainer, { paddingBottom: s(16) + insets.bottom }]}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
          <Text style={styles.actionButtonText}>
            Continue with us United States  →
          </Text>
        </TouchableOpacity>

        <Text style={styles.addonText}>
          Staffing add-ons available at checkout
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = makeThemeStyles(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themePalette.hex_0b0e17,
  },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: s(8),
    paddingHorizontal: s(16),
    paddingVertical: s(12),
    marginTop: s(24),
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: themePalette.hex_161b29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: themePalette.hex_94a3b8,
    fontSize: font.lg,
    fontWeight: 'bold',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    color: themePalette.hex_d1a253,
    fontSize: font.md,
    fontWeight: 'bold',
  },
  brandSubtitle: {
    color: themePalette.hex_64748b,
    fontSize: font.micro,
    letterSpacing: 1.2,
    marginTop: s(1),
  },
  scrollContent: {
    paddingHorizontal: s(16),
    paddingBottom: s(20),
  },
  title: {
    fontSize: font.display,
    fontWeight: '500',
    color: themePalette.hex_ffffff,
    marginTop: s(8),
  },
  titleItalic: {
    fontStyle: 'italic',
    color: themePalette.hex_d1a253,
    fontWeight: '300',
  },
  subtitle: {
    fontSize: font.bodySmall,
    color: themePalette.hex_64748b,
    marginTop: s(6),
    marginBottom: s(16),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(8),
    marginBottom: s(20),
  },
  tagPill: {
    backgroundColor: themePalette.hex_151329,
    paddingHorizontal: s(12),
    paddingVertical: s(6),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themePalette.hex_2d264a,
  },
  actionTagPill: {
    backgroundColor: themePalette.hex_121724,
    borderColor: themePalette.hex_1e2638,
  },
  tagText: {
    color: themePalette.hex_a5b4fc,
    fontSize: font.sm,
    fontWeight: '500',
  },
  offshoreNoticeCard: {
    backgroundColor: themePalette.hex_141212,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themePalette.hex_3d2d1b,
    padding: s(16),
    marginBottom: s(20),
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(8),
  },
  warningIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: themePalette.hex_261f13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(10),
  },
  warningIcon: {
    fontSize: font.base,
  },
  noticeTitle: {
    color: themePalette.hex_ffffff,
    fontSize: font.md,
    fontWeight: 'bold',
  },
  noticeDescription: {
    color: themePalette.hex_8a8d9b,
    fontSize: font.sm,
    lineHeight: 18,
  },
  matchCard: {
    backgroundColor: themePalette.hex_121622,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: themePalette.hex_3d321d,
    padding: s(16),
    marginBottom: s(20),
  },
  bestMatchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: themePalette.hex_262013,
    borderColor: themePalette.hex_d1a253,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    marginBottom: s(16),
  },
  badgeText: {
    color: themePalette.hex_d1a253,
    fontSize: font.xs,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: s(8),
    alignItems: 'center',
    marginBottom: s(20),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countryCodeText: {
    fontSize: font.displayMedium,
    fontWeight: 'bold',
    color: themePalette.hex_334155,
    marginRight: s(12),
  },
  countryName: {
    color: themePalette.hex_ffffff,
    fontSize: font.hero,
    fontWeight: 'bold',
  },
  stateSubtitle: {
    color: themePalette.hex_64748b,
    fontSize: font.small,
    marginTop: s(2),
  },
  matchPercentageContainer: {
    alignItems: 'flex-end',
    marginLeft: s(8),
  },
  matchPercentage: {
    color: themePalette.hex_d1a253,
    fontSize: font.displayMedium,
    fontWeight: '300',
  },
  matchLabel: {
    color: themePalette.hex_64748b,
    fontSize: font.caption,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  featuresList: {
    borderTopWidth: 1,
    borderColor: themePalette.hex_1e2638,
    paddingTop: s(16),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: s(12),
  },
  checkIcon: {
    color: themePalette.hex_10b981,
    fontSize: font.base,
    marginRight: s(10),
    marginTop: s(1),
  },
  featureText: {
    color: themePalette.hex_94a3b8,
    fontSize: font.bodySmall,
    lineHeight: 18,
    flex: 1,
  },
  featureBold: {
    color: themePalette.hex_ffffff,
    fontWeight: 'bold',
  },
  bottomContainer: {
    paddingHorizontal: s(16),
    paddingTop: s(12),
    paddingBottom: s(16),
    backgroundColor: themePalette.hex_0b0e17,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: themePalette.hex_d1a253,
    borderRadius: 14,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: themePalette.hex_0b0e17,
    fontSize: font.md,
    fontWeight: '700',
  },
  addonText: {
    color: themePalette.hex_475569,
    fontSize: font.sm,
    marginTop: s(10),
  },
}));
