import { StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { font } from '../../../theme/typography';
import type { QuickAccessItemId } from '../data/quickAccessItems';
import type { CompanyCardItem } from '../screens/quickAccess/CompanyCard';
import AnimatedAppear from '../../../components/AnimatedAppear';
import ComplianceStatusSection from '../screens/compliances/ComplianceStatusSection';
import HomeHeroSection from './home/HomeHeroSection';
import ExploreServicesSection from './home/ExploreServicesSection';
import RecentActivityAndPaymentOverviewSection from './home/RecentActivityAndPaymentOverviewSection';
import UpcomingDeadlinesSection from './home/UpcomingDeadlinesSection';
import CompanyVistaReferral from '../../companyVistaReferral/CompanyVistaReferral';

type HomeTabContentProps = {
  isLoadingCompanies?: boolean;
  onCompanyInfoPress: () => void;
  onCompanySwitcherPress: () => void;
  onManagePress: () => void;
  onAddToCompanyPress?: () => void;
  onQuickAccessItemPress: (itemId: QuickAccessItemId) => void;
  onQuickAccessViewAllPress: () => void;
  onTransactionsPress?: () => void;
  onServicesPress?: () => void;
  selectedCompany?: CompanyCardItem | null;
  colors?: any;
};

function HomeTabContent({
  isLoadingCompanies = false,
  onCompanyInfoPress,
  onCompanySwitcherPress,
  onManagePress,
  onAddToCompanyPress,
  onQuickAccessItemPress,
  onQuickAccessViewAllPress,
  onTransactionsPress,
  onServicesPress,
  selectedCompany,
  colors,
}: HomeTabContentProps) {
  const isDark = colors?.mode === 'dark';
  return (
    <View style={styles.container}>
      <AnimatedAppear index={0}>
        <HomeHeroSection
          isLoadingCompanies={isLoadingCompanies}
          onCompanyInfoPress={onCompanyInfoPress}
          onCompanySwitcherPress={onCompanySwitcherPress}
          onManagePress={onManagePress}
          onAddToCompanyPress={onAddToCompanyPress}
          selectedCompany={selectedCompany}
        />
      </AnimatedAppear>

      <AnimatedAppear index={1}>
        <View style={[styles.alert, { backgroundColor: isDark ? '#3b1515' : '#FCEBEB', borderColor: isDark ? '#5c2222' : '#F7C1C1' }]}>
          <FontAwesome name="exclamation-circle" size={15} color={isDark ? '#fca5a5' : '#A32D2D'} />
          <View style={styles.alertCopy}>
            <Text style={[styles.alertTitle, { color: isDark ? '#fca5a5' : '#791F1F' }]}>Action required</Text>
            <Text style={[styles.alertText, { color: isDark ? '#f87171' : '#501313' }]}>
              Delaware Franchise Tax is overdue. Late fees of $200/month apply.
              File immediately to maintain Good Standing.
            </Text>
          </View>
          <Text style={[styles.alertAction, { color: isDark ? '#fca5a5' : '#A32D2D' }]}>Fix</Text>
        </View>
      </AnimatedAppear>

      <AnimatedAppear index={2}>
        <ComplianceStatusSection
          companyId={selectedCompany?.id}
          onViewAllPress={onQuickAccessViewAllPress}
        />
      </AnimatedAppear>

      <AnimatedAppear index={3}>
        <ExploreServicesSection onQuickAccessItemPress={onQuickAccessItemPress} />
      </AnimatedAppear>
      <AnimatedAppear index={4}>
        <RecentActivityAndPaymentOverviewSection
          onPress={onTransactionsPress}
          onServicesPress={onServicesPress}
          selectedCompany={selectedCompany}
        />
      </AnimatedAppear>
      <AnimatedAppear index={5}>
        <UpcomingDeadlinesSection />
      </AnimatedAppear>
      <AnimatedAppear index={6}>
        <CompanyVistaReferral />
      </AnimatedAppear>
    </View>
  );
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
