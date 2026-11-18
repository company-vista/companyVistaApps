import { font } from '../../../theme/typography';
import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import logoR from '../../../assets/images/logoR.png';
import BackButton from '../../../components/buttons/BackButton';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../theme/colors';
import { s } from '../../../theme/responsive';

const BusinessServicesScreen = ({ navigation }) => {
  // react-native ka SafeAreaView deprecated ho chuka hai. Yahi pattern baaki
  // screens me bhi use ho raha hai (SetNewPassword, OtpVerify, etc).
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} transparent backgroundColor="transparent" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Card 1 */}
          <Animated.View style={[styles.card, styles.goldCardBorder, { backgroundColor: isDark ? themePalette.rgba_201_168_76_0_08 : themePalette.hex_ffffff, transform: [{ translateY: float1 }] }]}>
              <View style={[styles.iconContainer, styles.goldIconBg]}>
                <Ionicons name="business" size={20} color={themePalette.hex_c9a84c} />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: isDark ? themePalette.hex_c9a84c : themePalette.hex_b8942f }]}>Company Registration</Text>
                <Text style={[styles.cardSubtitle, { color: colors.muted }]}>50+ jurisdictions · from $299</Text>
              </View>
            <View style={styles.greenBadge}>
              <Text style={styles.greenBadgeText}>7 days</Text>
            </View>
          </Animated.View>

          {/* Card 2 */}
          <Animated.View style={[styles.card, styles.blueCardBorder, { backgroundColor: isDark ? themePalette.rgba_59_130_246_0_08 : themePalette.hex_ffffff, transform: [{ translateY: float2 }] }]}>
              <View style={[styles.iconContainer, styles.blueIconBg]}>
                <Ionicons name="shield-checkmark" size={20} color={themePalette.hex_60a5fa} />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: isDark ? themePalette.hex_60a5fa : themePalette.hex_2563eb }]}>Compliance & Filings</Text>
                <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Annual reports · registered agent</Text>
              </View>
            <View style={styles.blueBadge}>
              <Text style={styles.blueBadgeText}>Auto</Text>
            </View>
          </Animated.View>

          {/* Card 3 */}
          <Animated.View style={[styles.card, styles.tealCardBorder, { backgroundColor: isDark ? themePalette.rgba_20_184_166_0_08 : themePalette.hex_ffffff, transform: [{ translateY: float3 }] }]}>
              <View style={[styles.iconContainer, styles.tealIconBg]}>
                <Ionicons name="landmark" size={20} color={themePalette.hex_34d399} />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: isDark ? themePalette.hex_34d399 : themePalette.hex_0d9488 }]}>Business Banking</Text>
                <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Multi-currency · remote setup</Text>
              </View>
            <View style={styles.tealBadge}>
              <Text style={styles.tealBadgeText}>USD-EUR</Text>
            </View>
          </Animated.View>

          {/* Pills */}
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: themePalette.rgba_139_92_246_0_15, borderColor: themePalette.rgba_139_92_246_0_3 }]}>
              <Ionicons name="location" size={11} color={themePalette.hex_a78bfa} />
              <Text style={[styles.pillText, { color: themePalette.hex_a78bfa }]}> Virtual Office</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: themePalette.rgba_201_168_76_0_15, borderColor: themePalette.rgba_201_168_76_0_3 }]}>
              <Ionicons name="document-text" size={11} color={themePalette.hex_c9a84c} />
              <Text style={[styles.pillText, { color: themePalette.hex_c9a84c }]}> Tax Filing</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: themePalette.rgba_59_130_246_0_15, borderColor: themePalette.rgba_59_130_246_0_3 }]}>
              <Ionicons name="ribbon" size={11} color={themePalette.hex_60a5fa} />
              <Text style={[styles.pillText, { color: themePalette.hex_60a5fa }]}> Trademark</Text>
            </View>
          </View>

          {/* Banner */}
          <View style={[styles.banner, !isDark && styles.bannerLight]}>
            <Ionicons name="checkmark-circle" size={14} color={themePalette.hex_c9a84c} />
            <Text style={[styles.bannerText, { color: isDark ? themePalette.hex_cbd5e1 : colors.muted }]}>  One platform · One dashboard · Zero hassle</Text>
          </View>
        </Animated.View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.sectionTagRow}>
            <View style={styles.goldLine} />
            <Text style={styles.sectionTag}>FULL-STACK BUSINESS SERVICES</Text>
          </View>

          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Everything your global business{' '}
            <Text style={styles.italicTitle}>needs to grow.</Text>
          </Text>

          <Text style={[styles.description, { color: colors.muted }]}>
            From incorporation to banking — compliance, registered agents,
            addresses and annual filings, all handled for you.
          </Text>

          <View style={styles.paginationRow}>
            <View style={[styles.dotInactive, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_2 : colors.border }]} />
            <View style={styles.dashActive} />
            <View style={[styles.dotInactive, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_2 : colors.border }]} />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: s(12) + insets.bottom }]}>
        <TouchableOpacity style={styles.continueBtn} activeOpacity={0.8} onPress={() => navigation.navigate('TrustedWorldwide')}>
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.skipText, { color: colors.subtle }]}>Skip intro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BusinessServicesScreen;

