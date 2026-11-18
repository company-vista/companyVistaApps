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

export const PURPOSES = [
  {
    code: 'STAFFING',
    name: 'Staffing & Recruiting',
    icon: '👥',
    snippet: 'Placing contractors or permanent staff with client companies.',
    complianceFlags: {
      payrollNexus: true,
      workersCompRequired: true,
      stateLicenceRequired: 'varies',
      bondRequired: 'varies',
      eVerifyRequired: 'varies',
      professionalIndemnity: true,
      employerOfRecordRelevant: true,
    },
    jurisdictionNotes: [
      'Hiring or placing workers in a US state usually creates payroll tax nexus in that state, regardless of where the company is formed.',
      'Several states require an employment agency licence and a surety bond before you may place workers.',
      "Workers' compensation insurance is mandatory in nearly every state once you have W-2 employees.",
      'If you place contractors rather than employees, worker-classification rules (notably California AB5) apply.',
      'Many non-resident staffing founders operate through an Employer of Record initially to avoid multi-state registration.',
    ],
    recommendedJurisdictions: ['US', 'GB', 'AE', 'SG'],
    cautionJurisdictions: ['VG', 'KY', 'BZ', 'SC'],
    advisorWeights: { banking: 3, credibility: 3, lowTax: 1, speed: 2, cost: 2, privacy: 0, compliance: 3 },
  },
  {
    code: 'ECOM',
    name: 'E-commerce & Retail',
    icon: '🛒',
    snippet: 'Selling physical or digital products online.',
    complianceFlags: { salesTaxNexus: true, merchantAccountNeeded: true, importDutyRelevant: true },
    jurisdictionNotes: [
      'Economic nexus thresholds trigger state sales tax obligations once you exceed roughly $100k or 200 transactions in a state.',
      'Stripe and PayPal availability is the single biggest jurisdictional constraint.',
    ],
    recommendedJurisdictions: ['US', 'GB', 'AE', 'EE'],
    cautionJurisdictions: ['CN', 'BR'],
    advisorWeights: { banking: 3, credibility: 2, lowTax: 2, speed: 3, cost: 3, privacy: 1, compliance: 1 },
  },
  {
    code: 'CONSULT',
    name: 'Consulting & Professional Services',
    icon: '💼',
    snippet: 'Advisory, freelance or agency services billed to clients.',
    complianceFlags: { professionalIndemnity: true, withholdingTaxRelevant: true },
    jurisdictionNotes: [
      'Client-country withholding tax may apply to service fees; a treaty network reduces this.',
      'Some regulated professions require local qualification recognition.',
    ],
    recommendedJurisdictions: ['US', 'GB', 'AE', 'EE', 'GE'],
    cautionJurisdictions: [],
    advisorWeights: { banking: 2, credibility: 3, lowTax: 3, speed: 3, cost: 3, privacy: 1, compliance: 1 },
  },
  {
    code: 'SAAS',
    name: 'Software & SaaS',
    icon: '💻',
    snippet: 'Subscription software, apps or platforms.',
    complianceFlags: { digitalServicesTax: true, merchantAccountNeeded: true, ipHoldingRelevant: true },
    jurisdictionNotes: [
      'EU and UK digital services VAT applies on B2C sales regardless of where you are formed.',
      'IP holding location affects long-term tax efficiency.',
    ],
    recommendedJurisdictions: ['US', 'GB', 'EE', 'IE', 'SG'],
    cautionJurisdictions: [],
    advisorWeights: { banking: 3, credibility: 3, lowTax: 2, speed: 3, cost: 2, privacy: 1, compliance: 1 },
  },
  {
    code: 'HOLDING',
    name: 'Holding & IP',
    icon: '🏦',
    snippet: 'Owning shares, property, patents or trademarks.',
    complianceFlags: { participationExemption: true, treatyNetworkCritical: true, substanceRequired: true },
    jurisdictionNotes: [
      'Treaty network matters more than headline tax rate.',
      'Economic substance rules now apply in most offshore jurisdictions.',
    ],
    recommendedJurisdictions: ['NL', 'LU', 'SG', 'AE', 'MU', 'VG'],
    cautionJurisdictions: [],
    advisorWeights: { banking: 1, credibility: 2, lowTax: 3, speed: 1, cost: 2, privacy: 3, compliance: 2 },
  },
  {
    code: 'TRADING',
    name: 'Trading & Import/Export',
    icon: '📦',
    snippet: 'Buying and reselling physical goods across borders.',
    complianceFlags: { importDutyRelevant: true, customsRegistration: true, letterOfCreditNeeded: true },
    jurisdictionNotes: [
      'Free zone jurisdictions often provide customs advantages.',
      'Trade finance access depends heavily on banking relationships.',
    ],
    recommendedJurisdictions: ['AE', 'HK', 'SG', 'GB'],
    cautionJurisdictions: ['EE', 'VG'],
    advisorWeights: { banking: 3, credibility: 2, lowTax: 2, speed: 2, cost: 2, privacy: 1, compliance: 2 },
  },
  {
    code: 'CRYPTO',
    name: 'Crypto & Web3',
    icon: '⛓️',
    snippet: 'Token issuance, exchange or blockchain ventures.',
    complianceFlags: { vaspRegistration: true, amlHeavy: true, bankingDifficult: true },
    jurisdictionNotes: [
      'Most jurisdictions require VASP or equivalent registration for exchange activity.',
      'Banking is the hardest constraint — many banks decline crypto businesses outright.',
    ],
    recommendedJurisdictions: ['AE', 'CH', 'SG', 'KY', 'GE'],
    cautionJurisdictions: ['US', 'IN', 'CN'],
    advisorWeights: { banking: 3, credibility: 2, lowTax: 2, speed: 2, cost: 1, privacy: 2, compliance: 3 },
  },
  {
    code: 'STARTUP',
    name: 'Startup Raising Capital',
    icon: '🚀',
    snippet: 'Venture-backed company planning a funding round.',
    complianceFlags: { equityStructureCritical: true, optionPoolNeeded: true, investorFamiliarity: true },
    jurisdictionNotes: [
      'Investors overwhelmingly expect a Delaware C-Corp for US rounds.',
      'Redomestication later is possible but costly and disruptive.',
    ],
    recommendedJurisdictions: ['US', 'GB', 'SG', 'IE'],
    cautionJurisdictions: ['VG', 'BZ', 'SC'],
    advisorWeights: { banking: 2, credibility: 3, lowTax: 1, speed: 2, cost: 1, privacy: 0, compliance: 2 },
  },
  {
    code: 'MARKETING',
    name: 'Marketing & Creative',
    icon: '🎨',
    snippet: 'Advertising, design, content and media production.',
    complianceFlags: { professionalIndemnity: true, ipHoldingRelevant: true },
    jurisdictionNotes: ['Straightforward from a regulatory standpoint in most jurisdictions.'],
    recommendedJurisdictions: ['US', 'GB', 'AE', 'EE', 'GE'],
    cautionJurisdictions: [],
    advisorWeights: { banking: 2, credibility: 2, lowTax: 3, speed: 3, cost: 3, privacy: 1, compliance: 1 },
  },
  {
    code: 'LOGISTICS',
    name: 'Logistics & Transport',
    icon: '🚚',
    snippet: 'Freight forwarding, shipping and last-mile delivery.',
    complianceFlags: { operatingLicenceRequired: true, insuranceHeavy: true, customsRegistration: true },
    jurisdictionNotes: [
      'Freight forwarding requires operating authority in most countries.',
      'US interstate transport requires FMCSA registration.',
    ],
    recommendedJurisdictions: ['AE', 'SG', 'HK', 'NL', 'US'],
    cautionJurisdictions: [],
    advisorWeights: { banking: 2, credibility: 3, lowTax: 1, speed: 2, cost: 2, privacy: 0, compliance: 3 },
  },
  {
    code: 'HEALTH',
    name: 'Healthcare Services',
    icon: '🏥',
    snippet: 'Medical, telehealth, wellness or care services.',
    complianceFlags: { professionalLicenceRequired: true, dataProtectionHeavy: true, insuranceHeavy: true },
    jurisdictionNotes: [
      'Practitioner licensing is state or country specific and rarely portable.',
      'HIPAA in the US and GDPR in the EU impose significant data obligations.',
    ],
    recommendedJurisdictions: ['US', 'GB', 'AE', 'SG'],
    cautionJurisdictions: ['VG', 'BZ', 'SC'],
    advisorWeights: { banking: 2, credibility: 3, lowTax: 1, speed: 1, cost: 1, privacy: 1, compliance: 3 },
  },
  {
    code: 'FINSERV',
    name: 'Financial Services',
    icon: '💹',
    snippet: 'Payments, lending, asset management or advisory.',
    complianceFlags: { regulatoryLicenceRequired: true, capitalAdequacy: true, amlHeavy: true },
    jurisdictionNotes: [
      'Almost all activity requires a financial services licence — expect 6–18 months.',
      'ADGM, DIFC, Singapore and Switzerland have dedicated regimes.',
    ],
    recommendedJurisdictions: ['AE', 'SG', 'CH', 'GB', 'KY'],
    cautionJurisdictions: ['BZ', 'SC'],
    advisorWeights: { banking: 3, credibility: 3, lowTax: 2, speed: 0, cost: 1, privacy: 1, compliance: 3 },
  },
  {
    code: 'REALESTATE',
    name: 'Real Estate',
    icon: '🏠',
    snippet: 'Property investment, development or management.',
    complianceFlags: { localOwnershipRules: true, stampDutyRelevant: true, substanceRequired: true },
    jurisdictionNotes: [
      'Property is generally taxed where it sits, regardless of company location.',
      'Some countries restrict foreign ownership of land.',
    ],
    recommendedJurisdictions: ['US', 'AE', 'GB', 'PT'],
    cautionJurisdictions: [],
    advisorWeights: { banking: 2, credibility: 2, lowTax: 2, speed: 1, cost: 2, privacy: 2, compliance: 2 },
  },
  {
    code: 'EDU',
    name: 'Education & Training',
    icon: '🎓',
    snippet: 'Courses, tutoring, certification and edtech.',
    complianceFlags: { accreditationRelevant: true, digitalServicesTax: true },
    jurisdictionNotes: ['Accreditation is only required if awarding recognised qualifications.'],
    recommendedJurisdictions: ['US', 'GB', 'EE', 'AE'],
    cautionJurisdictions: [],
    advisorWeights: { banking: 2, credibility: 2, lowTax: 2, speed: 3, cost: 3, privacy: 1, compliance: 1 },
  },
  {
    code: 'MANUFACTURING',
    name: 'Manufacturing',
    icon: '🏭',
    snippet: 'Producing or assembling physical goods.',
    complianceFlags: { operatingLicenceRequired: true, environmentalCompliance: true, importDutyRelevant: true },
    jurisdictionNotes: [
      'Requires a physical operating jurisdiction; holding structures sit above it.',
      'Free zones often provide duty relief on imported inputs.',
    ],
    recommendedJurisdictions: ['AE', 'MY', 'IN', 'MX', 'US'],
    cautionJurisdictions: ['VG', 'BZ', 'SC'],
    advisorWeights: { banking: 2, credibility: 2, lowTax: 2, speed: 1, cost: 2, privacy: 0, compliance: 3 },
  },
  {
    code: 'OTHER',
    name: 'Something else',
    icon: '•••',
    snippet: "Tell us more and we'll advise directly.",
    complianceFlags: {},
    jurisdictionNotes: ['Our team will review your activity and recommend accordingly.'],
    recommendedJurisdictions: [],
    cautionJurisdictions: [],
    advisorWeights: { banking: 2, credibility: 2, lowTax: 2, speed: 2, cost: 2, privacy: 1, compliance: 2 },
  },
];

