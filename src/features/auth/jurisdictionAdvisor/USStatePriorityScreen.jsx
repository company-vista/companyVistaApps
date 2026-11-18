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

const PRIORITY_OPTIONS = [
  {
    id: 'lowest_cost',
    title: 'Lowest total cost',
    description: 'Cheapest to form and to keep running',
    icon: '💰',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Keep my name off public records',
    icon: '🔒',
  },
  {
    id: 'investor_ready',
    title: 'Investor ready',
    description: 'What VCs and accelerators expect to see',
    icon: '🚀',
  },
  {
    id: 'zero_maintenance',
    title: 'Zero maintenance',
    description: 'No annual reports or recurring filings',
    icon: '🧘',
  },
];

export default function USStatePriorityScreen({ navigation, route }) {
  const [selectedId, setSelectedId] = useState(null);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

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
          What's your <Text style={styles.titleItalic}>priority?</Text>
        </Text>

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          States differ mainly on cost, privacy and investor familiarity.
        </Text>

        {PRIORITY_OPTIONS.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.optionCard, cardBase, isSelected && cardSelected]}
              onPress={() => setSelectedId(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: isDark ? themePalette.hex_1e2638 : colors.surfaceAlt }]}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.optionDescription, { color: colors.muted }]}>{item.description}</Text>
              </View>

              <View style={[styles.radioOuter, { borderColor: isDark ? themePalette.hex_334155 : colors.inputBorder }, isSelected && styles.radioOuterSelected]}>
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: s(20) + insets.bottom, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.nextButton, !isDark && { backgroundColor: themePalette.hex_2563eb }, !selectedId && { backgroundColor: isDark ? themePalette.hex_1e293b : '#E2E8F0', opacity: 0.8 }]}
          activeOpacity={0.8}
          disabled={!selectedId}
          onPress={() => navigation.navigate('BestStatesForYou', { ...(route?.params || {}), usStatePriority: selectedId })}
        >
          <Text style={[styles.nextButtonText, !isDark && { color: themePalette.hex_ffffff }, !selectedId && { color: isDark ? themePalette.hex_64748b : colors.subtle }]}>Next  →</Text>
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
  subtitle: { fontSize: font.bodySmall, marginTop: s(8), marginBottom: s(24), lineHeight: 20 },
  optionCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: s(16), marginBottom: s(12) },
  iconContainer: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: s(14) },
  optionIcon: { fontSize: font.xxl },
  textContainer: { flex: 1, paddingRight: s(8) },
  optionTitle: { fontSize: font.base, fontWeight: '600', marginBottom: s(4) },
  optionDescription: { fontSize: font.sm, lineHeight: 16 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { backgroundColor: themePalette.hex_d1a253, borderColor: themePalette.hex_d1a253 },
  checkIcon: { color: themePalette.hex_0b0e17, fontSize: font.sm, fontWeight: 'bold' },
  bottomContainer: { paddingHorizontal: s(16), paddingTop: s(12) },
  nextButton: { backgroundColor: themePalette.hex_d1a253, borderRadius: 24, height: 52, alignItems: 'center', justifyContent: 'center' },
  nextButtonText: { color: themePalette.hex_0b0e17, fontSize: font.lg, fontWeight: '700' },
});
