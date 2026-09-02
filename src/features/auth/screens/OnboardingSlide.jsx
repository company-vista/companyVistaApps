import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  SafeAreaView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import logoR from '../../../assets/images/logoR.png';
import globeLogo from '../../../assets/images/companyvista_globe_320.gif';

const SLIDES_DATA = [
  {
    id: 1,
    eyebrow: 'Company Registration',
    title: 'Register your company in',
    titleItalic: ' any country,',
    body: 'No travel. No local lawyers. Start your global business from anywhere — in days, not months.',
    artGradient: ['#122548', '#0a1428', '#060b16'],
    icon: null,
    showStepper: true,
    showBadges: true,
  },
  {
    id: 2,
    eyebrow: 'MULTI-CURRENCY',
    title: 'Hold & Exchange ',
    titleItalic: '40+ Currencies',
    body: 'Convert currencies instantly with low exchange markup and manage local bank accounts worldwide.',
    artGradient: ['#0e1728', '#0a1020', '#060a14'],
    icon: '🌍',
    showStepper: false,
  },
  {
    id: 3,
    eyebrow: 'SMART SECURITY',
    title: 'Bank-Grade Protection for ',
    titleItalic: 'Your Wealth',
    body: 'Multi-factor authentication, biometric logins, and instant card locking keep your assets secure.',
    artGradient: ['#151126', '#0d0a18', '#07050e'],
    icon: '🛡️',
    showStepper: false,
  },
];

