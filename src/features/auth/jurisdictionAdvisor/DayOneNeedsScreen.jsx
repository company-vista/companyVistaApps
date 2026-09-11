import React, { useState } from 'react';
import { s } from '../../../theme/responsive';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { font } from '../../../theme/typography';

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
  // Checkbox Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E17" />

      {/* Top Navigation Bar */}
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
          What will you need <Text style={styles.titleItalic}>from day one?</Text>
        </Text>

        <Text style={styles.subtitle}>
          Select everything that applies — this rules out unsuitable jurisdictions.
        </Text>

        {/* Business bank account - ALWAYS ON */}
        <View style={[styles.optionCard, styles.optionCardSelected, { opacity: 0.95 }]}>
          <View style={[styles.iconContainer, { backgroundColor: '#1E2638' }]}>
            <Text style={styles.optionIcon}>🏦</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>Business bank account</Text>
            <Text style={styles.optionDescription}>Assumed for everyone — nearly every client needs one immediately after formation.</Text>
          </View>
          <View style={styles.alwaysOnBadge}>
            <Text style={styles.alwaysOnText}>ALWAYS ON</Text>
          </View>
        </View>

        {/* SECTION 1: ALSO NEEDED IMMEDIATELY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ALSO NEEDED IMMEDIATELY</Text>
          <View style={styles.sectionDivider} />
        </View>

        {IMMEDIATELY_NEEDS.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => toggleSelection(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionDescription}>{item.description}</Text>
              </View>

              {/* Checkbox Indicator */}
              <View
                style={[
                  styles.checkboxOuter,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* SECTION 2: PLANNED WITHIN 12 MONTHS */}
        <View style={[styles.sectionHeader, { marginTop: s(12) }]}>
          <Text style={styles.sectionTitle}>PLANNED WITHIN 12 MONTHS</Text>
          <View style={styles.sectionDivider} />
        </View>

        {PLANNED_NEEDS.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => toggleSelection(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionDescription}>{item.description}</Text>
              </View>

              {/* Checkbox Indicator */}
              <View
                style={[
                  styles.checkboxOuter,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.submitButton, selectedIds.length === 0 && styles.submitButtonDisabled]}
          activeOpacity={0.8}
          disabled={selectedIds.length === 0}
          onPress={() => navigation.navigate('BestMatches', { ...(route?.params || {}), dayOneNeeds: selectedIds })}
        >
          <Text style={[styles.starIcon, selectedIds.length === 0 && styles.submitButtonTextDisabled]}>★ </Text>
          <Text style={[styles.submitButtonText, selectedIds.length === 0 && styles.submitButtonTextDisabled]}>Show My Matches</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E17',
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
    backgroundColor: '#161B29',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    color: '#D1A253',
    fontSize: 15,
    fontWeight: 'bold',
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: 7,
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
    backgroundColor: '#1E2638',
    marginHorizontal: s(3),
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#8B5CF6',
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: s(20),
  },
  questionStepText: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: s(8),
  },
  title: {
    fontSize: font.display,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 34,
  },
  titleItalic: {
    fontStyle: 'italic',
    color: '#D1A253',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: s(8),
    marginBottom: s(20),
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(16),
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginRight: s(12),
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E2638',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121724',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2638',
    padding: s(16),
    marginBottom: s(12),
  },
  optionCardSelected: {
    borderColor: '#D1A253',
    backgroundColor: '#161C2C',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1E2638',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(14),
  },
  optionIcon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
    paddingRight: s(8),
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: s(4),
  },
  optionDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
  },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#D1A253',
    borderColor: '#D1A253',
  },
  checkIcon: {
    color: '#0B0E17',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alwaysOnBadge: {
    backgroundColor: '#D1A253',
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    borderRadius: 6,
  },
  alwaysOnText: {
    color: '#0B0E17',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomContainer: {
    paddingHorizontal: s(16),
    paddingTop: s(12),
    paddingBottom: s(20),
    backgroundColor: '#0B0E17',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#D1A253',
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    color: '#0B0E17',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: '#0B0E17',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonDisabled: {
    backgroundColor: '#1E293B',
    opacity: 0.6,
  },
  submitButtonTextDisabled: {
    color: '#64748B',
  },
});
