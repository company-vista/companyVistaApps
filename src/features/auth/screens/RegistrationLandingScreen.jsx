import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';

const RegistrationLandingScreen = ({ navigation }) => {
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.mainTitle}>
              Your Company,{' '}
              Registered in <Text style={styles.italicTitle}>days</Text>
             {'\n'} — not months.
            </Text>
            <Text style={styles.subtitle}>
              Incorporate in the US or 50+ countries. Compliance, banking and filings — handled.
            </Text>
          </View>

          {/* Jurisdictions Grid */}
          <View style={styles.jurisdictionSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>REGISTER IN 50+ JURISDICTIONS</Text>
              {/* <TouchableOpacity>
                <Text style={styles.viewAllText}>VIEW ALL →</Text>
              </TouchableOpacity> */}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridRow}>
              {jurisdictionsRow1.map((item, index) => (
                <View key={index} style={styles.countryItem}>
                  <View style={[styles.countryBadge, item.code === 'US' && styles.activeCountryBadge]}>
                    <Text style={styles.flagEmoji}>{FLAGS[item.code] || item.code}</Text>
                  </View>
                  <Text style={styles.countryLabel} numberOfLines={1}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridRow}>
              {jurisdictionsRow2.map((item, index) => (
                <View key={index} style={styles.countryItem}>
                  <View style={[styles.countryBadge, item.code === '+37' && styles.moreBadge]}>
                    {item.code === '+37' ? (
                      <Text style={[styles.countryCode, styles.moreText]}>{item.code}</Text>
                    ) : (
                      <Text style={styles.flagEmoji}>{FLAGS[item.code] || item.code}</Text>
                    )}
                  </View>
                  <Text style={styles.countryLabel} numberOfLines={1}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* How It Works */}
          <View style={styles.howItWorksCard}>
            <Text style={styles.cardHeader}>HOW IT WORKS</Text>
            <View style={styles.stepperRow}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.goldStep]}>
                  <Ionicons name="globe" size={14} color="#C9A84C" />
                </View>
                <Text style={styles.stepTitle}>Pick country</Text>
                <Text style={styles.stepSub}>& state</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.blueStep]}>
                  <Ionicons name="document-text" size={14} color="#3B82F6" />
                </View>
                <Text style={styles.stepTitle}>Add details</Text>
                <Text style={styles.stepSub}>3 minutes</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.tealStep]}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                </View>
                <Text style={styles.stepTitle}>Incorporated</Text>
                <Text style={styles.stepSub}>5-7 days</Text>
              </View>
            </View>
          </View>

          {/* Live Toast */}
          <View style={styles.toastContainer}>
            <View style={styles.greenDot} />
            <Text style={styles.toastText}>
              <Text style={styles.toastBold}>Michael R.</Text> just registered a Delaware LLC
            </Text>
            <Text style={styles.toastTime}>2m ago</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresRow}>
            <Text style={styles.featureItem}>✓ No payment now</Text>
            <Text style={styles.featureDivider}>|</Text>
            <Text style={styles.featureItem}>🕒 Takes 3 minutes</Text>
          </View>

        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.authContainer}>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={() => navigation.navigate('CountrySelection')}>
            <Text style={styles.primaryBtnText}>🏢   Start My Company   →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} activeOpacity={0.8} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>
              Existing Client? <Text style={styles.goldText}>Log in</Text>
            </Text>
          </TouchableOpacity>


        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default RegistrationLandingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060913' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, marginTop: 38 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  heroSection: { marginBottom: 20 },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 34,
    marginBottom: 10,
  },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  subtitle: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },
  jurisdictionSection: { marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionHeader: { color: '#475569', fontSize: 9, fontWeight: 'bold', letterSpacing: 1.2 },
  viewAllText: { color: '#C9A84C', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  gridRow: { marginBottom: 10 },
  countryItem: { alignItems: 'center', marginRight: 10, width: 44 },
  countryBadge: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  activeCountryBadge: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.1)' },
  activeCountryText: { color: '#C9A84C' },
  moreBadge: { borderColor: 'rgba(201, 168, 76, 0.4)' },
  moreText: { color: '#C9A84C', fontWeight: 'bold' },
  countryCode: { color: '#CBD5E1', fontSize: 12, fontWeight: '600' },
  flagEmoji: { fontSize: 22 },
  countryLabel: { color: '#64748B', fontSize: 9, textAlign: 'center' },
  howItWorksCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 16,
    marginBottom: 14,
  },
  cardHeader: { color: '#475569', fontSize: 9, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: 12 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: 6,
  },
  goldStep: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.1)' },
  blueStep: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  tealStep: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  stepTitle: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  stepSub: { color: '#64748B', fontSize: 9 },
  stepLine: { width: 20, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginTop: -14 },
  toastContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 12,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 8 },
  toastText: { flex: 1, color: '#94A3B8', fontSize: 10 },
  toastBold: { color: '#FFFFFF', fontWeight: 'bold' },
  toastTime: { color: '#64748B', fontSize: 9 },
  featuresRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  featureItem: { color: '#64748B', fontSize: 10 },
  featureDivider: { color: '#334155', marginHorizontal: 10 },
  authContainer: { marginTop: 40, paddingBottom: 20 },
  primaryBtn: {
    backgroundColor: '#D4AF37', borderRadius: 24, paddingVertical: 14,
    alignItems: 'center', marginBottom: 10,
  },
  primaryBtnText: { color: '#060913', fontSize: 14, fontWeight: 'bold' },
  loginBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 24, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  loginBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  goldText: { color: '#C9A84C' },
});
