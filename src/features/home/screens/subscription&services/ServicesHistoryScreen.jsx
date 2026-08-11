import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { useAppSelector } from '../../../../store/hooks';
import { findServiceBySlugOrName, formatPrice } from '../../../../constants/exploreServicesData';
import { fetchMyServiceRequests } from './api/serviceRequestsHistoryApi';
import ServiceCard from './ServiceCard';

const SERVICE_ICONS = {
  'CPA / Tax Consultation': 'chatbubbles-outline',
  'EIN Application': 'finger-print-outline',
  'Operating Agreement Preparation': 'document-text-outline',
};

function formatDate(value) {
  if (!value) return 'Not set';
  try {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
}

function toAmount(value) {
  if (value == null || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `$${num.toLocaleString('en-US')}`;
}

function normalizeServiceRequests(requests) {
  return (Array.isArray(requests) ? requests : []).map((item, index) => {
    const serviceName = item.serviceName || item.serviceTitle || item.title || item.service?.name || 'Service';
    const companyName = item.companyName || item.companyId?.companyName || item.company?.name || item.company?.companyName || 'Company';
    const serviceKey = item.serviceSlug || item.slug || item.service?.slug || item.serviceId || item.service || serviceName;
    const catalogService = findServiceBySlugOrName(serviceKey) || findServiceBySlugOrName(serviceName);
    const amountValue = item.amount ?? item.totalAmount ?? item.price ?? item.suggestedPrice ?? item.total ?? item.fee ?? catalogService?.price;
    let amount = toAmount(amountValue);
    if (!amount && catalogService) {
      amount = formatPrice(catalogService);
    }
    const status = typeof item.status === 'string' ? item.status.toLowerCase() : '';
    const mode = typeof item.mode === 'string' ? item.mode.toLowerCase() : '';
    const paymentType = item.paymentType || item.paymentMethod || (mode === 'direct_payment' ? 'Paid' : 'Suggested');
    const companyIdValue = item.companyId && typeof item.companyId === 'object'
      ? (item.companyId.id ?? item.companyId._id ?? item.companyId.companyId)
      : item.companyId;
    return {
      id: String(item.id ?? item._id ?? index),
      companyId: companyIdValue ? String(companyIdValue) : '',
      title: serviceName,
      status: status || 'pending',
      paymentType,
      companyName,
      requestedDate: formatDate(item.requestedDate ?? item.createdAt ?? item.date),
      amount: amount || '—',
      icon: SERVICE_ICONS[serviceName] || 'briefcase-outline',
    };
  });
}

export default function ServicesHistoryScreen({ onBackPress, selectedCompany }) {
  const colors = useThemeColors();
  const safeAreaInsets = useSafeAreaInsets();
  const isLight = colors.mode === 'light';
  const token = useAppSelector((state) => state.auth.token);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadServiceHistory = useCallback(async () => {
    setLoading(true);
    const result = await fetchMyServiceRequests(token);
    let requests = normalizeServiceRequests(result.requests);
    if (selectedCompany?.id) {
      const selectedCompanyId = String(selectedCompany.id);
      requests = requests.filter((request) => request.companyId === selectedCompanyId);
    }
    setServiceHistory(requests);
    setError(result.error);
    setLoading(false);
  }, [token, selectedCompany?.id]);

  useEffect(() => {
    loadServiceHistory();
  }, [loadServiceHistory]);

  return (
    <View style={[styles.screen, { backgroundColor: isLight ? '#F1F5F9' : undefined }]}>
      <View style={[styles.headerArea, { backgroundColor: isLight ? '#ffffff' : undefined, paddingTop: safeAreaInsets.top + 12 }]}>
        <View style={styles.header}>
          <BackButton onPress={onBackPress} />
          <Text style={[styles.title, { color: colors.text }]}>Services History</Text>
        </View>
      </View>
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.muted} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: safeAreaInsets.bottom + 24 }}>
          {error ? (
            <View style={styles.centerState}>
              <Text style={[styles.stateText, { color: colors.muted }]}>{error}</Text>
            </View>
          ) : serviceHistory.length === 0 ? (
            <View style={styles.centerState}>
              <Text style={[styles.stateText, { color: colors.muted }]}>No service requests yet.</Text>
            </View>
          ) : (
            serviceHistory.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                status={service.status}
                paymentType={service.paymentType}
                companyName={service.companyName}
                requestedDate={service.requestedDate}
                amount={service.amount}
                icon={service.icon}
                isLight={isLight}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: font.title,
    fontWeight: '600',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  stateText: {
    fontSize: font.base,
    textAlign: 'center',
  },
});
