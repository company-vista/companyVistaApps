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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import logoR from '../../../assets/images/logoR.png';
import BackButton from '../../../components/buttons/BackButton';
import { Image } from 'react-native';

const BusinessServicesScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: -4, duration: 1800, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 4, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: 3, duration: 2200, useNativeDriver: true }),
        Animated.timing(float2, { toValue: -3, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float3, { toValue: -5, duration: 2600, useNativeDriver: true }),
        Animated.timing(float3, { toValue: 5, duration: 2600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Card 1 */}
          <Animated.View style={[styles.card, styles.goldCardBorder, { backgroundColor: 'rgba(201, 168, 76, 0.08)', transform: [{ translateY: float1 }] }]}>
              <View style={[styles.iconContainer, styles.goldIconBg]}>
                <Ionicons name="business" size={20} color="#C9A84C" />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: '#C9A84C' }]}>Company Registration</Text>
                <Text style={styles.cardSubtitle}>50+ jurisdictions · from $299</Text>
              </View>
            <View style={styles.greenBadge}>
              <Text style={styles.greenBadgeText}>7 days</Text>
            </View>
          </Animated.View>

          {/* Card 2 */}
          <Animated.View style={[styles.card, styles.blueCardBorder, { backgroundColor: 'rgba(59, 130, 246, 0.08)', transform: [{ translateY: float2 }] }]}>
              <View style={[styles.iconContainer, styles.blueIconBg]}>
                <Ionicons name="shield-checkmark" size={20} color="#60A5FA" />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: '#60A5FA' }]}>Compliance & Filings</Text>
                <Text style={styles.cardSubtitle}>Annual reports · registered agent</Text>
              </View>
            <View style={styles.blueBadge}>
              <Text style={styles.blueBadgeText}>Auto</Text>
            </View>
          </Animated.View>

          {/* Card 3 */}
          <Animated.View style={[styles.card, styles.tealCardBorder, { backgroundColor: 'rgba(20, 184, 166, 0.08)', transform: [{ translateY: float3 }] }]}>
              <View style={[styles.iconContainer, styles.tealIconBg]}>
                <Ionicons name="landmark" size={20} color="#34D399" />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: '#34D399' }]}>Business Banking</Text>
                <Text style={styles.cardSubtitle}>Multi-currency · remote setup</Text>
              </View>
            <View style={styles.tealBadge}>
              <Text style={styles.tealBadgeText}>USD-EUR</Text>
            </View>
          </Animated.View>

          {/* Pills */}
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
              <Ionicons name="location" size={11} color="#A78BFA" />
              <Text style={[styles.pillText, { color: '#A78BFA' }]}> Virtual Office</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: 'rgba(201, 168, 76, 0.15)', borderColor: 'rgba(201, 168, 76, 0.3)' }]}>
              <Ionicons name="document-text" size={11} color="#C9A84C" />
              <Text style={[styles.pillText, { color: '#C9A84C' }]}> Tax Filing</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
              <Ionicons name="ribbon" size={11} color="#60A5FA" />
              <Text style={[styles.pillText, { color: '#60A5FA' }]}> Trademark</Text>
            </View>
          </View>

          {/* Banner */}
          <View style={styles.banner}>
            <Ionicons name="checkmark-circle" size={14} color="#C9A84C" />
            <Text style={styles.bannerText}>  One platform · One dashboard · Zero hassle</Text>
          </View>
        </Animated.View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.sectionTagRow}>
            <View style={styles.goldLine} />
            <Text style={styles.sectionTag}>FULL-STACK BUSINESS SERVICES</Text>
          </View>

          <Text style={styles.mainTitle}>
            Everything your global business{' '}
            <Text style={styles.italicTitle}>needs to grow.</Text>
          </Text>

          <Text style={styles.description}>
            From incorporation to banking — compliance, registered agents,
            addresses and annual filings, all handled for you.
          </Text>

          <View style={styles.paginationRow}>
            <View style={styles.dotInactive} />
            <View style={styles.dashActive} />
            <View style={styles.dotInactive} />
          </View>

          <TouchableOpacity style={styles.continueBtn} activeOpacity={0.8} onPress={() => navigation.navigate('TrustedWorldwide')}>
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.skipText}>Skip intro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessServicesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060913',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: -10,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20, marginTop: 30 },
  cardsContainer: {
    marginBottom: 30,
    marginTop: 35,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 28,
    padding: 10,
    marginBottom: 14,
    borderWidth: 0.5,
  },
  goldCardBorder: {
    borderColor: 'rgba(201, 168, 76, 0.2)',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // elevation: 3,
  },
  blueCardBorder: {
    borderColor: 'rgba(59, 130, 246, 0.2)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // elevation: 3,
  },
  tealCardBorder: {
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goldIconBg: { backgroundColor: 'rgba(201, 168, 76, 0.15)' },
  blueIconBg: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  tealIconBg: { backgroundColor: 'rgba(20, 184, 166, 0.15)' },
  cardTextContent: { flex: 1 },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  cardSubtitle: { color: '#94A3B8', fontSize: 11, marginTop: 3 },
  greenBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  greenBadgeText: { color: '#4ADE80', fontSize: 11, fontWeight: '600' },
  blueBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  blueBadgeText: { color: '#60A5FA', fontSize: 11, fontWeight: '600' },
  tealBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  tealBadgeText: { color: '#2DD4BF', fontSize: 11, fontWeight: '600' },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  pillText: { fontSize: 11, fontWeight: '500' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    marginTop: 8
  },
  bannerText: { color: '#CBD5E1', fontSize: 12, fontWeight: '500' },
  contentSection: { marginTop: 24 },
  sectionTagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  goldLine: { width: 16, height: 2, backgroundColor: '#C9A84C', marginRight: 8 },
  sectionTag: { color: '#C9A84C', fontSize: 11, letterSpacing: 1.2, fontWeight: 'bold' },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: 12,
  },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic' },
  description: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 22,
    marginBottom: 30,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 6,
  },
  dashActive: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9A84C',
    marginRight: 6,
  },
  continueBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  continueBtnText: { color: '#060913', fontSize: 16, fontWeight: 'bold' },
  skipBtn: { alignItems: 'center', paddingVertical: 8, marginBottom: 16 },
  skipText: { color: '#64748B', fontSize: 13 },
});
