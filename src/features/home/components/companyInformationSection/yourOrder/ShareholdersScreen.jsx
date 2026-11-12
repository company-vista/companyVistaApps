import { font } from '../../../../../theme/typography';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../../../components/buttons/BackButton';
import logoR from '../../../../../assets/images/logoR.png';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../../theme/colors';
import { s } from '../../../../../theme/responsive';

const ShareholdersScreen2 = ({ onBackPress, onContinue }) => {
  const colors = useThemeColors(); const isLight = colors.mode === 'light';
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <View style={[styles.header, { marginTop: s(8) }]}>
        <BackButton onPress={onBackPress} />
        <Image source={logoR} style={styles.logoImage} resizeMode="contain" />
        <View style={[styles.iconButton, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_111827, borderColor: colors.border }]}>
          <Text style={[styles.iconText, { color: colors.muted }]}>?</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.activeProgress} />
        <View style={[styles.inactiveProgress, { backgroundColor: colors.border }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Shareholders & <Text style={styles.italicTitle}>ownership</Text>
          </Text>
          <Text style={[styles.subTitle, { color: colors.muted }]}>Everyone with a stake in Meridian Global Ventures LLC.</Text>
        </View>

        <View style={styles.banner}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={[styles.bannerText, { color: colors.muted }]}>
            <Text style={styles.bannerBold}>100% allocated</Text> — ownership adds up correctly
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: themePalette.hex_b45309 }]}>
              <Text style={styles.avatarText}>RS</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>Rajesh Kumar Sharma</Text>
              <Text style={[styles.userRole, { color: colors.muted }]}>Principal founder · Managing Member</Text>
            </View>
            <View style={styles.ownershipBox}>
              <Text style={[styles.percentage, { color: themePalette.hex_eab308 }]}>60%</Text>
              <Text style={[styles.ownershipLabel, { color: colors.muted }]}>OWNERSHIP</Text>
            </View>
          </View>
          <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
            <View style={[styles.barFill, { width: '60%', backgroundColor: themePalette.hex_eab308 }]} />
          </View>
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: colors.border }]}><Text style={[styles.tagText, { color: colors.muted }]}>🇮🇳 India</Text></View>
            <View style={[styles.tag, { backgroundColor: colors.border }]}><Text style={[styles.tagText, { color: colors.muted }]}>Director</Text></View>
            <View style={styles.completeTag}><Text style={styles.completeText}>✓ Details complete</Text></View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: themePalette.hex_1e3a8a }]}>
              <Text style={styles.avatarText}>PM</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>Priya Menon</Text>
              <Text style={[styles.userRole, { color: colors.muted }]}>Co-founder · Member</Text>
            </View>
            <View style={styles.ownershipBox}>
              <Text style={[styles.percentage, { color: themePalette.hex_3b82f6 }]}>30%</Text>
              <Text style={[styles.ownershipLabel, { color: colors.muted }]}>OWNERSHIP</Text>
            </View>
          </View>
          <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
            <View style={[styles.barFill, { width: '30%', backgroundColor: themePalette.hex_3b82f6 }]} />
          </View>
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: colors.border }]}><Text style={[styles.tagText, { color: colors.muted }]}>🇦🇪 UAE</Text></View>
            <View style={[styles.tag, { backgroundColor: colors.border }]}><Text style={[styles.tagText, { color: colors.muted }]}>Member</Text></View>
            <View style={styles.pendingTag}><Text style={styles.pendingText}>Awaiting KYC</Text></View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: isLight ? themePalette.hex_ffffff : themePalette.hex_0f172a, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: themePalette.hex_581c87 }]}>
              <Text style={styles.avatarText}>AK</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>Arun Kapoor</Text>
              <Text style={[styles.userRole, { color: colors.muted }]}>Investor · Member</Text>
            </View>
            <View style={styles.ownershipBox}>
              <Text style={[styles.percentage, { color: themePalette.hex_a855f7 }]}>10%</Text>
              <Text style={[styles.ownershipLabel, { color: colors.muted }]}>OWNERSHIP</Text>
            </View>
          </View>
          <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
            <View style={[styles.barFill, { width: '10%', backgroundColor: themePalette.hex_a855f7 }]} />
          </View>
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: colors.border }]}><Text style={[styles.tagText, { color: colors.muted }]}>🇸🇬 Singapore</Text></View>
            <View style={[styles.tag, { backgroundColor: colors.border }]}><Text style={[styles.tagText, { color: colors.muted }]}>Member</Text></View>
            <View style={styles.pendingTag}><Text style={styles.pendingText}>Awaiting KYC</Text></View>
          </View>
        </View>

        <TouchableOpacity style={[styles.addButton, { borderColor: colors.border }]}>
          <Text style={styles.addButtonText}>+ Add another shareholder</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + s(12), backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue to KYC →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ShareholdersScreen2;