const OnboardingSlide = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -6,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleNext = () => {
    navigation.navigate('BusinessServices');
  };

  const slide = SLIDES_DATA[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />
      
      <Image source={logoR} style={styles.topLogo} />
      <Animated.View style={[styles.remoteButton, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.remoteButtonText}>100% Remote</Text>
      </Animated.View>

      <LinearGradient colors={slide.artGradient} style={styles.artSection}>
        <View style={styles.globeContainer}>
          <FastImage source={globeLogo} style={styles.globeImage} resizeMode={FastImage.resizeMode.contain} />
        </View>
        {slide.showBadges && (
          <View style={styles.badgesRow}>
            <View style={styles.badgeLeft}>
              <Text style={styles.badgeLive}>LIVE</Text>
              <Text style={styles.badgeLeftSub}>AE New LLC · 2m ago</Text>
            </View>
            <Animated.View style={[styles.badgeRight, { transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.badgeAvailable}>AVAILABLE IN</Text>
              <Text style={styles.badgeNumber}>50+</Text>
              <Text style={styles.badgeCountries}>countries worldwide</Text>
            </Animated.View>
          </View>
        )}
      </LinearGradient>

      <LinearGradient colors={['#0a0f1e', '#070b16']} style={styles.contentSection}>
        <View style={styles.goldLine} />

        <View style={styles.eyebrowContainer}>
          <View style={styles.eyebrowDash} />
          <Text style={styles.eyebrowText}>{slide.eyebrow}</Text>
        </View>

        <Text style={styles.title}>
          {slide.title}
          <Text style={styles.titleItalic}>{slide.titleItalic}</Text>
        </Text>

        <Text style={styles.body}>{slide.body}</Text>

        {slide.showStepper && (
          <View style={styles.stepperContainer}>
            <View style={styles.stepperRow}>
              <View style={styles.stepperStep}>
                <View style={[styles.stepperCircle, { borderColor: '#c9a84c' }]}>
                  <Text style={[styles.stepperNumber, { color: '#c9a84c' }]}>1</Text>
                </View>
                <Text style={styles.stepperLabel}>Choose</Text>
              </View>
              <View style={[styles.stepperLine, { backgroundColor: 'rgba(100, 130, 180, 0.3)' }]} />
              <View style={styles.stepperStep}>
                <View style={[styles.stepperCircle, { borderColor: '#3b82f6' }]}>
                  <Text style={[styles.stepperNumber, { color: '#3b82f6' }]}>2</Text>
                </View>
                <Text style={styles.stepperLabel}>Submit</Text>
              </View>
              <View style={[styles.stepperLine, { backgroundColor: 'rgba(100, 130, 180, 0.3)' }]} />
              <View style={styles.stepperStep}>
                <View style={[styles.stepperCircle, { borderColor: '#14b8a6' }]}>
                  <Text style={[styles.stepperNumber, { color: '#14b8a6' }]}>3</Text>
                </View>
                <Text style={styles.stepperLabel}>Incorporated</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.dotsContainer}>
          {SLIDES_DATA.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === currentIndex ? styles.activeDot : null]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={['#c9a84c', '#e8c96a', '#c9a84c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === SLIDES_DATA.length - 1 ? 'Get Started' : 'Continue →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('BusinessServices')}>
          <Text style={styles.skipText}>Skip introduction</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  topLogo: { position: 'absolute', top: 50, left: 12, width: 180, height: 38, resizeMode: 'contain', zIndex: 10 },
  remoteButton: { position: 'absolute', top: 98, left: 20, backgroundColor: 'rgba(201, 168, 76, 0.15)', borderWidth: 1, borderColor: 'rgba(201, 168, 76, 0.3)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, zIndex: 10 },
  remoteButtonText: { fontSize: 10, fontWeight: '600', color: '#c9a84c', letterSpacing: 0.5 },
  artSection: { height: '57%', alignItems: 'center', justifyContent: 'center' },
  artBadge: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artIcon: { fontSize: 54 },
  globeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
   
  },
  globeImage: {
    width: 265,
    height: 265,
    borderRadius: 130,
    marginTop: 16
  },
  badgesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 24, position: 'absolute', bottom: 20 },
  badgeLeft: {
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    // elevation: 4,
  },
  badgeLive: { fontSize: 10, fontWeight: '700', color: '#3b82f6', letterSpacing: 1, marginBottom: 4 },
  badgeLeftSub: { fontSize: 10, color: 'rgba(255, 255, 255, 0.4)' },
  badgeRight: {
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    // elevation: 4,
  },
  badgeAvailable: { fontSize: 8, fontWeight: '700', color: '#c9a84c', letterSpacing: 1, marginBottom: 2 },
  badgeNumber: { fontSize: 28, fontWeight: '300', color: '#c9a84c', marginBottom: 2 },
  badgeCountries: { fontSize: 9, color: 'rgba(255, 255, 255, 0.4)' },
  stepperContainer: { alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: 30, marginTop: -8, marginBottom: 10 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepperStep: { alignItems: 'center', width: 64 },
  stepperCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  stepperNumber: { fontSize: 14, fontWeight: '700' },
  stepperLabel: { fontSize: 9, fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', marginTop: 6, textAlign: 'center' },
  stepperLine: { width: 30, height: 1, marginHorizontal: -4 },
  contentSection: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
  },
  goldLine: {
    alignSelf: 'center',
    width: 120,
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.35)',
    marginBottom: 20,
  },
  eyebrowContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  eyebrowDash: { width: 18, height: 1, backgroundColor: '#c9a84c', marginRight: 8 },
  eyebrowText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: '#c9a84c' },
  title: { fontSize: 24, color: '#f5f3ee', fontWeight: '300', lineHeight: 30, marginBottom: 12 },
  titleItalic: { fontStyle: 'italic', color: '#c9a84c' },
  body: { fontSize: 12, color: 'rgba(255, 255, 255, 0.48)', lineHeight: 20, marginBottom: 'auto' },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  activeDot: { width: 22, backgroundColor: '#c9a84c', borderRadius: 4 },
  nextButton: { borderRadius: 15, overflow: 'hidden', marginBottom: 10 },
  gradientButton: { height: 50, alignItems: 'center', justifyContent: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#0a0f1e' },
  skipButton: { height: 38, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.3)', fontWeight: '500' },
});

export default OnboardingSlide;
