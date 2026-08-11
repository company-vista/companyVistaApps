import { StyleSheet, View } from 'react-native';
import AnimatedAppear from '../../../components/AnimatedAppear';
import ComplianceStatusSection from '../screens/compliances/ComplianceStatusSection';
import HomeHeroSection from './home/HomeHeroSection';
import RecentActivityAndPaymentOverviewSection from './home/RecentActivityAndPaymentOverviewSection';
import UpcomingDeadlinesSection from './home/UpcomingDeadlinesSection';
import ActionRequiredSlider from './home/ActionRequiredSlider';
import { useCompanyCompliance } from '../hooks/useCompanyCompliance';
import CompanyVistaReferral from '../../companyVistaReferral/CompanyVistaReferral';


function HomeTabContent({ isLoadingCompanies = false, onCompanyInfoPress, onCompanySwitcherPress, onManagePress, onAddToCompanyPress, onQuickAccessViewAllPress, onTransactionsPress, onServicesPress, onOpenComplianceHistory, selectedCompany, colors, }) {
  const compliance = useCompanyCompliance(selectedCompany?.id);

  return (<View style={styles.container}>
    <AnimatedAppear index={0}>
      <HomeHeroSection isLoadingCompanies={isLoadingCompanies} onCompanyInfoPress={onCompanyInfoPress} onCompanySwitcherPress={onCompanySwitcherPress} onManagePress={onManagePress} onAddToCompanyPress={onAddToCompanyPress} selectedCompany={selectedCompany} />
    </AnimatedAppear>

    <AnimatedAppear index={1}>
      <ActionRequiredSlider />
    </AnimatedAppear>

    <AnimatedAppear index={2}>
      <ComplianceStatusSection companyId={selectedCompany?.id} dueDatesByTitle={compliance.dueDatesByTitle} statusesByTitle={compliance.statusesByTitle} isLoadingDueDates={compliance.isLoading} onOpenComplianceHistory={onOpenComplianceHistory} />
    </AnimatedAppear>

    <AnimatedAppear index={3}>
      <RecentActivityAndPaymentOverviewSection onPress={onTransactionsPress} onServicesPress={onServicesPress} selectedCompany={selectedCompany} />
    </AnimatedAppear>
    <AnimatedAppear index={4}>
      <UpcomingDeadlinesSection rawDueDatesByTitle={compliance.rawDueDatesByTitle} isLoading={compliance.isLoading} />
    </AnimatedAppear>
    <AnimatedAppear index={5}>
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
