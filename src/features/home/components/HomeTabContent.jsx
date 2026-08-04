import { StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { font } from '../../../theme/typography';
import AnimatedAppear from '../../../components/AnimatedAppear';
import ComplianceStatusSection from '../screens/compliances/ComplianceStatusSection';
import HomeHeroSection from './home/HomeHeroSection';
import ExploreServicesSection from './home/ExploreServicesSection';
import RecentActivityAndPaymentOverviewSection from './home/RecentActivityAndPaymentOverviewSection';
import UpcomingDeadlinesSection from './home/UpcomingDeadlinesSection';
import { useCompanyCompliance } from '../hooks/useCompanyCompliance';
import CompanyVistaReferral from '../../companyVistaReferral/CompanyVistaReferral';


function HomeTabContent({ isLoadingCompanies = false, onCompanyInfoPress, onCompanySwitcherPress, onManagePress, onAddToCompanyPress, onQuickAccessItemPress, onQuickAccessViewAllPress, onTransactionsPress, onServicesPress, selectedCompany, colors, }) {
  const isDark = colors?.mode === 'dark';
  const compliance = useCompanyCompliance(selectedCompany?.id);

  const actionRequiredText = `Federal filing is overdue. Late fees of $200/month apply. File immediately to maintain Good Standing.`;
  const alertStyle = {
    backgroundColor: isDark ? '#3b1515' : '#FCEBEB',
    borderColor: isDark ? '#5c2222' : '#F7C1C1',
  };
  const alertTextStyle = {
    color: isDark ? '#f87171' : '#501313',
  };
  const alertTitleStyle = {
    color: isDark ? '#fca5a5' : '#791F1F',
  };
  const alertActionStyle = {
    color: isDark ? '#fca5a5' : '#A32D2D',
  };

  return (<View style={styles.container}>
    <AnimatedAppear index={0}>
      <HomeHeroSection isLoadingCompanies={isLoadingCompanies} onCompanyInfoPress={onCompanyInfoPress} onCompanySwitcherPress={onCompanySwitcherPress} onManagePress={onManagePress} onAddToCompanyPress={onAddToCompanyPress} selectedCompany={selectedCompany} />
    </AnimatedAppear>

    <AnimatedAppear index={1}>
      <View style={[styles.alert, alertStyle]}>
        <FontAwesome name="exclamation-circle" size={15} color={isDark ? '#fca5a5' : '#A32D2D'} />
        <View style={styles.alertCopy}>
          <Text style={[styles.alertTitle, alertTitleStyle]}>Action required</Text>
          <Text style={[styles.alertText, alertTextStyle]}>
            {actionRequiredText}
          </Text>
        </View>
        <Text style={[styles.alertAction, alertActionStyle]}>Fix</Text>
      </View>
    </AnimatedAppear>

    <AnimatedAppear index={2}>
      <ComplianceStatusSection dueDatesByTitle={compliance.dueDatesByTitle} statusesByTitle={compliance.statusesByTitle} isLoadingDueDates={compliance.isLoading} onViewAllPress={onQuickAccessViewAllPress} />
    </AnimatedAppear>

    <AnimatedAppear index={3}>
      <ExploreServicesSection onQuickAccessItemPress={onQuickAccessItemPress} selectedCompany={selectedCompany} />
    </AnimatedAppear>
    <AnimatedAppear index={4}>
      <RecentActivityAndPaymentOverviewSection onPress={onTransactionsPress} onServicesPress={onServicesPress} selectedCompany={selectedCompany} />
    </AnimatedAppear>
    <AnimatedAppear index={5}>
      <UpcomingDeadlinesSection rawDueDatesByTitle={compliance.rawDueDatesByTitle} isLoading={compliance.isLoading} />
    </AnimatedAppear>
    <AnimatedAppear index={6}>
      <CompanyVistaReferral />
    </AnimatedAppear>
  </View>);
}
const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F7C1C1',
    borderRadius: 10,
    backgroundColor: '#FCEBEB',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  alertCopy: {
    flex: 1,
  },
  alertTitle: {
    color: '#791F1F',
    fontSize: font.sm,
    fontWeight: '500',
  },
  alertText: {
    color: '#501313',
    fontSize: font.sm,
    lineHeight: 16,
    marginTop: 1,
  },
  alertAction: {
    color: '#A32D2D',
    fontSize: font.sm,
    fontWeight: '500',
    marginTop: 1,
  },
});
export default HomeTabContent;
