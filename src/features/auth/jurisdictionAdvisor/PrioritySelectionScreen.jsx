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
  // Store selected IDs in array to preserve selection order (Max 3)
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const insets = useSafeAreaInsets();

  const handleToggleOption = (id) => {
    if (selectedPriorities.includes(id)) {
      // Unselect if already chosen
      setSelectedPriorities(selectedPriorities.filter((item) => item !== id));
    } else {
      // Allow max 3 selections
      if (selectedPriorities.length < 3) {
        setSelectedPriorities([...selectedPriorities, id]);
      }
    }
  };

  const getPriorityIndex = (id) => {
    const index = selectedPriorities.indexOf(id);
    return index !== -1 ? index + 1 : null;
  };

  const WEIGHT_LABELS = ['Highest weight', 'Medium weight', 'Lower weight'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={themePalette.hex_0b0e17} />

      {/* Top Header Navigation */}
      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Counter */}

        {/* Question Heading */}
        <Text style={styles.title}>
          What matters <Text style={styles.titleItalic}>most</Text> to you?
        </Text>

        <Text style={styles.subtitle}>
          Tap up to 3, in order of importance.
        </Text>

        {/* Chips / Pills Wrap Layout */}
        <View style={styles.pillsContainer}>
          {ALL_OPTIONS.map((item) => {
            const priorityNumber = getPriorityIndex(item.id);
            const isSelected = priorityNumber !== null;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.pill,
                  isSelected ? styles.pillSelected : styles.pillUnselected,
                ]}
                onPress={() => handleToggleOption(item.id)}
                activeOpacity={0.8}
              >
                {isSelected && (
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberBadgeText}>{priorityNumber}</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.pillText,
                    isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Honest Note Card */}
        <View style={styles.noteCard}>
          <Text style={styles.noteIcon}>ℹ</Text>
          <Text style={styles.noteText}>
            <Text style={styles.noteBold}>Honest note:</Text> no jurisdiction wins on everything. Low tax usually means weaker banking; strong reputation usually costs more.
          </Text>
        </View>

        {/* Your Priorities Dynamic List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>YOUR PRIORITIES</Text>
          <View style={styles.sectionDivider} />
        </View>

        {selectedPriorities.map((id, index) => {
          const itemObj = ALL_OPTIONS.find((opt) => opt.id === id);
          if (!itemObj) return null;

          return (
            <View key={id} style={styles.priorityCard}>
              <View style={styles.priorityLeft}>
                <View style={styles.numberBadgeLarge}>
                  <Text style={styles.numberBadgeTextLarge}>{index + 1}</Text>
                </View>
                <Text style={styles.priorityTitle}>{itemObj.label}</Text>
              </View>

              {index === 0 && (
                <Text style={styles.weightText}>{WEIGHT_LABELS[0]}</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={[styles.bottomContainer, { paddingBottom: s(20) + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.nextButton, selectedPriorities.length === 0 && styles.nextButtonDisabled]}
          activeOpacity={0.8}
          disabled={selectedPriorities.length === 0}
          onPress={() => navigation.navigate('DayOneNeeds', { ...(route?.params || {}), priorities: selectedPriorities })}
        >
          <Text style={[styles.nextButtonText, selectedPriorities.length === 0 && styles.nextButtonTextDisabled]}>Next  →</Text>
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
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
    marginBottom: s(20),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(14),
    paddingVertical: s(10),
    borderRadius: 24,
    borderWidth: 1,
  },
  pillUnselected: {
    backgroundColor: themePalette.hex_121724,
    borderColor: themePalette.hex_1e2638,
  },
  pillSelected: {
    backgroundColor: themePalette.hex_231f15,
    borderColor: themePalette.hex_d1a253,
  },
  pillText: {
    fontSize: font.base,
    fontWeight: '400',
  },
  pillTextUnselected: {
    color: themePalette.hex_94a3b8,
  },
  pillTextSelected: {
    color: themePalette.hex_d1a253,
    fontWeight: '500',
  },
  numberBadge: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: themePalette.hex_d1a253,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(6),
  },
  numberBadgeText: {
    color: themePalette.hex_0b0e17,
    fontSize: font.small,
    fontWeight: 'bold',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: themePalette.hex_131326,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: themePalette.hex_2d264a,
    padding: s(14),
    marginBottom: s(24),
    alignItems: 'flex-start',
  },
  noteIcon: {
    color: themePalette.hex_8b5cf6,
    fontSize: font.lg,
    marginRight: s(10),
    marginTop: s(1),
  },
  noteText: {
    flex: 1,
    color: themePalette.hex_94a3b8,
    fontSize: font.sm,
    lineHeight: 18,
  },
  noteBold: {
    color: themePalette.hex_ffffff,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(16),
  },
  sectionTitle: {
    color: themePalette.hex_64748b,
    fontSize: font.small,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginRight: s(12),
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: themePalette.hex_1e2638,
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: s(8),
    backgroundColor: themePalette.hex_121724,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: themePalette.hex_1e2638,
    paddingHorizontal: s(16),
    paddingVertical: s(14),
    marginBottom: s(10),
  },
  priorityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberBadgeLarge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: themePalette.hex_d1a253,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(12),
  },
  numberBadgeTextLarge: {
    color: themePalette.hex_0b0e17,
    fontSize: font.bodySmall,
    fontWeight: 'bold',
  },
  priorityTitle: {
    color: themePalette.hex_ffffff,
    fontSize: font.md,
    fontWeight: '600',
  },
  weightText: {
    color: themePalette.hex_64748b,
    fontSize: font.sm,
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
