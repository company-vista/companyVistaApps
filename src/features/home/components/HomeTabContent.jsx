import { StyleSheet, View } from 'react-native';
import AnimatedAppear from '../../../components/AnimatedAppear';
import ComplianceStatusSection from '../screens/compliances/ComplianceStatusSection';
import HomeHeroSection from './home/HomeHeroSection';
import RecentActivityAndPaymentOverviewSection from './home/RecentActivityAndPaymentOverviewSection';
import ActionRequiredSlider from './home/ActionRequiredSlider';
import { useCompanyCompliance } from '../hooks/useCompanyCompliance';
import CompanyVistaReferral from '../../companyVistaReferral/CompanyVistaReferral';


function HomeTabContent({ isLoadingCompanies = false, onCompanyInfoPress, onCompanySwitcherPress, onManagePress, onAddToCompanyPress, onQuickAccessViewAllPress, onTransactionsPress, onServicesPress, onRegistrationTrackingPress, onOpenComplianceHistory, selectedCompany, colors, }) {
  const compliance = useCompanyCompliance(selectedCompany?.id);

  return (<View style={styles.container}>
    <AnimatedAppear index={0}>
      <HomeHeroSection isLoadingCompanies={isLoadingCompanies} onCompanyInfoPress={onCompanyInfoPress} onCompanySwitcherPress={onCompanySwitcherPress} onManagePress={onManagePress} onAddToCompanyPress={onAddToCompanyPress} selectedCompany={selectedCompany} />
    </AnimatedAppear>

    <AnimatedAppear index={1}>
      <ActionRequiredSlider />
    </AnimatedAppear>

    <AnimatedAppear index={2}>
      <ComplianceStatusSection companyId={selectedCompany?.id} dueDatesByTitle={compliance.dueDatesByTitle} rawDueDatesByTitle={compliance.rawDueDatesByTitle} statusesByTitle={compliance.statusesByTitle} isLoadingDueDates={compliance.isLoading} onOpenComplianceHistory={onOpenComplianceHistory} />
    </AnimatedAppear>

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
});
export default HomeTabContent;
