import React from 'react';
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
  { id: '1', label: '👥 Staffing' },
  { id: '2', label: '🇺🇸 US clients' },
  { id: '3', label: 'Banking - Low tax - Speed' },
  { id: '4', label: '💳 Cards' },
  { id: '5', label: 'Edit answers', isAction: true },
];

const FEATURES = [
  {
    boldText: 'Stripe and PayPal work natively',
    normalText: ' — essential for US-facing revenue.',
  },
  {
    boldText: 'Banking is straightforward',
    normalText: ' — Mercury, Relay and Wise onboard non-residents remotely.',
  },
  {
    boldText: 'Mature payroll rails',
    normalText: ' for placing workers: Gusto, Rippling, ADP.',
  },
  {
    boldText: '3–7 days',
    normalText: ' to incorporate, with Express EIN in 3–5 days.',
  },
];

const STRONG_ALTERNATIVES = [
  { flag: '🇬🇧', name: 'United Kingdom', desc: 'Stripe-ready · 24hr setup · no agency licence', match: '87%' },
  { flag: '🇦🇪', name: 'United Arab Emirates', desc: '0% tax & visa route · MOHRE licence needed', match: '78%' },
  { flag: '🇸🇬', name: 'Singapore', desc: 'Best Asian banking · resident director required', match: '74%' },
];

const ALSO_POSSIBLE = [
  { flag: '🇮🇪', name: 'Ireland', desc: '12.5% tax · EU access · EEA director needed', match: '69%' },
  { flag: '🇪🇪', name: 'Estonia', desc: '0% retained tax · EU banking harder', match: '66%' },
  { flag: '🇭🇰', name: 'Hong Kong', desc: 'Territorial tax · Asia focused', match: '63%' },
  { flag: '🇨🇦', name: 'Canada', desc: 'USMCA access · BC has no residency rule', match: '61%' },
  { flag: '🇳🇱', name: 'Netherlands', desc: 'Treaty network · slower setup', match: '57%' },
  { flag: '🇬🇪', name: 'Georgia', desc: '0% retained · weak for US clients', match: '52%' },
];

