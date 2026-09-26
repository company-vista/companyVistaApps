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
import { useThemeColors } from '../../../../../theme/colors';
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
            <View style={[styles.iconBox, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: '#EAB308' }]}>
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
        <View style={[styles.infoCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C16',
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goldText: {
    color: '#EAB308',
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
    borderColor: 'rgba(234, 179, 8, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.02)',
  },
  iconBox: {
    width: 80,
    height: 90,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentIcon: {
    fontSize: 30,
    color: '#EAB308',
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: s(16),
    paddingHorizontal: s(10),
  },
  mainTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: '#EAB308',
  },
  subTitle: {
    color: '#9CA3AF',
    fontSize: 14,
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
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderWidth: 1,
    borderColor: '#EAB308',
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAB308',
    marginRight: s(8),
  },
  statusText: {
    color: '#EAB308',
    fontSize: 13,
    fontWeight: 'bold',
  },
  verifiedCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 12,
    padding: s(14),
    marginBottom: s(12),
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: s(14),
    marginBottom: s(24),
  },
  clockCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  clockIcon: {
    fontSize: 13,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardSubText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: s(2),
  },
  trackButton: {
    width: '100%',
    backgroundColor: '#EAB308',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: s(12),
  },
  trackButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
});
