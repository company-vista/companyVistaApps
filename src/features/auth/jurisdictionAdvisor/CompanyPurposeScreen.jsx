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
          const itemId = item.code || item.id;
          const itemTitle = item.name || item.title;
          const itemDesc = item.snippet || item.description;
          const isSelected = selectedId === itemId;
          return (
            <TouchableOpacity
              key={itemId}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedId(itemId)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{itemTitle}</Text>
                <Text style={styles.optionDescription}>{itemDesc}</Text>
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
