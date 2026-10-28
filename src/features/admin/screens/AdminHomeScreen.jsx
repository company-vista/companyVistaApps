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
      <View style={styles.centeredState}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F8FAFC"
          translucent
        />
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.stateText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredState}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F8FAFC"
          translucent
        />
        <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadOverview()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
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
            tintColor="#1E3A8A"
            colors={['#1E3A8A']}
          />
        }>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.outlinedButton}>
            <Text style={styles.outlinedButtonText}>↑ Upload Document</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>+ Create Invoice</Text>
          </TouchableOpacity>
        </View>

        <AdminStatsCards
          stats={stats}
          currencyTotals={currencyTotals}
        />

        <AdminNewCompanies
          companies={mappedCompanies}
          onViewAll={() => navigation.navigate('AdminCompany')}
        />

        <View style={{ marginTop: 16 }}>
          <AdminRecentInvoices invoices={recentInvoices} />
        </View>

        <QuickActions />

        <View style={styles.financeSection}>
          <Text style={styles.sectionTitle}>Finance</Text>
          <AdminFinanceScreen showHeader={false} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexGrow: 1,
  },
  centeredState: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  actionButtonsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  outlinedButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  outlinedButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  financeSection: {
    marginTop: 12,
  },
});

export default AdminDashboard;