const styles = makeThemeStyles(() => StyleSheet.create({
  container: { flex: 1, backgroundColor: themePalette.hex_070c16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: s(16), paddingBottom: s(8) },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: themePalette.hex_111827, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: themePalette.hex_1f2937 },
  iconText: { color: themePalette.hex_9ca3af, fontSize: font.lg, fontWeight: 'bold' },
  logoImage: { width: 130, height: 32 },
  progressContainer: { flexDirection: 'row', height: 2, marginTop: s(12) },
  activeProgress: { flex: 1, backgroundColor: themePalette.hex_eab308 },
  inactiveProgress: { flex: 1, backgroundColor: themePalette.hex_1e293b },
  scrollContainer: { paddingHorizontal: s(16), paddingTop: s(20), paddingBottom: s(90) },
  titleContainer: { marginBottom: s(20) },
  mainTitle: { fontSize: font.displayLarge, color: themePalette.hex_ffffff },
  italicTitle: { fontStyle: 'italic', color: themePalette.hex_eab308 },
  subTitle: { color: themePalette.hex_9ca3af, fontSize: font.bodySmall, marginTop: s(6) },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: themePalette.rgba_16_185_129_0_08, borderWidth: 1, borderColor: themePalette.rgba_16_185_129_0_3, borderRadius: 12, padding: s(12), marginBottom: s(16) },
  checkCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: themePalette.hex_10b981, justifyContent: 'center', alignItems: 'center', marginRight: s(10) },
  checkIcon: { color: themePalette.hex_000000, fontSize: font.sm, fontWeight: 'bold' },
  bannerText: { color: themePalette.hex_9ca3af, fontSize: font.bodySmall, flex: 1 },
  bannerBold: { color: themePalette.hex_10b981, fontWeight: 'bold' },
  card: { backgroundColor: themePalette.hex_0f172a, borderRadius: 12, borderWidth: 1, borderColor: themePalette.hex_1e293b, padding: s(14), marginBottom: s(12) },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: s(12) },
  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: s(10) },
  avatarText: { color: themePalette.hex_ffffff, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: themePalette.hex_ffffff, fontSize: font.md, fontWeight: 'bold' },
  userRole: { color: themePalette.hex_6b7280, fontSize: font.sm, marginTop: s(2) },
  ownershipBox: { alignItems: 'flex-end' },
  percentage: { fontSize: font.xxl, fontWeight: 'bold' },
  ownershipLabel: { color: themePalette.hex_6b7280, fontSize: font.caption, fontWeight: 'bold' },
  barBackground: { height: 4, backgroundColor: themePalette.hex_1e293b, borderRadius: 2, marginBottom: s(12) },
  barFill: { height: '100%', borderRadius: 2 },
  tagsContainer: { flexDirection: 'row', alignItems: 'center' },
  tag: { backgroundColor: themePalette.hex_1e293b, paddingHorizontal: s(10), paddingVertical: s(4), borderRadius: 12, marginRight: s(8) },
  tagText: { color: themePalette.hex_9ca3af, fontSize: font.small },
  completeTag: { backgroundColor: themePalette.rgba_16_185_129_0_15, paddingHorizontal: s(10), paddingVertical: s(4), borderRadius: 12 },
  completeText: { color: themePalette.hex_10b981, fontSize: font.small, fontWeight: '600' },
  pendingTag: { backgroundColor: themePalette.rgba_234_179_8_0_15, paddingHorizontal: s(10), paddingVertical: s(4), borderRadius: 12 },
  pendingText: { color: themePalette.hex_eab308, fontSize: font.small, fontWeight: '600' },
  addButton: { borderWidth: 1, borderColor: themePalette.hex_374151, borderStyle: 'dashed', borderRadius: 12, paddingVertical: s(14), alignItems: 'center', marginTop: s(4) },
  addButtonText: { color: themePalette.hex_eab308, fontWeight: 'bold', fontSize: font.base },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: themePalette.hex_070c16, paddingHorizontal: s(16), paddingVertical: s(12), borderTopWidth: 1, borderTopColor: themePalette.hex_1e293b },
  continueButton: { backgroundColor: themePalette.hex_eab308, borderRadius: 25, height: 48, justifyContent: 'center', alignItems: 'center' },
  continueButtonText: { color: themePalette.hex_000000, fontSize: font.md, fontWeight: 'bold' },
}));
