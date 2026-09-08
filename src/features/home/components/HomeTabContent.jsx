import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedAppear from '../../../components/AnimatedAppear';
import ComplianceStatusSection from '../screens/compliances/ComplianceStatusSection';
import HomeHeroSection from './home/HomeHeroSection';
import RecentActivityAndPaymentOverviewSection from './home/RecentActivityAndPaymentOverviewSection';
import ActionRequiredSlider from './home/ActionRequiredSlider';
import { useCompanyCompliance } from '../hooks/useCompanyCompliance';
import CompanyVistaReferral from '../../companyVistaReferral/CompanyVistaReferral';
import { font } from '../../../theme/typography';


function HomeTabContent({ isLoadingCompanies = false, onCompanyInfoPress, onCompanySwitcherPress, onManagePress, onAddToCompanyPress, onQuickAccessViewAllPress, onTransactionsPress, onServicesPress, onRegistrationTrackingPress, onOpenComplianceHistory, selectedCompany, colors, }) {
  const compliance = useCompanyCompliance(selectedCompany?.id);
  const hasCompany = !!selectedCompany;
  const isLight = colors?.mode === 'light';

  return (<View style={styles.container}>
    <AnimatedAppear index={0}>
      <HomeHeroSection isLoadingCompanies={isLoadingCompanies} onCompanyInfoPress={onCompanyInfoPress} onCompanySwitcherPress={onCompanySwitcherPress} onManagePress={onManagePress} onAddToCompanyPress={onAddToCompanyPress} selectedCompany={selectedCompany} />
    </AnimatedAppear>

    <AnimatedAppear index={1}>
      <ActionRequiredSlider />
    </AnimatedAppear>

    {hasCompany ? (
      <AnimatedAppear index={2}>
        <ComplianceStatusSection companyId={selectedCompany?.id} dueDatesByTitle={compliance.dueDatesByTitle} rawDueDatesByTitle={compliance.rawDueDatesByTitle} statusesByTitle={compliance.statusesByTitle} isLoadingDueDates={compliance.isLoading} onOpenComplianceHistory={onOpenComplianceHistory} />
      </AnimatedAppear>
    ) : !isLoadingCompanies ? (
      <AnimatedAppear index={2}>
        <View style={[styles.setupCard, { backgroundColor: isLight ? colors.cardHighlight : '#0D1B2A', borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)' }]}>
          <Text style={[styles.setupTitle, { color: colors?.text ?? (isLight ? '#0F172A' : '#FFFFFF') }]}>Complete Your Company Setup</Text>
          <Text style={[styles.setupDesc, { color: colors?.muted ?? (isLight ? '#64748B' : '#85B7EB') }]}>
            You haven't registered a company yet. Start now to unlock compliance tracking, banking & documents.
          </Text>
          <Pressable onPress={onAddToCompanyPress} style={[styles.setupBtn, { backgroundColor: isLight ? '#2563EB' : '#D4AF37' }]}>
            <FontAwesome name="plus" size={12} color={isLight ? '#FFFFFF' : '#0A111D'} />
            <Text style={[styles.setupBtnText, { color: isLight ? '#FFFFFF' : '#0A111D' }]}>Register Company Now</Text>
          </Pressable>
        </View>
      </AnimatedAppear>
    ) : null}

    <AnimatedAppear index={3}>
      <RecentActivityAndPaymentOverviewSection onPress={onTransactionsPress} onServicesPress={onServicesPress} onRegistrationTrackingPress={onRegistrationTrackingPress} selectedCompany={selectedCompany} />
    </AnimatedAppear>
    <AnimatedAppear index={4}>
      <CompanyVistaReferral />
    </AnimatedAppear>
  </View>);
}
const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  setupCard: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  setupDesc: {
    fontSize: font.sm,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  setupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  setupBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
export default HomeTabContent;
