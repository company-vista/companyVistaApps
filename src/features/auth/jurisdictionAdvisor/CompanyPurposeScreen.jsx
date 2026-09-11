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

const PURPOSES = [
  {
    id: 'staffing',
    title: 'Staffing & Recruiting',
    description: 'Placing contractors or permanent staff with clients',
    icon: '👥',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce & Retail',
    description: 'Products or SaaS sold to customers worldwide',
    icon: '🛒',
  },
  {
    id: 'consulting',
    title: 'Consulting & Services',
    description: 'Freelance, agency or professional services',
    icon: '💼',
  },
  {
    id: 'software',
    title: 'Software & SaaS',
    description: 'Subscription software, apps or platforms',
    icon: '💻',
  },
  {
    id: 'holding',
    title: 'Holding & IP',
    description: 'Own shares, property, patents or trademarks',
    icon: '🏛️',
  },
];

export default function CompanyPurposeScreen({ navigation, route }) {
  const [selectedId, setSelectedId] = useState(null);

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
          What's the main <Text style={styles.titleItalic}>purpose</Text> of this company?
        </Text>
        
        <Text style={styles.subtitle}>
          This drives licensing and compliance, not just tax.
        </Text>

        {/* Purpose Options List */}
        {PURPOSES.map((item) => {
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

              {/* Radio Indicator */}
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
      </ScrollView>

      {/* Bottom Sticky Action Area */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedId && styles.nextButtonDisabled]}
          activeOpacity={0.8}
          disabled={!selectedId}
          onPress={() => navigation.navigate('CustomerLocation', { ...(route?.params || {}), purpose: selectedId })}
        >
          <Text style={[styles.nextButtonText, !selectedId && styles.nextButtonTextDisabled]}>Next  →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} activeOpacity={0.7} onPress={() => navigation.navigate('RegisterJurisdiction')}>
          <Text style={styles.skipText}>
            <Text style={styles.skipHighlight}>Skip</Text> and browse all countries
          </Text>
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
    paddingHorizontal: s(20),
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
    paddingHorizontal: s(20),
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
    fontWeight: '400',
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
    marginBottom: s(24),
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
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    backgroundColor: '#D1A253',
    borderColor: '#D1A253',
  },
  radioInner: {
    width: 0,
    height: 0,
  },
  checkIcon: {
    color: '#0B0E17',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomContainer: {
    paddingHorizontal: s(20),
    paddingTop: s(12),
    paddingBottom: s(20),
    backgroundColor: '#0B0E17',
  },
  nextButton: {
    backgroundColor: '#D1A253',
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#0B0E17',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButtonDisabled: {
    backgroundColor: '#1E293B',
    opacity: 0.6,
  },
  nextButtonTextDisabled: {
    color: '#64748B',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: s(14),
  },
  skipText: {
    color: '#64748B',
    fontSize: 13,
  },
  skipHighlight: {
    color: '#D1A253',
    fontWeight: '600',
  },
});
