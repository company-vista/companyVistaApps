import React, { useState } from 'react';
import { s } from '../../../theme/responsive';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { font } from '../../../theme/typography';
import { themePalette, useThemeColors } from '../../../theme/colors';

const IMMEDIATELY_NEEDS = [
  {
    id: 'payments',
    title: 'Accept card payments',
    description: 'Stripe, PayPal or a merchant account',
    icon: '💳',
  },
  {
    id: 'workers',
    title: 'Hire or place workers',
    description: 'Payroll, contractors or staffing placements',
    icon: '👥',
  },
  {
    id: 'multicurrency',
    title: 'Multi-currency accounts',
    description: 'Hold and settle in more than one currency',
    icon: '💱',
  },
];

const PLANNED_NEEDS = [
  {
    id: 'investment',
    title: 'Raise outside investment',
    description: 'Angels, VC or an accelerator',
    icon: '📈',
  },
  {
    id: 'residence_visa',
    title: 'Residence visa',
    description: 'Relocate yourself or family',
    icon: '🪪',
  },
  {
    id: 'physical_office',
    title: 'Physical office',
    description: 'Lease premises locally',
    icon: '🏢',
  },
];

export default function DayOneNeedsScreen({ navigation, route }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const cardBase = { backgroundColor: isDark ? themePalette.hex_121724 : colors.surface, borderColor: isDark ? themePalette.hex_1e2638 : colors.border };
  const cardSelected = { borderColor: themePalette.hex_d1a253, backgroundColor: isDark ? themePalette.hex_161c2c : '#FFFBF0' };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>
          What will you need <Text style={styles.titleItalic}>from day one?</Text>
        </Text>

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Select everything that applies — this rules out unsuitable jurisdictions.
        </Text>

        <View style={[styles.optionCard, cardSelected, { opacity: 0.95 }]}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? themePalette.hex_1e2638 : colors.surfaceAlt }]}>
            <Text style={styles.optionIcon}>🏦</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Business bank account</Text>
            <Text style={[styles.optionDescription, { color: colors.muted }]}>Assumed for everyone — nearly every client needs one immediately after formation.</Text>
          </View>
          <View style={styles.alwaysOnBadge}>
            <Text style={styles.alwaysOnText}>ALWAYS ON</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.subtle }]}>ALSO NEEDED IMMEDIATELY</Text>
          <View style={[styles.sectionDivider, { backgroundColor: isDark ? themePalette.hex_1e2638 : colors.border }]} />
        </View>

        {IMMEDIATELY_NEEDS.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.optionCard, cardBase, isSelected && cardSelected]}
              onPress={() => toggleSelection(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: isDark ? themePalette.hex_1e2638 : colors.surfaceAlt }]}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.optionDescription, { color: colors.muted }]}>{item.description}</Text>
              </View>
              <View style={[styles.checkboxOuter, { borderColor: isDark ? themePalette.hex_334155 : colors.inputBorder }, isSelected && styles.checkboxSelected]}>
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.sectionHeader, { marginTop: s(12) }]}>
          <Text style={[styles.sectionTitle, { color: colors.subtle }]}>PLANNED WITHIN 12 MONTHS</Text>
          <View style={[styles.sectionDivider, { backgroundColor: isDark ? themePalette.hex_1e2638 : colors.border }]} />
        </View>

        {PLANNED_NEEDS.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.optionCard, cardBase, isSelected && cardSelected]}
              onPress={() => toggleSelection(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: isDark ? themePalette.hex_1e2638 : colors.surfaceAlt }]}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.optionDescription, { color: colors.muted }]}>{item.description}</Text>
              </View>
              <View style={[styles.checkboxOuter, { borderColor: isDark ? themePalette.hex_334155 : colors.inputBorder }, isSelected && styles.checkboxSelected]}>
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: s(20) + insets.bottom, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.submitButton, !isDark && { backgroundColor: themePalette.hex_2563eb }, selectedIds.length === 0 && { backgroundColor: isDark ? themePalette.hex_1e293b : '#E2E8F0', opacity: 0.8 }]}
          activeOpacity={0.8}
          disabled={selectedIds.length === 0}
          onPress={() => navigation.navigate('BestMatches', { ...(route?.params || {}), dayOneNeeds: selectedIds })}
        >
          <Text style={[styles.starIcon, !isDark && { color: themePalette.hex_ffffff }, selectedIds.length === 0 && { color: isDark ? themePalette.hex_64748b : colors.subtle }]}>★ </Text>
          <Text style={[styles.submitButtonText, !isDark && { color: themePalette.hex_ffffff }, selectedIds.length === 0 && { color: isDark ? themePalette.hex_64748b : colors.subtle }]}>Show My Matches</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: s(8), paddingHorizontal: s(16), paddingVertical: s(12), marginTop: s(24) },
  scrollContent: { paddingHorizontal: s(20), paddingBottom: s(20) },
  title: { fontSize: font.display, fontWeight: '500', lineHeight: 34 },
  titleItalic: { fontStyle: 'italic', color: themePalette.hex_d1a253, fontWeight: '300', fontFamily: 'serif' },
  subtitle: { fontSize: font.bodySmall, marginTop: s(8), marginBottom: s(20), lineHeight: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: s(16) },
  sectionTitle: { fontSize: font.small, fontWeight: 'bold', letterSpacing: 1.2, marginRight: s(12) },
  sectionDivider: { flex: 1, height: 1 },
  optionCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: s(16), marginBottom: s(12) },
  iconContainer: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: s(14) },
  optionIcon: { fontSize: font.xxl },
  textContainer: { flex: 1, paddingRight: s(8) },
  optionTitle: { fontSize: font.base, fontWeight: '600', marginBottom: s(4) },
  optionDescription: { fontSize: font.sm, lineHeight: 16 },
  checkboxOuter: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: themePalette.hex_d1a253, borderColor: themePalette.hex_d1a253 },
  checkIcon: { color: themePalette.hex_0b0e17, fontSize: font.sm, fontWeight: 'bold' },
  alwaysOnBadge: { backgroundColor: themePalette.hex_d1a253, paddingHorizontal: s(8), paddingVertical: s(4), borderRadius: 6 },
  alwaysOnText: { color: themePalette.hex_0b0e17, fontSize: font.caption, fontWeight: '700', letterSpacing: 0.5 },
  bottomContainer: { paddingHorizontal: s(16), paddingTop: s(12) },
  submitButton: { flexDirection: 'row', backgroundColor: themePalette.hex_d1a253, borderRadius: 24, height: 52, alignItems: 'center', justifyContent: 'center' },
  starIcon: { color: themePalette.hex_0b0e17, fontSize: font.lg, fontWeight: 'bold' },
  submitButtonText: { color: themePalette.hex_0b0e17, fontSize: font.lg, fontWeight: '700' },
});
