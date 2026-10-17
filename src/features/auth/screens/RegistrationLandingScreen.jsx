import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { font } from '../../../theme/typography';
import { s } from '../../../theme/responsive';
import { useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';

const RegistrationLandingScreen = ({ navigation }) => {
  // Add-Company flow me user already logged in hota hai.
  const isAuthenticated = useAppSelector(st => st?.auth?.isAuthenticated);
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const jurisdictionsRow1 = [
    { code: 'US', label: 'USA' },
    { code: 'AE', label: 'UAE' },
    { code: 'GB', label: 'UK' },
    { code: 'SG', label: 'Singapore' },
    { code: 'HK', label: 'Hong Kong' },
    { code: 'CA', label: 'Canada' },
    { code: 'AU', label: 'Australia' },
  ];

  const jurisdictionsRow2 = [
    { code: 'NL', label: 'Netherlands' },
    { code: 'IE', label: 'Ireland' },
    { code: 'CH', label: 'Switzerland' },
    { code: 'DE', label: 'Germany' },
    { code: 'EE', label: 'Estonia' },
    { code: 'IN', label: 'India' },
    { code: '+37', label: 'More' },
  ];

  const FLAGS = {
    US: '🇺🇸', AE: '🇦🇪', GB: '🇬🇧', SG: '🇸🇬', HK: '🇭🇰',
    CA: '🇨🇦', AU: '🇦🇺', NL: '🇳🇱', IE: '🇮🇪', CH: '🇨🇭',
    DE: '🇩🇪', EE: '🇪🇪', IN: '🇮🇳',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} transparent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={[styles.mainTitle, { color: colors.text }]}>
              Your Company,{' '}
              Registered in <Text style={styles.italicTitle}>days</Text>
              {'\n'} — not months.
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Incorporate in the US or 50+ countries. Compliance, banking and filings — handled.
            </Text>
          </View>

          {/* Jurisdictions Grid */}
          <View style={styles.jurisdictionSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#475569' : colors.subtle }]}>REGISTER IN 50+ JURISDICTIONS</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridRow}>
              {jurisdictionsRow1.map((item, index) => (
                <TouchableOpacity key={index} style={styles.countryItem} activeOpacity={0.7} onPress={() => navigation.navigate('RegisterJurisdiction')}>
                  <View style={[styles.countryBadge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]}>
                    <Text style={styles.flagEmoji}>{FLAGS[item.code] || item.code}</Text>
                  </View>
                  <Text style={[styles.countryLabel, { color: colors.muted }]} numberOfLines={1}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridRow}>
              {jurisdictionsRow2.map((item, index) => (
                <TouchableOpacity key={index} style={styles.countryItem} activeOpacity={0.7} onPress={() => navigation.navigate('RegisterJurisdiction')}>
                  <View style={[styles.countryBadge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }, item.code === '+37' && styles.moreBadge]}>
                    {item.code === '+37' ? (
                      <Text style={[styles.countryCode, styles.moreText]}>{item.code}</Text>
                    ) : (
                      <Text style={styles.flagEmoji}>{FLAGS[item.code] || item.code}</Text>
                    )}
                  </View>
                  <Text style={[styles.countryLabel, { color: colors.muted }]} numberOfLines={1}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* How It Works */}
          <View style={[styles.howItWorksCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]}>
            <Text style={[styles.cardHeader, { color: isDark ? '#475569' : colors.subtle }]}>HOW IT WORKS</Text>
            <View style={styles.stepperRow}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.goldStep]}>
                  <Ionicons name="globe" size={14} color="#C9A84C" />
                </View>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Pick country</Text>
                <Text style={[styles.stepSub, { color: colors.muted }]}>& state</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]} />
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.blueStep]}>
                  <Ionicons name="document-text" size={14} color="#3B82F6" />
                </View>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Add details</Text>
                <Text style={[styles.stepSub, { color: colors.muted }]}>3 minutes</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]} />
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.tealStep]}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                </View>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Incorporated</Text>
                <Text style={[styles.stepSub, { color: colors.muted }]}>5-7 days</Text>
              </View>
            </View>
          </View>

          {/* Live Toast */}
          <View style={[styles.toastContainer, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.08)', borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.35)' }]}>
            <View style={styles.greenDot} />
            <Text style={[styles.toastText, { color: colors.muted }]}>
              <Text style={[styles.toastBold, { color: colors.text }]}>Michael R.</Text> just registered a Delaware LLC
            </Text>
            <Text style={[styles.toastTime, { color: colors.subtle }]}>2m ago</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresRow}>
            <Text style={[styles.featureItem, { color: colors.muted }]}>✓ No payment now</Text>
            <Text style={[styles.featureDivider, { color: isDark ? '#334155' : colors.border }]}>|</Text>
            <Text style={[styles.featureItem, { color: colors.muted }]}>🕒 Takes 3 minutes</Text>
          </View>

        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.authContainer}>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground }]} activeOpacity={0.8} onPress={() => navigation.navigate('RegisterJurisdiction')}>
            <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>🏢   Start My Company   →</Text>
          </TouchableOpacity>

          {/* Add-Company flow me user pehle se login hai. "Existing Client? Log in"
              CTA yahan bekaar tha (Login route RegistrationStack me registered
              nahi hai), is liye logged-in state me chhupa diya. */}
          {!isAuthenticated && (
            <TouchableOpacity style={[styles.loginBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border }]} activeOpacity={0.8} onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginBtnText, { color: colors.text }]}>
                Existing Client? <Text style={styles.goldText}>Log in</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default RegistrationLandingScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(24) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: s(16), marginTop: s(38) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  heroSection: { marginBottom: s(20) },
  mainTitle: {
    fontSize: font.display,
    fontWeight: '400',
    lineHeight: 34,
    marginBottom: s(10),
  },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  subtitle: { fontSize: 12, lineHeight: 18 },
  jurisdictionSection: { marginBottom: s(16) },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(10) },
  sectionHeader: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1.2 },
  viewAllText: { color: '#C9A84C', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  gridRow: { marginBottom: s(10) },
  countryItem: { alignItems: 'center', marginRight: s(10), width: 44 },
  countryBadge: {
    width: 42, height: 42, borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: s(4),
  },
  moreBadge: { borderColor: 'rgba(201, 168, 76, 0.4)' },
  moreText: { color: '#C9A84C', fontWeight: 'bold' },
  countryCode: { fontSize: 13, fontWeight: '600' },
  flagEmoji: { fontSize: 32 },
  countryLabel: { fontSize: 10, textAlign: 'center' },
  howItWorksCard: {
    width: '100%',
    borderRadius: s(16), padding: s(14),
    borderWidth: 1,
    marginTop: s(16),
    marginBottom: s(14),
  },
  cardHeader: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: s(12) },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: s(6),
  },
  goldStep: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.1)' },
  blueStep: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  tealStep: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  stepTitle: { fontSize: 12, fontWeight: '500' },
  stepSub: { fontSize: 10 },
  stepLine: { width: 20, height: 1, marginTop: -14 },
  toastContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, paddingVertical: s(8), paddingHorizontal: s(12),
    borderWidth: 1,
    marginBottom: s(12),
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: s(8) },
  toastText: { flex: 1, fontSize: 10 },
  toastBold: { fontWeight: 'bold' },
  toastTime: { fontSize: 9 },
  featuresRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: s(16) },
  featureItem: { fontSize: 10 },
  featureDivider: { marginHorizontal: s(10) },
  authContainer: { marginTop: s(40), paddingBottom: s(20) },
  primaryBtn: {
    borderRadius: 24, paddingVertical: s(14),
    alignItems: 'center', marginBottom: s(10),
  },
  primaryBtnText: { fontSize: 14, fontWeight: 'bold' },
  loginBtn: {
    borderRadius: 24, paddingVertical: s(14),
    alignItems: 'center', borderWidth: 1,
    marginBottom: s(16),
  },
  loginBtnText: { fontSize: 13, fontWeight: '600' },
  goldText: { color: '#C9A84C' },
});
