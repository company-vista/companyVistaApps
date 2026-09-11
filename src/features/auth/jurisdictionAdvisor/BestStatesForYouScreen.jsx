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

const FILTER_TAGS = [
  { id: '1', label: '🌐 Fully remote' },
  { id: '2', label: '💰 Lowest cost' },
  { id: '3', label: 'No funding planned' },
  { id: '4', label: '✏️ Edit', isAction: true },
];

const FEATURES = [
  {
    boldText: '$100 state fee',
    normalText: ' and only ',
    boldText2: '$60 a year',
    normalText2: ' after — the lowest running cost of any credible state.',
  },
  {
    boldText: 'No state income, franchise or gross receipts tax',
    normalText: ' of any kind.',
  },
  {
    boldText: 'Members stay off public record',
    normalText: ', with a lifetime proxy available if you want more.',
  },
  {
    boldText: '3–5 days',
    normalText: ' to form — among the fastest.',
  },
];

const CLOSE_ALTERNATIVES = [
  { icon: '🌵', name: 'New Mexico', desc: '$349 · no annual report ever · anonymous', match: '91%' },
  { icon: '🐎', name: 'Kentucky', desc: '$339 · cheapest to form · $15/yr', match: '85%' },
  { icon: '⚖️', name: 'Delaware', desc: '$423 · $300/yr · only if raising capital', match: '64%' },
];

const STATES_DATA = [
  {
    icon: '⛰️', name: 'Wyoming', subtitle: 'LLC · best value overall', match: '94%', price: '$399', priceNote: '$299 package + $100 state', timeframe: '3–5 days',
    features: FEATURES, warning: 'if you later raise VC money, expect investors to ask you to redomesticate to Delaware.',
    desc: '$100 state fee and only $60 a year after',
  },
  {
    icon: '🌵', name: 'New Mexico', subtitle: 'No annual report ever', match: '91%', price: '$349', priceNote: '$299 package + $50 state', timeframe: '5–7 days',
    features: [
      { boldText: 'No annual report ever', normalText: ' — truly set and forget.' },
      { boldText: 'Anonymous LLC', normalText: ' — members not on public record.' },
      { boldText: '$50 state fee', normalText: ' — cheapest credible option.' },
      { boldText: '5–7 days', normalText: ' to form.' },
    ], warning: 'less prestige than Wyoming with banks and vendors.',
    desc: '$349 · no annual report ever · anonymous',
  },
  {
    icon: '🐎', name: 'Kentucky', subtitle: 'Cheapest to form', match: '85%', price: '$339', priceNote: '$299 package + $40 state', timeframe: '7–10 days',
    features: [
      { boldText: '$15/yr', normalText: ' annual fee — lowest running cost.' },
      { boldText: 'Fast online filing', normalText: ' — simple process.' },
      { boldText: 'Good for bootstrapped', normalText: ' founders.' },
      { boldText: '7–10 days', normalText: ' to form.' },
    ], warning: 'fewer banking options than Wyoming/New Mexico.',
    desc: '$339 · cheapest to form · $15/yr',
  },
  {
    icon: '⚖️', name: 'Delaware', subtitle: 'Only if raising capital', match: '64%', price: '$423', priceNote: '$123 package + $300 state', timeframe: '3–5 days',
    features: [
      { boldText: 'Investor standard', normalText: ' — VCs prefer Delaware C-Corp.' },
      { boldText: '$300/yr franchise tax', normalText: ' — expensive to maintain.' },
      { boldText: 'Court of Chancery', normalText: ' — strong legal precedent.' },
      { boldText: '3–5 days', normalText: ' to form.' },
    ], warning: 'overkill and costly if you are not raising VC money.',
    desc: '$423 · $300/yr · only if raising capital',
  },
];

