import { StyleSheet, View } from 'react-native';
import { s } from '../../../theme/responsive';
import AnimatedAppear from '../../../components/AnimatedAppear';
import HomeHeroSection from './home/HomeHeroSection';
import ServicesButton from '../screens/hero2card/ServicesButton';
import DashboardOverviewCards from './home/DashboardOverviewCards';
import RecentInvoicesSection from './home/RecentInvoicesSection';
import { useCompanyCompliance } from '../hooks/useCompanyCompliance';
import { useCompanyInvoices } from '../hooks/useCompanyInvoices';
import CompanyVistaReferral from '../../companyVistaReferral/CompanyVistaReferral';


function HomeTabContent({ isLoadingCompanies = false, onCompanySwitcherPress, onAddToCompanyPress, onQuickAccessViewAllPress, onServicesPress, onRegistrationTrackingPress, onCompanyProfilePress, onCompanyOverviewPress, onComplianceOverviewPress, onDocumentsOverviewPress, onBillingOverviewPress, onInvoicePress, onOrderPress, selectedCompany, colors, }) {
  const compliance = useCompanyCompliance(selectedCompany?.id);
  const { invoices } = useCompanyInvoices(selectedCompany?.id);

  return (<View style={styles.container}>
    <AnimatedAppear index={0}>
      <HomeHeroSection isLoadingCompanies={isLoadingCompanies} onCompanySwitcherPress={onCompanySwitcherPress} onAddToCompanyPress={onAddToCompanyPress} onOrderPress={onOrderPress ?? onRegistrationTrackingPress} onRegistrationTrackingPress={onRegistrationTrackingPress} onCompanyProfilePress={onCompanyProfilePress} selectedCompany={selectedCompany} />
    </AnimatedAppear>

    <AnimatedAppear index={1}>
      <ServicesButton onPress={onServicesPress} onAddCompanyPress={onAddToCompanyPress} />
    </AnimatedAppear>

    <AnimatedAppear index={2}>
      <DashboardOverviewCards selectedCompany={selectedCompany} compliance={compliance} invoices={invoices} onCompanyPress={onCompanyOverviewPress} onCompliancePress={onComplianceOverviewPress} onDocumentsPress={onDocumentsOverviewPress} onBillingPress={onBillingOverviewPress} />
    </AnimatedAppear>

    <AnimatedAppear index={3}>
      <RecentInvoicesSection selectedCompany={selectedCompany} invoices={invoices} onViewAllPress={onBillingOverviewPress} onInvoicePress={onInvoicePress} />
    </AnimatedAppear>

    <AnimatedAppear index={4}>
      <CompanyVistaReferral />
    </AnimatedAppear>
  </View>);
}
const styles = StyleSheet.create({
  container: {
    marginTop: s(14),
  },
});
export default HomeTabContent;