export default function BestMatchesScreen({ navigation, route }) {
  const params = route?.params || {};
  const { purpose, customerLocation, priorities = [], dayOneNeeds = [] } = params;

  // Dynamic filter tags based on user selections
  const purposeLabelMap = { staffing: '👥 Staffing', ecommerce: '🛒 E-commerce', consulting: '💼 Consulting', software: '💻 Software', holding: '🏛️ Holding' };
  const customerLabelMap = { us: '🇺🇸 US clients', eu: '🇪🇺 EU', asia_me: '🌏 Asia & ME', global: '🌐 Global', home: '🏠 Home' };
  const priorityLabelMap = { banking: 'Banking', tax: 'Low tax', fast: 'Fast setup', cost: 'Lowest cost', investor: 'Investor', privacy: 'Privacy', visa: 'Visa', maintenance: 'Low maintenance', reputation: 'Reputation' };
  const dayOneLabelMap = { payments: '💳 Cards', workers: '👥 Workers', multicurrency: '💱 Multi-currency', investment: '📈 Investment', residence_visa: '🪪 Visa', physical_office: '🏢 Office' };

  const dynamicTags = [];
  if (purpose) dynamicTags.push({ id: 'purpose', label: purposeLabelMap[purpose] || purpose });
  if (customerLocation) dynamicTags.push({ id: 'customer', label: customerLabelMap[customerLocation] || customerLocation });
  if (priorities.length) dynamicTags.push({ id: 'priorities', label: priorities.map(p => priorityLabelMap[p] || p).slice(0, 3).join(' · ') });
  if (dayOneNeeds.length) dynamicTags.push({ id: 'dayone', label: dayOneNeeds.map(d => dayOneLabelMap[d] || d).slice(0, 2).join(' · ') });
  dynamicTags.push({ id: 'edit', label: 'Edit answers', isAction: true });
  const displayTags = dynamicTags.length > 1 ? dynamicTags : FILTER_TAGS;

  // Dynamic ranking based on selections
  const allJurisdictions = [
    { flag: '🇺🇸', name: 'United States', subtitle: 'Wyoming or Delaware LLC', base: 70, match: '96%', purposes: ['staffing','ecommerce','consulting','software'], customers: ['us','global'], priorities: ['banking','fast','investor','reputation'], dayOne: ['payments','workers','investment'] },
    { flag: '🇬🇧', name: 'United Kingdom', subtitle: 'Stripe-ready · 24hr setup', desc: 'Stripe-ready · 24hr setup · no agency licence', base: 68, match: '87%', purposes: ['consulting','software','ecommerce'], customers: ['eu','global','home'], priorities: ['reputation','banking','fast'], dayOne: ['payments','multicurrency'] },
    { flag: '🇦🇪', name: 'United Arab Emirates', subtitle: '0% tax & visa route', desc: '0% tax & visa route · MOHRE licence needed', base: 65, match: '78%', purposes: ['holding','consulting'], customers: ['asia_me','global'], priorities: ['tax','privacy','visa'], dayOne: ['residence_visa','physical_office'] },
    { flag: '🇸🇬', name: 'Singapore', subtitle: 'Best Asian banking', desc: 'Best Asian banking · resident director required', base: 64, match: '74%', purposes: ['holding','software'], customers: ['asia_me','global'], priorities: ['banking','reputation','tax'], dayOne: ['multicurrency','investment'] },
    { flag: '🇮🇪', name: 'Ireland', subtitle: '12.5% tax · EU access', desc: '12.5% tax · EU access · EEA director needed', base: 62, match: '69%', purposes: ['software','consulting'], customers: ['eu'], priorities: ['tax','reputation'], dayOne: ['multicurrency'] },
    { flag: '🇪🇪', name: 'Estonia', subtitle: '0% retained tax', desc: '0% retained tax · EU banking harder', base: 60, match: '66%', purposes: ['software','holding'], customers: ['eu','global'], priorities: ['tax','cost','maintenance'], dayOne: ['multicurrency'] },
    { flag: '🇭🇰', name: 'Hong Kong', subtitle: 'Territorial tax', desc: 'Territorial tax · Asia focused', base: 59, match: '63%', purposes: ['holding','ecommerce'], customers: ['asia_me'], priorities: ['tax','privacy'], dayOne: ['multicurrency'] },
    { flag: '🇨🇦', name: 'Canada', subtitle: 'USMCA access', desc: 'USMCA access · BC has no residency rule', base: 58, match: '61%', purposes: ['consulting','ecommerce'], customers: ['us','global'], priorities: ['reputation','cost'], dayOne: ['workers'] },
    { flag: '🇳🇱', name: 'Netherlands', subtitle: 'Treaty network', desc: 'Treaty network · slower setup', base: 55, match: '57%', purposes: ['holding','consulting'], customers: ['eu'], priorities: ['reputation','tax'], dayOne: ['multicurrency'] },
    { flag: '🇬🇪', name: 'Georgia', subtitle: '0% retained', desc: '0% retained · weak for US clients', base: 52, match: '52%', purposes: ['holding'], customers: ['asia_me','home'], priorities: ['cost','tax','privacy'], dayOne: ['residence_visa'] },
  ];

  const scored = allJurisdictions.map(j => {
    let score = j.base;
    if (purpose && j.purposes.includes(purpose)) score += 12;
    if (customerLocation && j.customers.includes(customerLocation)) score += 10;
    priorities.forEach(p => { if (j.priorities.includes(p)) score += 6; });
    dayOneNeeds.forEach(d => { if (j.dayOne.includes(d)) score += 5; });
    return { ...j, score };
  }).sort((a, b) => b.score - a.score);

  const ranked = scored;
  const best = ranked[0];
  const strongAlts = ranked.slice(1, 4);
  const alsoPossible = ranked.slice(4);
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
          Your best <Text style={styles.titleItalic}>matches</Text>
        </Text>
        <Text style={styles.subtitle}>
          10 jurisdictions ranked against your answers.
        </Text>

        {/* Filter Tags - dynamic */}
        <View style={styles.tagsContainer}>
          {displayTags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagPill,
                tag.isAction && styles.actionTagPill,
              ]}
              activeOpacity={0.8}
              onPress={tag.isAction ? () => navigation.navigate('CompanyPurpose', params) : undefined}
            >
              <Text style={styles.tagText}>{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Best Match Main Card */}
        <View style={styles.matchCard}>
          {/* Badge */}
          <View style={styles.bestMatchBadge}>
            <Text style={styles.badgeText}>★ BEST MATCH</Text>
          </View>

          {/* Header Info - dynamic best */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.countryCodeText}>{best.flag}</Text>
              <View>
                <Text style={styles.countryName}>{best.name}</Text>
                <Text style={styles.stateSubtitle}>{best.subtitle}</Text>
              </View>
            </View>

            <View style={styles.matchPercentageContainer}>
              <Text style={styles.matchPercentage}>{best.match}</Text>
              <Text style={styles.matchLabel}>MATCH</Text>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            {FEATURES.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.featureText}>
                  <Text style={styles.featureBold}>{item.boldText}</Text>
                  {item.normalText}
                </Text>
              </View>
            ))}
          </View>

          {/* Warning Note */}
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              <Text style={styles.warningBold}>Watch:</Text> registering in every state where you place workers. Budget for multi-state payroll.
            </Text>
          </View>

          {/* Price Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>$399</Text>
              <Text style={styles.priceNote}>from · incl. state fee</Text>
            </View>
            <Text style={styles.timeframeText}>3–7 days</Text>
          </View>
        </View>

        {/* Strong Alternatives Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STRONG ALTERNATIVES</Text>
          <View style={styles.sectionDivider} />
        </View>

        {strongAlts.map(item => (
          <View key={item.name} style={styles.altCard}>
            <View style={styles.altLeft}>
              <Text style={styles.altFlag}>{item.flag}</Text>
              <View style={styles.altTextWrap}>
                <Text style={styles.altName}>{item.name}</Text>
                <Text style={styles.altDesc}>{item.desc}</Text>
              </View>
            </View>
            <View style={styles.altMatchWrap}>
              <Text style={styles.altMatch}>{item.match}</Text>
              <Text style={styles.altMatchLabel}>MATCH</Text>
            </View>
          </View>
        ))}

        <View style={[styles.sectionHeader, { marginTop: 18 }]}>
          <Text style={styles.sectionTitle}>ALSO POSSIBLE</Text>
          <View style={styles.sectionDivider} />
        </View>

        {alsoPossible.map(item => (
          <View key={item.name} style={[styles.altCard, styles.altCardSmall]}>
            <View style={styles.altLeft}>
              <Text style={[styles.altFlag, { fontSize: 20 }]}>{item.flag}</Text>
              <View style={styles.altTextWrap}>
                <Text style={[styles.altName, { fontSize: 14 }]}>{item.name}</Text>
                <Text style={styles.altDesc}>{item.desc}</Text>
              </View>
            </View>
            <View style={styles.altMatchWrap}>
              <Text style={[styles.altMatch, { fontSize: 16 }]}>{item.match}</Text>
              <Text style={styles.altMatchLabel}>MATCH</Text>
            </View>
          </View>
        ))}

        <View style={styles.excludedCard}>
          <Text style={styles.excludedText}>4 jurisdictions excluded. BVI, Cayman, Belize and Seychelles cannot practically employ or place workers.</Text>
        </View>
        <Text style={styles.guidanceText}>Guidance only, not tax advice. We will flag anything unusual about your case before filing.</Text>
      </ScrollView>

      {/* Bottom Action Area */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => navigation.navigate('USStatePhysicalPresence', params)}>
          <Text style={styles.actionButtonText}>
            Continue with {best.name}  →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.browseButton} activeOpacity={0.7}>
          <Text style={styles.browseText}>
            You can still browse all 50 countries
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
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 24,
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
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: font.display,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 8,
  },
  titleItalic: {
    fontStyle: 'italic',
    color: '#D1A253',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagPill: {
    backgroundColor: '#151329',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    padding: 16,
    marginBottom: 24,
  },
  bestMatchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#262013',
    borderColor: '#D1A253',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 16,
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
    gap: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
    marginRight: 12,
  },
  countryName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stateSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
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
    paddingTop: 16,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkIcon: {
    color: '#10B981',
    fontSize: 14,
    marginRight: 10,
    marginTop: 1,
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
    padding: 12,
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 14,
    marginRight: 8,
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
    gap: 8,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderColor: '#1E2638',
    paddingTop: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    color: '#D1A253',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
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
    marginRight: 12,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  altCardSmall: {
    backgroundColor: '#0F1420',
    borderColor: '#1E2638',
  },
  altLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  altFlag: {
    fontSize: 22,
  },
  altTextWrap: {
    flex: 1,
  },
  altName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  altDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  altMatchWrap: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  altMatch: {
    color: '#D1A253',
    fontSize: 18,
    fontWeight: '700',
  },
  altMatchLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  excludedCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 12,
    marginTop: 16,
  },
  excludedText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  guidanceText: {
    color: '#475569',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 14,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
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
    marginTop: 12,
  },
  browseText: {
    color: '#64748B',
    fontSize: 12,
  },
});