export default function CompanyPurposeScreen({ navigation, route }) {
  const [selectedId, setSelectedId] = useState(null);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          What's the main <Text style={styles.titleItalic}>purpose</Text> of this company?
        </Text>

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          This drives licensing and compliance, not just tax.
        </Text>

        {/* Purpose Options List */}
        {PURPOSES.map((item) => {
          const itemId = item.code || item.id;
          const itemTitle = item.name || item.title;
          const itemDesc = item.snippet || item.description;
          const isSelected = selectedId === itemId;
          return (
            <TouchableOpacity
              key={itemId}
              style={[
                styles.optionCard,
                { backgroundColor: isDark ? themePalette.hex_121724 : colors.surface, borderColor: isDark ? themePalette.hex_1e2638 : colors.border },
                isSelected && { borderColor: themePalette.hex_d1a253, backgroundColor: isDark ? themePalette.hex_161c2c : '#FFFBF0' },
              ]}
              onPress={() => setSelectedId(itemId)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: isDark ? themePalette.hex_1e2638 : colors.surfaceAlt }]}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{itemTitle}</Text>
                <Text style={[styles.optionDescription, { color: colors.muted }]}>{itemDesc}</Text>
              </View>

              <View
                style={[
                  styles.radioOuter,
                  { borderColor: isDark ? themePalette.hex_334155 : colors.inputBorder },
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

      <View style={[styles.bottomContainer, { paddingBottom: s(20) + insets.bottom, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.nextButton, !isDark && { backgroundColor: themePalette.hex_2563eb }, !selectedId && { backgroundColor: isDark ? themePalette.hex_1e293b : '#E2E8F0', opacity: 0.8 }]}
          activeOpacity={0.8}
          disabled={!selectedId}
          onPress={() => navigation.navigate('CustomerLocation', { ...(route?.params || {}), purpose: selectedId })}
        >
          <Text style={[styles.nextButtonText, !isDark && { color: themePalette.hex_ffffff }, !selectedId && { color: isDark ? themePalette.hex_64748b : colors.subtle }]}>Next  →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} activeOpacity={0.7} onPress={() => navigation.navigate('RegisterJurisdiction')}>
          <Text style={[styles.skipText, { color: colors.muted }]}>
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
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: s(20),
  },
  title: {
    fontSize: font.display,
    fontWeight: '500',
    lineHeight: 34,
  },
  titleItalic: {
    fontStyle: 'italic',
    color: themePalette.hex_d1a253,
    fontWeight: '300',
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: font.bodySmall,
    marginTop: s(8),
    marginBottom: s(24),
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: s(16),
    marginBottom: s(12),
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
    fontSize: font.base,
    fontWeight: '600',
    marginBottom: s(4),
  },
  optionDescription: {
    fontSize: font.sm,
    lineHeight: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
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
  bottomContainer: {
    paddingHorizontal: s(20),
    paddingTop: s(12),
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
  skipButton: {
    alignItems: 'center',
    marginTop: s(14),
  },
  skipText: {
    fontSize: font.bodySmall,
  },
  skipHighlight: {
    color: themePalette.hex_d1a253,
    fontWeight: '600',
  },
});