const styles = makeThemeStyles(() => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: s(16),
    paddingTop: -10,
    paddingBottom: s(16),
    justifyContent: 'center',
  },
  footerBar: {
    paddingHorizontal: s(16),
    paddingTop: s(8),
  },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(20), marginTop: s(6) },
  cardsContainer: {
    marginBottom: s(30),
    marginTop: s(35),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 28,
    padding: s(10),
    marginBottom: s(14),
    borderWidth: 0.5,
  },
  goldCardBorder: {
    borderColor: themePalette.rgba_201_168_76_0_2,
    shadowColor: themePalette.hex_c9a84c,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // elevation: 3,
  },
  blueCardBorder: {
    borderColor: themePalette.rgba_59_130_246_0_2,
    shadowColor: themePalette.hex_3b82f6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10, 
    // elevation: 3,
  },
  tealCardBorder: {
    borderColor: themePalette.rgba_20_184_166_0_2,
    shadowColor: themePalette.hex_14b8a6,
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
    marginRight: s(12),
  },
  goldIconBg: { backgroundColor: themePalette.rgba_201_168_76_0_15 },
  blueIconBg: { backgroundColor: themePalette.rgba_59_130_246_0_15 },
  tealIconBg: { backgroundColor: themePalette.rgba_20_184_166_0_15 },
  cardTextContent: { flex: 1 },
  cardTitle: { fontSize: font.md, fontWeight: '600' },
  cardSubtitle: { fontSize: font.small, marginTop: s(3) },
  greenBadge: {
    backgroundColor: themePalette.rgba_34_197_94_0_2,
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: 12,
    marginRight: s(8),
  },
  greenBadgeText: { color: themePalette.hex_4ade80, fontSize: font.small, fontWeight: '600' },
  blueBadge: {
    backgroundColor: themePalette.rgba_59_130_246_0_2,
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: 12,
    marginRight: s(8),
  },
  blueBadgeText: { color: themePalette.hex_60a5fa, fontSize: font.small, fontWeight: '600' },
  tealBadge: {
    backgroundColor: themePalette.rgba_20_184_166_0_2,
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: 12,
    marginRight: s(8),
  },
  tealBadgeText: { color: themePalette.hex_2dd4bf, fontSize: font.small, fontWeight: '600' },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: s(12),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: s(12),
    paddingVertical: s(8),
    borderWidth: 1,
  },
  pillText: { fontSize: font.small, fontWeight: '500' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themePalette.rgba_201_168_76_0_08,
    borderRadius: 12,
    paddingVertical: s(10),
    borderWidth: 1,
    borderColor: themePalette.rgba_201_168_76_0_3,
    marginTop: s(8)
  },
  bannerText: { fontSize: font.sm, fontWeight: '500' },
  bannerLight: { backgroundColor: themePalette.rgba_201_168_76_0_12, borderColor: themePalette.rgba_201_168_76_0_4 },
  contentSection: { marginTop: s(24) },
  sectionTagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: s(12) },
  goldLine: { width: 16, height: 2, backgroundColor: themePalette.hex_c9a84c, marginRight: s(8) },
  sectionTag: { color: themePalette.hex_c9a84c, fontSize: font.small, letterSpacing: 1.2, fontWeight: 'bold' },
  mainTitle: {
    fontSize: font.display,
    fontWeight: '500',
    lineHeight: 34,
    marginBottom: s(12),
  },
  italicTitle: { color: themePalette.hex_c9a84c, fontStyle: 'italic', fontFamily: 'serif' },
  description: {
    fontSize: font.base,
    lineHeight: 22,
    marginBottom: s(30),
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(32),
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: themePalette.rgba_255_255_255_0_2,
    marginRight: s(6),
  },
  dashActive: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: themePalette.hex_c9a84c,
    marginRight: s(6),
  },
  continueBtn: {
    backgroundColor: themePalette.hex_2563eb,
    borderRadius: 25,
    paddingVertical: s(14),
    alignItems: 'center',
    marginBottom: s(8),
  },
  continueBtnText: { color: themePalette.hex_ffffff, fontSize: font.md, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: s(8) },
  skipText: { fontSize: font.base, fontWeight: '500' },
}));
