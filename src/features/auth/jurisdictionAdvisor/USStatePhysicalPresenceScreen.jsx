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
import { themePalette, makeThemeStyles } from '../../../theme/colors';

const PRESENCE_OPTIONS = [
  {
    id: 'fully_remote',
    title: 'No — fully remote',
    description: 'No US office, staff or warehouse',
    icon: '🌐',
  },
  {
    id: 'inventory_only',
    title: 'Inventory only',
    description: 'Stock held in a 3PL or Amazon warehouse',
    icon: '📦',
  },
  {
    id: 'office_employees',
    title: 'Office or employees',
    description: 'A real operating presence in one state',
    icon: '🏢',
  },
  {
    id: 'not_decided',
    title: 'Not decided yet',
    description: 'Might expand later',
    icon: '🤔',
  },
];

export default function USStatePhysicalPresenceScreen({ navigation, route }) {
  const [selectedId, setSelectedId] = useState(null);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={themePalette.hex_0b0e17} />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Category Header */}

        {/* Question Title */}
        <Text style={styles.title}>
          Will you have a <Text style={styles.titleItalic}>physical presence</Text> in the US?
        </Text>

        <Text style={styles.subtitle}>
          An office, staff or inventory in a specific state.
        </Text>

        {/* Options List */}
        {PRESENCE_OPTIONS.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedId(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionDescription}>{item.description}</Text>
              </View>

              {/* Selection Check Icon */}
              <View
                style={[
                  styles.radioOuter,
                  isSelected && styles.radioOuterSelected,
                ]}
              >
                {isSelected ? (
                  <Text style={styles.checkIcon}>✓</Text>
                ) : (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Information Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Why this matters:</Text> if you operate in a state, you generally must register there anyway. Forming elsewhere then adds a second registration and a second fee.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Next Button */}
      <View style={[styles.bottomContainer, { paddingBottom: s(20) + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedId && styles.nextButtonDisabled]}
          activeOpacity={0.8}
          disabled={!selectedId}
          onPress={() => navigation.navigate('USStatePriority', { ...(route?.params || {}), physicalPresence: selectedId })}
        >
          <Text style={[styles.nextButtonText, !selectedId && styles.nextButtonTextDisabled]}>Next  →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = makeThemeStyles(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themePalette.hex_0b0e17,
  },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: s(8),
    paddingHorizontal: s(16),
    paddingVertical: s(12),
    marginTop: s(24),
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: themePalette.hex_161b29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: themePalette.hex_94a3b8,
    fontSize: font.lg,
    fontWeight: 'bold',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    color: themePalette.hex_d1a253,
    fontSize: font.md,
    fontWeight: 'bold',
  },
  brandSubtitle: {
    color: themePalette.hex_64748b,
    fontSize: font.micro,
    letterSpacing: 1.2,
    marginTop: s(1),
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: s(16),
    marginTop: s(4),
    marginBottom: s(20),
    justifyContent: 'flex-start',
    gap: s(8),
  },
  progressStep: {
    flex: 1,
    height: 3,
    backgroundColor: themePalette.hex_1e2638,
    marginHorizontal: s(3),
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: themePalette.hex_8b5cf6,
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: s(20),
  },
  questionStepText: {
    color: themePalette.hex_8b5cf6,
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: s(8),
  },
  title: {
    fontSize: font.display,
    fontWeight: '500',
    color: themePalette.hex_ffffff,
    lineHeight: 34,
  },
  titleItalic: {
    fontStyle: 'italic',
    color: themePalette.hex_d1a253,
    fontWeight: '300',
  },
  subtitle: {
    fontSize: font.bodySmall,
    color: themePalette.hex_64748b,
    marginTop: s(8),
    marginBottom: s(20),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themePalette.hex_121724,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themePalette.hex_1e2638,
    padding: s(16),
    marginBottom: s(12),
  },
  optionCardSelected: {
    borderColor: themePalette.hex_d1a253,
    backgroundColor: themePalette.hex_161c2c,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: themePalette.hex_1e2638,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(14),
  },
  optionIcon: {
    fontSize: font.xxl,
  },
  textContainer: {
    flex: 1,
    paddingRight: s(8),
  },
  optionTitle: {
    color: themePalette.hex_ffffff,
    fontSize: font.base,
    fontWeight: '600',
    marginBottom: s(4),
  },
  optionDescription: {
    color: themePalette.hex_64748b,
    fontSize: font.sm,
    lineHeight: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: themePalette.hex_334155,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    backgroundColor: themePalette.hex_d1a253,
    borderColor: themePalette.hex_d1a253,
  },
  radioInner: {
    width: 0,
    height: 0,
  },
  checkIcon: {
    color: themePalette.hex_0b0e17,
    fontSize: font.sm,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: themePalette.hex_121a2e,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: themePalette.hex_1e2c4a,
    padding: s(14),
    marginTop: s(8),
    marginBottom: s(16),
  },
  infoIcon: {
    color: themePalette.hex_60a5fa,
    fontSize: font.md,
    marginRight: s(10),
    marginTop: s(1),
  },
  infoText: {
    flex: 1,
    color: themePalette.hex_94a3b8,
    fontSize: font.sm,
    lineHeight: 18,
  },
  infoBold: {
    color: themePalette.hex_ffffff,
    fontWeight: 'bold',
  },
  bottomContainer: {
    paddingHorizontal: s(16),
    paddingTop: s(12),
    paddingBottom: s(20),
    backgroundColor: themePalette.hex_0b0e17,
  },
  nextButton: {
    backgroundColor: themePalette.hex_d1a253,
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: themePalette.hex_0b0e17,
    fontSize: font.lg,
    fontWeight: '700',
  },
  nextButtonDisabled: {
    backgroundColor: themePalette.hex_1e293b,
    opacity: 0.6,
  },
  nextButtonTextDisabled: {
    color: themePalette.hex_64748b,
  },
}));