export default function BestStatesForYouScreen({ navigation, route }) {
  const [selected, setSelected] = useState(STATES_DATA[0]);
  const alternatives = STATES_DATA.filter(s => s.name !== selected.name);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E17" />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>
          Best <Text style={styles.titleItalic}>states</Text> for you
        </Text>
        <Text style={styles.subtitle}>
          Fully remote · lowest cost · no investment planned
        </Text>

        {/* Filter Tags */}
        <View style={styles.tagsContainer}>
          {FILTER_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagPill,
                tag.isAction && styles.actionTagPill,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.tagText}>{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Best Match Card */}
        <View style={styles.matchCard}>
          {/* Badge */}
          <View style={styles.bestMatchBadge}>
            <Text style={styles.badgeText}>★ BEST MATCH</Text>
          </View>

          {/* Card Header Info - dynamic selected */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.stateIcon}>{selected.icon}</Text>
              <View>
                <Text style={styles.stateName}>{selected.name}</Text>
                <Text style={styles.stateSubtitle}>{selected.subtitle}</Text>
              </View>
            </View>

            <View style={styles.matchPercentageContainer}>
              <Text style={styles.matchPercentage}>{selected.match}</Text>
              <Text style={styles.matchLabel}>MATCH</Text>
            </View>
          </View>

          {/* Features List - dynamic */}
          <View style={styles.featuresList}>
            {selected.features.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.featureText}>
                  <Text style={styles.featureBold}>{item.boldText}</Text>
                  {item.normalText}
                  {item.boldText2 && (
                    <Text style={styles.featureBold}>{item.boldText2}</Text>
                  )}
                  {item.normalText2 && item.normalText2}
                </Text>
              </View>
            ))}
          </View>

          {/* Warning Note - dynamic */}
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              <Text style={styles.warningBold}>Watch:</Text> {selected.warning}
            </Text>
          </View>

          {/* Pricing Footer - dynamic */}
          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>{selected.price}</Text>
              <Text style={styles.priceNote}>{selected.priceNote}</Text>
            </View>
            <Text style={styles.timeframeText}>{selected.timeframe}</Text>
          </View>
        </View>

        {/* Close Alternatives Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CLOSE ALTERNATIVES</Text>
          <View style={styles.sectionDivider} />
        </View>

        {alternatives.map(item => (
          <TouchableOpacity key={item.name} style={styles.altCard} activeOpacity={0.7} onPress={() => setSelected(STATES_DATA.find(s => s.name === item.name))}>
            <View style={styles.altLeft}>
              <Text style={styles.altIcon}>{item.icon}</Text>
              <View style={styles.altTextWrap}>
                <Text style={styles.altName}>{item.name}</Text>
                <Text style={styles.altDesc}>{item.desc}</Text>
              </View>
            </View>
            <View style={styles.altMatchWrap}>
              <Text style={styles.altMatch}>{item.match}</Text>
              <Text style={styles.altMatchLabel}>MATCH</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.savingCard}>
          <Text style={styles.savingIcon}>✓</Text>
          <Text style={styles.savingText}>Saving $380 over 3 years versus Delaware, with no practical downside for your situation.</Text>
        </View>
      </ScrollView>

      {/* Bottom Action Area */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => navigation.navigate('CompanyNaming', { ...(route?.params || {}), bestState: selected.name, advisorFlow: true })}>
          <Text style={styles.actionButtonText}>
            Continue with {selected.name} · {selected.price}  →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.browseButton} activeOpacity={0.7}>
          <Text style={styles.browseText}>
            Compare all 51 states
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
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: s(20),
  },
  title: {
    fontSize: font.display,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: s(8),
  },
  titleItalic: {
    fontStyle: 'italic',
    color: '#D1A253',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: s(6),
    marginBottom: s(16),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(8),
    marginBottom: s(20),
  },
  tagPill: {
    backgroundColor: '#151329',
    paddingHorizontal: s(12),
    paddingVertical: s(6),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D264A',
  },
  actionTagPill: {
    backgroundColor: '#121724',
    borderColor: '#1E2638',
  },
  tagText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '500',
  },
  matchCard: {
    backgroundColor: '#121622',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3D321D',
    padding: s(16),
    marginBottom: s(24),
  },
  bestMatchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#262013',
    borderColor: '#D1A253',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    marginBottom: s(16),
  },
  badgeText: {
    color: '#D1A253',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: s(8),
    alignItems: 'center',
    marginBottom: s(20),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateIcon: {
    fontSize: 28,
    marginRight: s(12),
  },
  stateName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stateSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: s(2),
  },
  matchPercentageContainer: {
    alignItems: 'flex-end',
  },
  matchPercentage: {
    color: '#D1A253',
    fontSize: 24,
    fontWeight: '300',
  },
  matchLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  featuresList: {
    borderTopWidth: 1,
    borderColor: '#1E2638',
    paddingTop: s(16),
    marginBottom: s(16),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: s(12),
  },
  checkIcon: {
    color: '#10B981',
    fontSize: 14,
    marginRight: s(10),
    marginTop: s(1),
  },
  featureText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  featureBold: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1B18',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D321D',
    padding: s(12),
    marginBottom: s(16),
  },
  warningIcon: {
    fontSize: 14,
    marginRight: s(8),
  },
  warningText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  warningBold: {
    color: '#D1A253',
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: s(8),
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderColor: '#1E2638',
    paddingTop: s(14),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    color: '#D1A253',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: s(8),
  },
  priceNote: {
    color: '#64748B',
    fontSize: 11,
  },
  timeframeText: {
    color: '#64748B',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  altCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121622',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2638',
    paddingHorizontal: s(14),
    paddingVertical: s(12),
    marginTop: s(10),
  },
  altLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: s(10),
  },
  altIcon: {
    fontSize: 20,
  },
  altTextWrap: {
    flex: 1,
  },
  altName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  altDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: s(2),
  },
  altMatchWrap: {
    alignItems: 'flex-end',
    marginLeft: s(8),
  },
  altMatch: {
    color: '#D1A253',
    fontSize: 16,
    fontWeight: '700',
  },
  altMatchLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  savingCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    padding: s(12),
    marginTop: s(14),
    alignItems: 'flex-start',
    gap: s(8),
  },
  savingIcon: {
    color: '#10B981',
    fontSize: 12,
    marginTop: s(1),
  },
  savingText: {
    flex: 1,
    color: '#A7F3D0',
    fontSize: 11,
    lineHeight: 15,
  },
  bottomContainer: {
    paddingHorizontal: s(16),
    paddingTop: s(12),
    paddingBottom: s(20),
    backgroundColor: '#0B0E17',
  },
  actionButton: {
    backgroundColor: '#D1A253',
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#0B0E17',
    fontSize: 15,
    fontWeight: '700',
  },
  browseButton: {
    alignItems: 'center',
    marginTop: s(12),
  },
  browseText: {
    color: '#64748B',
    fontSize: 12,
  },
});
