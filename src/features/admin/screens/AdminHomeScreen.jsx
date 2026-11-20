import { font } from '../../../theme/typography';
import { useThemeColors, useResolvedThemeMode } from '../../../theme/colors';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import logos from  '../../../../src/assets/images/Logo1.png'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../store/hooks';
import AdminStatsCards from '../components/AdminStatsCards';
import AdminRecentInvoices from '../components/AdminRecentInvoices';
import AdminNewCompanies from '../components/AdminNewCompanies';
import { fetchAdminOverview } from '../dashboard/api/dashboardApi';
import { computeInvoiceGrandTotal } from '../dashboard/utils/invoiceTotals';
import {
  formatCurrency,
  formatShortDate,
  formatStatusLabel,
  getCompanyStatusType,
} from '../dashboard/utils/dashboardFormat';
import QuickActions from '../quickActions/QuickActions';
import AdminFinanceScreen from '../finance/AdminFinanceScreen';
import AdminServicesSection from '../services/AdminServicesSection';
import { ImageBackground } from 'react-native-web';

const NEW_COMPANY_SOURCES = ['client_signup', 'public_link'];

const EMPTY_STATS = {
  totalRevenue: 0,
  pendingInvoices: 0,
  totalClients: 0,
  paidInvoices: 0,
};

const AdminDashboard = () => {
  const navigation = useNavigation();
  const token = useAppSelector(state => state.auth.token);
  const colors = useThemeColors();
  const effectiveMode = useResolvedThemeMode();
  const isDark = effectiveMode === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(EMPTY_STATS);
  const [invoices, setInvoices] = useState([]);
  const [newCompanies, setNewCompanies] = useState([]);

  const loadOverview = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (!token) {
        setError('Auth token missing. Please login again.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!isRefresh) {
        setLoading(true);
      }

      try {
        const response = await fetchAdminOverview(token);

        if (!response?.stats && !response?.invoices && !response?.companies) {
          throw new Error(
            response?.errors?.[0]?.message ||
            'Failed to load dashboard. Please try again.',
          );
        }

        const statsData = response?.stats;
        const invoicesData = response?.invoices;
        const companiesData = response?.companies;

        const nextStats = {
          totalRevenue: statsData?.totalRevenue || 0,
          pendingInvoices: statsData?.pendingInvoices || 0,
          totalClients: statsData?.totalClients || 0,
          paidInvoices: statsData?.paidInvoices || 0,
        };

        const allInvoices =
          invoicesData?.success && Array.isArray(invoicesData?.data)
            ? invoicesData.data
            : [];

        if (invoicesData?.success && Array.isArray(invoicesData?.data)) {
          nextStats.paidInvoices = allInvoices.filter(
            invoice =>
              String(invoice.paymentStatus || '').toLowerCase() === 'paid',
          ).length;
          nextStats.pendingInvoices = allInvoices.filter(invoice => {
            const status = String(invoice.paymentStatus || '').toLowerCase();
            return status === 'unpaid' || status === 'partial';
          }).length;
        }

        const allCompanies =
          companiesData?.success && Array.isArray(companiesData?.data)
            ? companiesData.data
            : [];

        setStats(nextStats);
        setInvoices(allInvoices);
        setNewCompanies(
          allCompanies
            .filter(company =>
              NEW_COMPANY_SOURCES.includes(company.requestSource),
            )
            .slice(0, 3),
        );
        setError('');
      } catch (err) {
        if (!isRefresh) {
          setError(err?.message || 'Failed to load dashboard. Please try again.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOverview({ isRefresh: true });
  }, [loadOverview]);

  const currencyTotals = useMemo(() => {
    const revenue = { INR: 0, USD: 0 };
    const pending = { INR: 0, USD: 0 };
    const paid = { INR: 0, USD: 0 };

    invoices.forEach(invoice => {
      const currency = String(invoice.currency || 'USD').toUpperCase();
      if (currency !== 'INR' && currency !== 'USD') return;
      const amount = computeInvoiceGrandTotal(invoice);
      const paymentStatus = String(invoice.paymentStatus || '').toLowerCase();

      revenue[currency] += amount;
      if (paymentStatus === 'paid') {
        paid[currency] += amount;
      } else if (
        paymentStatus === 'unpaid' ||
        paymentStatus === 'partial' ||
        paymentStatus === 'overdue'
      ) {
        pending[currency] += amount;
      }
    });

    return { revenue, paid, pending };
  }, [invoices]);

  const recentInvoices = useMemo(
    () =>
      invoices.slice(0, 6).map(invoice => {
        const status = invoice.paymentStatus || invoice.status || 'pending';
        const currency = String(
          invoice.currency || 'INR',
        ).toUpperCase();
        return {
          id: invoice._id,
          invoiceNumber: invoice.invoiceNumber || 'N/A',
          companyName:
            invoice.company?.companyName ||
            invoice.companyInfo?.name ||
            'N/A',
          amount: formatCurrency(
            computeInvoiceGrandTotal(invoice),
            currency,
          ),
          status,
          statusLabel: formatStatusLabel(status),
        };
      }),
    [invoices],
  );

  const mappedCompanies = useMemo(
    () =>
      newCompanies.map(company => ({
        id: company._id,
        name: company.companyName || 'N/A',
        state: company.stateOfRegistration || 'N/A',
        status: formatStatusLabel(company.registrationStatus),
        statusType: getCompanyStatusType(company.registrationStatus),
        date: formatShortDate(company.createdAt),
      })),
    [newCompanies],
  );

  if (loading) {
    return (
      <View style={[styles.centeredState, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
          translucent
        />
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.stateText, { color: colors.muted }]}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centeredState, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
          translucent
        />
        <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.buttonBackground }]}
          onPress={() => loadOverview()}>
          <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (

    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }>


        {/* <AdminStatsCards
          stats={stats}
          currencyTotals={currencyTotals}
        /> */}

        <QuickActions />

        <View style={styles.financeSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Finance</Text>
          <AdminFinanceScreen showHeader={false} />
        </View>

        <AdminServicesSection />

        <AdminNewCompanies
          companies={mappedCompanies}
          onViewAll={() => navigation.navigate('AdminCompany')}
        />

        <View style={{ marginTop: 16 }}>
          <AdminRecentInvoices
            invoices={recentInvoices}
            onViewAll={() => navigation.navigate('AdminInvoices')}
          />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexGrow: 1,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateText: {
    marginTop: 12,
    fontSize: font.bodySmall,
  },
  errorText: {
    marginTop: 12,
    fontSize: font.bodySmall,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: font.bodySmall,
    fontWeight: '600',
  },

  primaryButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: font.bodySmall,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: font.base,
    fontWeight: '700',
  },
  financeSection: {
    marginTop: 12,
  },
});

export default AdminDashboard;
