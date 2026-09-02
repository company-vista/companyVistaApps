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

const TrustedWorldwideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Counter Section */}
          <View style={styles.counterSection}>
            <Ionicons name="leaf" size={24} color="#C9A84C" />
            <View style={styles.counterTextWrapper}>
              <Text style={styles.counterNumber}>2,400<Text style={styles.plusSign}>+</Text></Text>
              <Text style={styles.counterLabel}>COMPANIES REGISTERED</Text>
            </View>
            <Ionicons name="leaf" size={24} color="#C9A84C" />
          </View>

          {/* 2x2 Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.goldCard]}>
              <Ionicons name="globe" size={20} color="#C9A84C" />
              <Text style={[styles.statNumber, { color: '#C9A84C' }]}>50+</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>

            <View style={[styles.statCard, styles.greenCard]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={[styles.statNumber, { color: '#10B981' }]}>98%</Text>
              <Text style={styles.statLabel}>Success rate</Text>
            </View>

            <View style={[styles.statCard, styles.blueCard]}>
              <Ionicons name="time" size={20} color="#60A5FA" />
              <Text style={[styles.statNumber, { color: '#60A5FA' }]}>7 days</Text>
              <Text style={styles.statLabel}>Turnaround</Text>
            </View>

            <View style={[styles.statCard, styles.purpleCard]}>
              <Ionicons name="headset" size={20} color="#A855F7" />
              <Text style={[styles.statNumber, { color: '#A855F7' }]}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
          </View>

          {/* Testimonial */}
          <View style={styles.testimonialCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>SK</Text>
            </View>
            <View style={styles.testimonialContent}>
              <Text style={styles.stars}>★★★★★</Text>
              <Text style={styles.reviewText}>
                Set up my Dubai company in 6 days without leaving London. Exceptional.
              </Text>
              <Text style={styles.authorText}>Sarah K. · Founder, TechFlow</Text>
            </View>
          </View>

        </Animated.View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.tagRow}>
            <View style={styles.goldLine} />
            <Text style={styles.sectionTag}>TRUSTED WORLDWIDE</Text>
          </View>

          <Text style={styles.mainHeading}>
            Built for global{'\n'}
            <Text style={styles.italicGold}>visionaries</Text> like <Text style={styles.boldWhite}>you.</Text>
          </Text>

          <Text style={styles.descriptionText}>
            Join 2,400+ entrepreneurs building their global business with CompanyVista.
          </Text>

          <View style={styles.paginationRow}>
            <View style={styles.dotInactive} />
            <View style={styles.dashActive} />
          </View>

          <TouchableOpacity style={styles.getStartedBtn} activeOpacity={0.8} onPress={() => navigation.navigate('RegistrationLanding')}>
            <Text style={styles.btnText}>Get Started →</Text>
          </TouchableOpacity>


        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default TrustedWorldwideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060913',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 16 },
  topLogo: { width: 150, height: 38, marginTop: 10, resizeMode: 'contain' },
  counterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  counterTextWrapper: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 18
  },
  counterNumber: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '400',
    fontFamily: 'serif',
  },
  plusSign: {
    color: '#C9A84C',
  },
  counterLabel: {
    color: '#94A3B8',
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '600',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  goldCard: { borderColor: 'rgba(201, 168, 76, 0.3)' },
  greenCard: { borderColor: 'rgba(16, 185, 129, 0.3)' },
  blueCard: { borderColor: 'rgba(96, 165, 250, 0.3)' },
  purpleCard: { borderColor: 'rgba(168, 85, 247, 0.3)' },
  statNumber: { fontSize: 22, fontWeight: '600', fontFamily: 'serif', marginTop: 6 },
  statLabel: { color: '#64748B', fontSize: 11, marginTop: 2 },
  testimonialCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 28,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#060913', fontWeight: 'bold', fontSize: 12 },
  testimonialContent: { flex: 1 },
  stars: { color: '#C9A84C', fontSize: 10, marginBottom: 4 },
  reviewText: { color: '#CBD5E1', fontSize: 11, lineHeight: 16 },
  authorText: { color: '#64748B', fontSize: 10, marginTop: 4 },
  contentSection: { marginTop: 4 },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  goldLine: { width: 18, height: 2, backgroundColor: '#C9A84C', marginRight: 8 },
  sectionTag: { color: '#C9A84C', fontSize: 11, letterSpacing: 1.2, fontWeight: 'bold' },
  mainHeading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 36,
    marginBottom: 12,
  },
  italicGold: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  boldWhite: { color: '#FFFFFF', fontWeight: 'bold' },
  descriptionText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 24,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  },
  getStartedBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: { color: '#060913', fontSize: 16, fontWeight: 'bold' },
});
