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
import { useThemeColors } from '../../../../../theme/colors';
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
        <View style={[styles.iconButton, { backgroundColor: isLight ? '#FFFFFF' : '#111827', borderColor: colors.border }]}>
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

        <View style={[styles.card, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: '#B45309' }]}>
              <Text style={styles.avatarText}>RS</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>Rajesh Kumar Sharma</Text>
              <Text style={[styles.userRole, { color: colors.muted }]}>Principal founder · Managing Member</Text>
            </View>
            <View style={styles.ownershipBox}>
              <Text style={[styles.percentage, { color: '#EAB308' }]}>60%</Text>
              <Text style={[styles.ownershipLabel, { color: colors.muted }]}>OWNERSHIP</Text>
            </View>
          </View>
          <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
            <View style={[styles.barFill, { width: '60%', backgroundColor: '#EAB308' }]} />
          </View>
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: colors.border }]}><Text style={[styles.tagText, { color: colors.muted }]}>🇮🇳 India</Text></View>
            <View style={[styles.tag, { backgroundColor: colors.border }]}><Text style={[styles.tagText, { color: colors.muted }]}>Director</Text></View>
            <View style={styles.completeTag}><Text style={styles.completeText}>✓ Details complete</Text></View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: '#1E3A8A' }]}>
              <Text style={styles.avatarText}>PM</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>Priya Menon</Text>
              <Text style={[styles.userRole, { color: colors.muted }]}>Co-founder · Member</Text>
            </View>
            <View style={styles.ownershipBox}>
              <Text style={[styles.percentage, { color: '#3B82F6' }]}>30%</Text>
              <Text style={[styles.ownershipLabel, { color: colors.muted }]}>OWNERSHIP</Text>
            </View>
          </View>
          <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
            <View style={[styles.barFill, { width: '30%', backgroundColor: '#3B82F6' }]} />
          </View>
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: colors.border }]}><Text style={[styles.tagText, { color: colors.muted }]}>🇦🇪 UAE</Text></View>
            <View style={[styles.tag, { backgroundColor: colors.border }]}><Text style={[styles.tagText, { color: colors.muted }]}>Member</Text></View>
            <View style={styles.pendingTag}><Text style={styles.pendingText}>Awaiting KYC</Text></View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: '#581C87' }]}>
              <Text style={styles.avatarText}>AK</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>Arun Kapoor</Text>
              <Text style={[styles.userRole, { color: colors.muted }]}>Investor · Member</Text>
            </View>
            <View style={styles.ownershipBox}>
              <Text style={[styles.percentage, { color: '#A855F7' }]}>10%</Text>
              <Text style={[styles.ownershipLabel, { color: colors.muted }]}>OWNERSHIP</Text>
            </View>
          </View>
          <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
            <View style={[styles.barFill, { width: '10%', backgroundColor: '#A855F7' }]} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070C16' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: s(16), paddingBottom: s(8) },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' },
  iconText: { color: '#9CA3AF', fontSize: 16, fontWeight: 'bold' },
  logoImage: { width: 130, height: 32 },
  progressContainer: { flexDirection: 'row', height: 2, marginTop: s(12) },
  activeProgress: { flex: 1, backgroundColor: '#EAB308' },
  inactiveProgress: { flex: 1, backgroundColor: '#1E293B' },
  scrollContainer: { paddingHorizontal: s(16), paddingTop: s(20), paddingBottom: s(90) },
  titleContainer: { marginBottom: s(20) },
  mainTitle: { fontSize: 26, color: '#FFFFFF' },
  italicTitle: { fontStyle: 'italic', color: '#EAB308' },
  subTitle: { color: '#9CA3AF', fontSize: 13, marginTop: s(6) },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: 12, padding: s(12), marginBottom: s(16) },
  checkCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: s(10) },
  checkIcon: { color: '#000000', fontSize: 12, fontWeight: 'bold' },
  bannerText: { color: '#9CA3AF', fontSize: 13, flex: 1 },
  bannerBold: { color: '#10B981', fontWeight: 'bold' },
  card: { backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', padding: s(14), marginBottom: s(12) },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: s(12) },
  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: s(10) },
  avatarText: { color: '#FFFFFF', fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  userRole: { color: '#6B7280', fontSize: 12, marginTop: s(2) },
  ownershipBox: { alignItems: 'flex-end' },
  percentage: { fontSize: 18, fontWeight: 'bold' },
  ownershipLabel: { color: '#6B7280', fontSize: 9, fontWeight: 'bold' },
  barBackground: { height: 4, backgroundColor: '#1E293B', borderRadius: 2, marginBottom: s(12) },
  barFill: { height: '100%', borderRadius: 2 },
  tagsContainer: { flexDirection: 'row', alignItems: 'center' },
  tag: { backgroundColor: '#1E293B', paddingHorizontal: s(10), paddingVertical: s(4), borderRadius: 12, marginRight: s(8) },
  tagText: { color: '#9CA3AF', fontSize: 11 },
  completeTag: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: s(10), paddingVertical: s(4), borderRadius: 12 },
  completeText: { color: '#10B981', fontSize: 11, fontWeight: '600' },
  pendingTag: { backgroundColor: 'rgba(234, 179, 8, 0.15)', paddingHorizontal: s(10), paddingVertical: s(4), borderRadius: 12 },
  pendingText: { color: '#EAB308', fontSize: 11, fontWeight: '600' },
  addButton: { borderWidth: 1, borderColor: '#374151', borderStyle: 'dashed', borderRadius: 12, paddingVertical: s(14), alignItems: 'center', marginTop: s(4) },
  addButtonText: { color: '#EAB308', fontWeight: 'bold', fontSize: 14 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#070C16', paddingHorizontal: s(16), paddingVertical: s(12), borderTopWidth: 1, borderTopColor: '#1E293B' },
  continueButton: { backgroundColor: '#EAB308', borderRadius: 25, height: 48, justifyContent: 'center', alignItems: 'center' },
  continueButtonText: { color: '#000000', fontSize: 15, fontWeight: 'bold' },
});
