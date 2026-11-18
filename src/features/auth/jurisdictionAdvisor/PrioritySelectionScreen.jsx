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

const ALL_OPTIONS = [
  { id: 'banking', label: 'Banking access' },
  { id: 'tax', label: 'Low tax' },
  { id: 'fast', label: 'Fast setup' },
  { id: 'cost', label: 'Lowest cost' },
  { id: 'investor', label: 'Investor credibility' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'visa', label: 'Residence visa' },
  { id: 'maintenance', label: 'Low maintenance' },
  { id: 'reputation', label: 'Reputation' },
];

export default function PrioritySelectionScreen({ navigation, route }) {
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  const handleToggleOption = (id) => {
    if (selectedPriorities.includes(id)) {
      setSelectedPriorities(selectedPriorities.filter((item) => item !== id));
    } else if (selectedPriorities.length < 3) {
      setSelectedPriorities([...selectedPriorities, id]);
    }
  };

  const getPriorityIndex = (id) => {
    const index = selectedPriorities.indexOf(id);
    return index !== -1 ? index + 1 : null;
  };

  const WEIGHT_LABELS = ['Highest weight', 'Medium weight', 'Lower weight'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>
          What matters <Text style={styles.titleItalic}>most</Text> to you?
        </Text>

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Tap up to 3, in order of importance.
        </Text>

        <View style={styles.pillsContainer}>
          {ALL_OPTIONS.map((item) => {
            const priorityNumber = getPriorityIndex(item.id);
            const isSelected = priorityNumber !== null;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.pill,
                  isSelected
                    ? { backgroundColor: isDark ? themePalette.hex_231f15 : '#FFFBF0', borderColor: themePalette.hex_d1a253 }
                    : { backgroundColor: isDark ? themePalette.hex_121724 : colors.surface, borderColor: isDark ? themePalette.hex_1e2638 : colors.border },
                ]}
                onPress={() => handleToggleOption(item.id)}
                activeOpacity={0.8}
              >
                {isSelected && (
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberBadgeText}>{priorityNumber}</Text>
                  </View>
                )}
                <Text style={[styles.pillText, { color: isSelected ? themePalette.hex_d1a253 : colors.muted }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.noteCard, { backgroundColor: isDark ? themePalette.hex_131326 : '#F5F3FF', borderColor: isDark ? themePalette.hex_2d264a : '#DDD6FE' }]}>
          <Text style={styles.noteIcon}>ℹ</Text>
          <Text style={[styles.noteText, { color: colors.muted }]}>
            <Text style={[styles.noteBold, { color: colors.text }]}>Honest note:</Text> no jurisdiction wins on everything. Low tax usually means weaker banking; strong reputation usually costs more.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.subtle }]}>YOUR PRIORITIES</Text>
          <View style={[styles.sectionDivider, { backgroundColor: isDark ? themePalette.hex_1e2638 : colors.border }]} />
        </View>

        {selectedPriorities.map((id, index) => {
          const itemObj = ALL_OPTIONS.find((opt) => opt.id === id);
          if (!itemObj) return null;
          return (
            <View key={id} style={[styles.priorityCard, { backgroundColor: isDark ? themePalette.hex_121724 : colors.surface, borderColor: isDark ? themePalette.hex_1e2638 : colors.border }]}>
              <View style={styles.priorityLeft}>
                <View style={styles.numberBadgeLarge}>
                  <Text style={styles.numberBadgeTextLarge}>{index + 1}</Text>
                </View>
                <Text style={[styles.priorityTitle, { color: colors.text }]}>{itemObj.label}</Text>
              </View>
              {index === 0 && <Text style={[styles.weightText, { color: colors.subtle }]}>{WEIGHT_LABELS[0]}</Text>}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: s(20) + insets.bottom, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.nextButton, !isDark && { backgroundColor: themePalette.hex_2563eb }, selectedPriorities.length === 0 && { backgroundColor: isDark ? themePalette.hex_1e293b : '#E2E8F0', opacity: 0.8 }]}
          activeOpacity={0.8}
          disabled={selectedPriorities.length === 0}
          onPress={() => navigation.navigate('DayOneNeeds', { ...(route?.params || {}), priorities: selectedPriorities })}
        >
          <Text style={[styles.nextButtonText, !isDark && { color: themePalette.hex_ffffff }, selectedPriorities.length === 0 && { color: isDark ? themePalette.hex_64748b : colors.subtle }]}>Next  →</Text>
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
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: s(10), marginBottom: s(20) },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: s(14), paddingVertical: s(10), borderRadius: 24, borderWidth: 1 },
  pillText: { fontSize: font.base, fontWeight: '400' },
  numberBadge: { width: 15, height: 15, borderRadius: 10, backgroundColor: themePalette.hex_d1a253, alignItems: 'center', justifyContent: 'center', marginRight: s(6) },
  numberBadgeText: { color: themePalette.hex_0b0e17, fontSize: font.small, fontWeight: 'bold' },
  noteCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: s(14), marginBottom: s(24), alignItems: 'flex-start' },
  noteIcon: { color: themePalette.hex_8b5cf6, fontSize: font.lg, marginRight: s(10), marginTop: s(1) },
  noteText: { flex: 1, fontSize: font.sm, lineHeight: 18 },
  noteBold: { fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: s(16) },
  sectionTitle: { fontSize: font.small, fontWeight: 'bold', letterSpacing: 1.2, marginRight: s(12) },
  sectionDivider: { flex: 1, height: 1 },
  priorityCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: s(8), borderRadius: 14, borderWidth: 1, paddingHorizontal: s(16), paddingVertical: s(14), marginBottom: s(10) },
  priorityLeft: { flexDirection: 'row', alignItems: 'center' },
  numberBadgeLarge: { width: 24, height: 24, borderRadius: 12, backgroundColor: themePalette.hex_d1a253, alignItems: 'center', justifyContent: 'center', marginRight: s(12) },
  numberBadgeTextLarge: { color: themePalette.hex_0b0e17, fontSize: font.bodySmall, fontWeight: 'bold' },
  priorityTitle: { fontSize: font.md, fontWeight: '600' },
  weightText: { fontSize: font.sm },
  bottomContainer: { paddingHorizontal: s(16), paddingTop: s(12) },
  nextButton: { backgroundColor: themePalette.hex_d1a253, borderRadius: 24, height: 52, alignItems: 'center', justifyContent: 'center' },
  nextButtonText: { color: themePalette.hex_0b0e17, fontSize: font.lg, fontWeight: '700' },
});
