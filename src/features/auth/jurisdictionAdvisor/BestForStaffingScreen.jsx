import React from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { font } from '../../../theme/typography';

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
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E17" />

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
      <View style={styles.bottomContainer}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E17',
  },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 24,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#161B29',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    color: '#D1A253',
    fontSize: 15,
    fontWeight: 'bold',
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: 7,
    letterSpacing: 1.2,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: font.display,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 8,
  },
  titleItalic: {
    fontStyle: 'italic',
    color: '#D1A253',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagPill: {
    backgroundColor: '#151329',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D264A',
  },
  actionTagPill: {
    backgroundColor: '#121724',
    borderColor: '#1E2638',
  },
  tagText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '500',
  },
  offshoreNoticeCard: {
    backgroundColor: '#141212',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3D2D1B',
    padding: 16,
    marginBottom: 20,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#261F13',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  warningIcon: {
    fontSize: 14,
  },
  noticeTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  noticeDescription: {
    color: '#8A8D9B',
    fontSize: 12,
    lineHeight: 18,
  },
  matchCard: {
    backgroundColor: '#121622',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3D321D',
    padding: 16,
    marginBottom: 20,
  },
  bestMatchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#262013',
    borderColor: '#D1A253',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 16,
  },
  badgeText: {
    color: '#D1A253',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countryCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
    marginRight: 12,
  },
  countryName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stateSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  matchPercentageContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  matchPercentage: {
    color: '#D1A253',
    fontSize: 24,
    fontWeight: '300',
  },
  matchLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  featuresList: {
    borderTopWidth: 1,
    borderColor: '#1E2638',
    paddingTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkIcon: {
    color: '#10B981',
    fontSize: 14,
    marginRight: 10,
    marginTop: 1,
  },
  featureText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  featureBold: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#0B0E17',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#D1A253',
    borderRadius: 14,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#0B0E17',
    fontSize: 15,
    fontWeight: '700',
  },
  addonText: {
    color: '#475569',
    fontSize: 12,
    marginTop: 10,
  },
});
