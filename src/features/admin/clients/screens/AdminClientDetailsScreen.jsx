import { font } from '../../../../theme/typography';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import { s } from '../../../../theme/responsive';
import {
  fetchAdminClient,
  fetchAdminClientCompanies,
} from '../api/adminClientsApi';

const formatDate = value => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const AdminClientDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const clientId = route.params?.clientId;
  const [client, setClient] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [companiesError, setCompaniesError] = useState('');

  const loadClient = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const result = await fetchAdminClient({ token, id: clientId });
        setClient(result);
        try {
          setCompanies(await fetchAdminClientCompanies({ token, id: clientId }));
          setCompaniesError('');
        } catch (companyError) {
          setCompaniesError(companyError.message);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [clientId, token],
  );

  useFocusEffect(
    useCallback(() => {
      loadClient();
    }, [loadClient]),
  );

  const address = [
    client?.address?.addressLine1,
    client?.address?.city,
    client?.address?.state,
    client?.address?.postalCode,
    client?.address?.country,
  ]
    .filter(Boolean)
    .join(', ');

  const infoRows = client
    ? [
        { label: 'Full Name', value: `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A' },
        { label: 'Role', value: client.role || 'Not specified' },
        { label: 'Email', value: client.email || 'N/A' },
        {
          label: 'Phone',
          value: [client.countryCode, client.phoneNumber].filter(Boolean).join(' ') || 'N/A',
        },
        { label: 'Address', value: address || 'N/A' },
        { label: 'SSN / ITIN', value: client.ssn || client.itin?.trim() || 'N/A' },
        { label: 'Primary Contact', value: client.isPrimary ? 'Yes' : 'No' },
        { label: 'Status', value: client.status || 'N/A' },
        { label: 'Member Since', value: formatDate(client.createdAt) },
      ]
    : [];

  const renderHeader = () => (
    <View>
      {client ? (
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(client.firstName || client.email || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>
              {`${client.firstName || ''} ${client.lastName || ''}`.trim() ||
                'Unnamed client'}
            </Text>
            <Text style={styles.email}>{client.email || 'No email address'}</Text>
          </View>
        </View>
      ) : null}
      <Text style={styles.sectionTitle}>Personal Information</Text>
      {infoRows.map(row => (
        <View key={row.label} style={styles.infoRow}>
          <Text style={styles.infoLabel}>{row.label}</Text>
          <Text style={styles.infoValue}>{row.value}</Text>
        </View>
      ))}
      <View style={styles.companiesHeading}>
        <Text style={styles.sectionTitle}>Associated Companies</Text>
        <Text style={styles.companyCount}>{companies.length}</Text>
      </View>
      {companiesError ? (
        <Text style={styles.inlineError}>{companiesError}</Text>
      ) : null}
    </View>
  );

  const renderCompany = ({ item }) => (
    <Pressable
      style={styles.companyCard}
      onPress={() =>
        navigation.navigate('AdminCompanyDetails', {
          companyId: item._id || item.id,
          company: item,
        })
      }
      accessibilityRole="button">
      <View style={styles.companyIcon}>
        <Ionicons name="business-outline" size={19} color="#4F46E5" />
      </View>
      <View style={styles.companyCopy}>
        <Text style={styles.companyName} numberOfLines={1}>
          {item.companyName || 'Unnamed company'}
        </Text>
        <Text style={styles.companyMeta} numberOfLines={1}>
          {[item.companyType, item.registrationStatus]
            .filter(Boolean)
            .join(' · ') || 'Company'}
        </Text>
        <Text style={styles.companyMeta} numberOfLines={1}>
          {[item.stateOfRegistration, item.countryOfIncorporation]
            .filter(Boolean)
            .join(', ') || 'Location unavailable'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, s(12)) }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Client Details</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>
      {loading && !client ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading client details...</Text>
        </View>
      ) : error && !client ? (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => loadClient()}
            accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item, index) => String(item._id || item.id || index)}
          renderItem={renderCompany}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <Text style={styles.emptyCompanies}>
              {companiesError ? 'Unable to load associated companies.' : 'No associated companies.'}
            </Text>
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: s(24) + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadClient(true)}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default AdminClientDetailsScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    minHeight: s(58),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: s(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: s(38),
    height: s(38),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(10),
    backgroundColor: '#F1F5F9',
  },
  backButtonPlaceholder: { width: s(38) },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#0F172A',
    fontSize: font.lg,
    fontWeight: '800',
  },
  listContent: { padding: s(16) },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(15),
    borderRadius: s(14),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: s(18),
  },
  avatar: {
    width: s(48),
    height: s(48),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(14),
    backgroundColor: '#EEF2FF',
    marginRight: s(12),
  },
  avatarText: { color: '#4F46E5', fontSize: font.xl, fontWeight: '800' },
  profileCopy: { flex: 1 },
  name: { color: '#0F172A', fontSize: font.base, fontWeight: '700' },
  email: { color: '#64748B', fontSize: font.xs, marginTop: s(3) },
  sectionTitle: {
    color: '#0F172A',
    fontSize: font.base,
    fontWeight: '800',
    marginBottom: s(9),
  },
  infoRow: {
    paddingVertical: s(11),
    paddingHorizontal: s(13),
    marginBottom: s(1),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  infoLabel: { color: '#64748B', fontSize: font.xs },
  infoValue: { color: '#0F172A', fontSize: font.sm, fontWeight: '600', marginTop: s(4) },
  companiesHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: s(20),
  },
  companyCount: {
    minWidth: s(25),
    textAlign: 'center',
    color: '#1D4ED8',
    backgroundColor: '#DBEAFE',
    borderRadius: s(12),
    overflow: 'hidden',
    paddingHorizontal: s(7),
    paddingVertical: s(3),
    fontSize: font.xs,
    fontWeight: '700',
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(12),
    marginBottom: s(9),
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  companyIcon: {
    width: s(38),
    height: s(38),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(11),
    backgroundColor: '#EEF2FF',
    marginRight: s(10),
  },
  companyCopy: { flex: 1, marginRight: s(8) },
  companyName: { color: '#0F172A', fontSize: font.sm, fontWeight: '700' },
  companyMeta: { color: '#64748B', fontSize: font.xs, marginTop: s(3) },
  inlineError: { color: '#B91C1C', fontSize: font.xs, marginBottom: s(8) },
  emptyCompanies: {
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: s(18),
    fontSize: font.sm,
  },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: s(24) },
  stateText: { color: '#64748B', fontSize: font.sm, marginTop: s(10) },
  errorText: { color: '#B91C1C', fontSize: font.sm, textAlign: 'center', marginTop: s(10) },
  retryButton: {
    marginTop: s(12),
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: s(8),
    backgroundColor: '#2563EB',
  },
  retryText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '600' },
});
