import { font } from '../../../../../theme/typography';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../../theme/colors';
import { s } from '../../../../../theme/responsive';

const SuccessScreen = ({ onTrackPress }) => {
  const colors = useThemeColors(); const isLight = colors.mode === 'light';
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top Header Logo */}
        <View style={styles.header}>
          <Text style={[styles.logoText, { color: colors.text }]}>
            Company<Text style={styles.goldText}>Vista</Text>
          </Text>
        </View>

        {/* Success Icon Graphic */}
        <View style={styles.iconWrapper}>
          <View style={styles.outerCircle}>
            <View style={[styles.iconBox, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: themePalette.hex_eab308 }]}>
              <Text style={styles.documentIcon}>📄✓</Text>
            </View>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            We have <Text style={styles.italicTitle}>everything</Text>
          </Text>
          <Text style={[styles.subTitle, { color: colors.muted }]}>
            All documents verified. Your Delaware filing has been submitted to the state.
          </Text>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadgeContainer}>
          <View style={styles.statusBadge}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>Filing in progress</Text>
          </View>
        </View>

        {/* Item 1: Shareholders Verified */}
        <View style={[styles.verifiedCard, { borderColor: colors.border }]}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <View style={styles.cardDetails}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>3 shareholders verified</Text>
            <Text style={[styles.cardSubText, { color: colors.muted }]}>All KYC approved</Text>
          </View>
        </View>

        {/* Item 2: Payment Settled */}
        <View style={[styles.verifiedCard, { borderColor: colors.border }]}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <View style={styles.cardDetails}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Payment settled</Text>
            <Text style={[styles.cardSubText, { color: colors.muted }]}>$459 · Order #CV-2026-04821</Text>
          </View>
        </View>

        {/* Item 3: Estimated Completion */}
        <View style={[styles.infoCard, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }]}>
          <View style={styles.clockCircle}>
            <Text style={styles.clockIcon}>🕒</Text>
          </View>
          <View style={styles.cardDetails}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Estimated completion</Text>
            <Text style={[styles.cardSubText, { color: colors.muted }]}>5–7 business days · by 14 June 2026</Text>
          </View>
        </View>

        {/* Track Progress Button */}
        <TouchableOpacity style={styles.trackButton} onPress={onTrackPress}>
          <Text style={styles.trackButtonText}>Track Progress →</Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={[styles.footerText, { color: colors.muted }]}>We'll email you at every milestone</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SuccessScreen;

const styles = makeThemeStyles(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themePalette.hex_070c16,
  },
  scrollContainer: {
    paddingHorizontal: s(20),
    paddingTop: s(10),
    paddingBottom: s(30),
    alignItems: 'center',
  },
  header: {
    marginBottom: s(20),
    alignItems: 'center',
  },
  logoText: {
    color: themePalette.hex_ffffff,
    fontSize: font.xxl,
    fontWeight: 'bold',
  },
  goldText: {
    color: themePalette.hex_eab308,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: s(10),
  },
  outerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: themePalette.rgba_234_179_8_0_2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themePalette.rgba_234_179_8_0_02,
  },
  iconBox: {
    width: 80,
    height: 90,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: themePalette.hex_eab308,
    backgroundColor: themePalette.hex_0f172a,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentIcon: {
    fontSize: font.displayXXL,
    color: themePalette.hex_eab308,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: s(16),
    paddingHorizontal: s(10),
  },
  mainTitle: {
    fontSize: font.displayXL,
    color: themePalette.hex_ffffff,
    textAlign: 'center',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: themePalette.hex_eab308,
  },
  subTitle: {
    color: themePalette.hex_9ca3af,
    fontSize: font.base,
    textAlign: 'center',
    marginTop: s(8),
    lineHeight: 20,
  },
  statusBadgeContainer: {
    alignItems: 'center',
    marginBottom: s(24),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themePalette.rgba_234_179_8_0_1,
    borderWidth: 1,
    borderColor: themePalette.hex_eab308,
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: themePalette.hex_eab308,
    marginRight: s(8),
  },
  statusText: {
    color: themePalette.hex_eab308,
    fontSize: font.bodySmall,
    fontWeight: 'bold',
  },
  verifiedCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themePalette.rgba_16_185_129_0_05,
    borderWidth: 1,
    borderColor: themePalette.hex_059669,
    borderRadius: 12,
    padding: s(14),
    marginBottom: s(12),
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: themePalette.hex_059669,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  checkIcon: {
    color: themePalette.hex_ffffff,
    fontSize: font.base,
    fontWeight: 'bold',
  },
  infoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themePalette.hex_0f172a,
    borderWidth: 1,
    borderColor: themePalette.hex_1e293b,
    borderRadius: 12,
    padding: s(14),
    marginBottom: s(24),
  },
  clockCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: themePalette.hex_1e293b,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  clockIcon: {
    fontSize: font.bodySmall,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    color: themePalette.hex_ffffff,
    fontSize: font.md,
    fontWeight: 'bold',
  },
  cardSubText: {
    color: themePalette.hex_9ca3af,
    fontSize: font.sm,
    marginTop: s(2),
  },
  trackButton: {
    width: '100%',
    backgroundColor: themePalette.hex_eab308,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: s(12),
  },
  trackButtonText: {
    color: themePalette.hex_000000,
    fontSize: font.md,
    fontWeight: 'bold',
  },
  footerText: {
    color: themePalette.hex_6b7280,
    fontSize: font.sm,
    textAlign: 'center',
  },
}));
