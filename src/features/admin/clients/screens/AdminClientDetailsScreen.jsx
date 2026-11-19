import { font } from '../../../../theme/typography';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setAuthSession } from '../../../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { s } from '../../../../theme/responsive';
import {
  fetchAdminClient,
  fetchAdminClientCompanies,
  impersonateAdminClient,
  sendAdminClientWelcomeEmail,
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
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const adminUser = useAppSelector(state => state.auth.user);
  const hasCompletedPayment = useAppSelector(
    state => state.auth.hasCompletedPayment,
  );
  const clientId = route.params?.clientId;
  const [client, setClient] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [companiesError, setCompaniesError] = useState('');
  const [impersonating, setImpersonating] = useState(false);
  const [showWelcomeEmailModal, setShowWelcomeEmailModal] = useState(false);
  const [welcomeEmailCompany, setWelcomeEmailCompany] = useState('');
  const [sendingWelcomeEmail, setSendingWelcomeEmail] = useState(false);

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

  const infoChunks = [];
  for (let i = 0; i < infoRows.length; i += 2) {
    infoChunks.push(infoRows.slice(i, i + 2));
  }

  const handleImpersonate = async () => {
    if (!client?._id) return;
    setImpersonating(true);
    try {
      const session = await impersonateAdminClient({ token, id: client._id });
      await AsyncStorage.setItem(
        'vista.adminBackup',
        JSON.stringify({ user: adminUser, token, hasCompletedPayment }),
      );
      await AsyncStorage.setItem(
        'vista.impersonation',
        JSON.stringify({
          adminName: adminUser?.name ||
            `${adminUser?.firstName || ''} ${adminUser?.lastName || ''}`.trim() ||
            'Admin',
        }),
      );
      dispatch(
        setAuthSession({
          user: { ...session.client, role: 'client' },
          token: session.token,
        }),
      );
      Toast.show({ type: 'success', text1: 'Logged in as client' });
    } catch (actionError) {
      Toast.show({
        type: 'error',
        text1: 'Failed to start impersonation session',
        text2: actionError.message,
      });
    } finally {
      setImpersonating(false);
    }
  };

  const handleOpenWelcomeEmailModal = () => {
    setWelcomeEmailCompany(companies[0]?.companyName || '');
    setShowWelcomeEmailModal(true);
  };

  const handleSendWelcomeEmail = async () => {
    if (!client?._id) return;
    setSendingWelcomeEmail(true);
    try {
      const welcomeEmail = await sendAdminClientWelcomeEmail({
        token,
        id: client._id,
        company: welcomeEmailCompany,
      });
      if (welcomeEmail) {
        setClient(previous =>
          previous ? { ...previous, welcomeEmail } : previous,
        );
      }
      Toast.show({ type: 'success', text1: 'Welcome email sent' });
      setShowWelcomeEmailModal(false);
    } catch (actionError) {
      Toast.show({
        type: 'error',
        text1: 'Failed to send welcome email',
        text2: actionError.message,
      });
    } finally {
      setSendingWelcomeEmail(false);
    }
  };

  const handleSendEmail = async () => {
    if (!client?.email) {
      Toast.show({ type: 'error', text1: 'Email address unavailable' });
      return;
    }
    try {
      await Linking.openURL(`mailto:${client.email}`);
    } catch {
      Toast.show({ type: 'error', text1: 'Unable to open email app' });
    }
  };

  const handleMakeCall = async () => {
    if (!client?.phoneNumber) {
      Toast.show({ type: 'error', text1: 'Phone number unavailable' });
      return;
    }
    try {
      await Linking.openURL(`tel:${client.phoneNumber}`);
    } catch {
      Toast.show({ type: 'error', text1: 'Unable to open dialer' });
    }
  };

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
      {client ? (
        <View>
          <View style={styles.actionRow}>
            <Pressable
              style={[
                styles.actionButton,
                styles.loginAction,
                impersonating && styles.actionButtonDisabled,
              ]}
              onPress={handleImpersonate}
              disabled={impersonating}
              accessibilityRole="button"
              accessibilityLabel="Opens the client portal as this client. Logged and time-limited to 1 hour.">
              <Ionicons name="arrow-forward-outline" size={17} color="#7E22CE" />
              <Text style={[styles.actionText, styles.loginActionText]}>
                {impersonating ? 'Starting…' : 'Login as this Client'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.editAction]}
              onPress={() => navigation.navigate('AdminEditClient', { clientId })}
              accessibilityRole="button">
              <Ionicons name="create-outline" size={17} color="#2563EB" />
              <Text style={[styles.actionText, styles.editActionText]}>
                Edit Client
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                styles.welcomeAction,
                styles.actionButtonLast,
              ]}
              onPress={handleOpenWelcomeEmailModal}
              accessibilityRole="button"
              accessibilityLabel={
                client?.welcomeEmail?.sent
                  ? `Last sent ${formatDate(client.welcomeEmail.sentAt)}${client.welcomeEmail.sentCount > 1 ? `, sent ${client.welcomeEmail.sentCount} times` : ''}`
                  : "Sends the same welcome email template that's normally sent automatically at signup"
              }>
              <Ionicons name="mail-outline" size={17} color="#047857" />
              <Text style={[styles.actionText, styles.welcomeActionText]}>
                {client?.welcomeEmail?.sent
                  ? 'Resend Welcome Email'
                  : 'Send Welcome Email'}
              </Text>
            </Pressable>
          </View>
          {client?.welcomeEmail?.sent ? (
            <Text style={styles.welcomeSentText}>
              Welcome email sent {formatDate(client.welcomeEmail.sentAt)}
            </Text>
          ) : null}
        </View>
      ) : null}
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <View style={styles.infoGrid}>
        {infoChunks.map((chunk, chunkIndex) => (
          <View
            key={chunkIndex}
            style={[
              styles.infoGridRow,
              chunkIndex === infoChunks.length - 1 && styles.infoGridRowLast,
            ]}>
            {chunk.map((row, rowIndex) => (
              <View
                key={row.label}
                style={[styles.infoCell, rowIndex === 0 && styles.infoCellLeft]}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.companiesHeading}>
        <Text style={styles.sectionTitle}>Associated Companies</Text>
        <Text style={styles.companyCount}>{companies.length}</Text>
      </View>
      {companiesError ? (
        <Text style={styles.inlineError}>{companiesError}</Text>
      ) : null}
    </View>
  );

  const renderFooter = () =>
    client ? (
      <View style={styles.footerActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.footerActionRow}>
          <Pressable
            style={[styles.footerButton, styles.emailButton]}
            onPress={handleSendEmail}
            accessibilityRole="button">
            <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
            <Text style={styles.footerButtonText}>Send Email</Text>
          </Pressable>
          <Pressable
            style={[styles.footerButton, styles.callButton]}
            onPress={handleMakeCall}
            accessibilityRole="button">
            <Ionicons name="call-outline" size={18} color="#FFFFFF" />
            <Text style={styles.footerButtonText}>Make Call</Text>
          </Pressable>
        </View>
      </View>
    ) : null;

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
          ListFooterComponent={renderFooter}
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
      <Modal
        visible={showWelcomeEmailModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!sendingWelcomeEmail) setShowWelcomeEmailModal(false);
        }}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            if (!sendingWelcomeEmail) setShowWelcomeEmailModal(false);
          }}>
          <Pressable style={styles.modalCard} accessibilityRole="alert">
            <Text style={styles.modalTitle}>
              {client?.welcomeEmail?.sent
                ? 'Resend Welcome Email'
                : 'Send Welcome Email'}
            </Text>
            <Text style={styles.modalMessage}>
              Sends the exact same welcome email template used automatically at
              signup, to {client?.email}.
            </Text>
            {client?.welcomeEmail?.sent ? (
              <Text style={styles.modalWarning}>
                Already sent on {formatDate(client.welcomeEmail.sentAt)}
                {client.welcomeEmail.sentCount > 1
                  ? ` (${client.welcomeEmail.sentCount} times)`
                  : ''}
                .
              </Text>
            ) : null}
            <Text style={styles.modalLabel}>
              Company name (shown in the email)
            </Text>
            <TextInput
              style={styles.modalInput}
              value={welcomeEmailCompany}
              onChangeText={setWelcomeEmailCompany}
              placeholder="e.g. KSJ Recruitment Inc."
              placeholderTextColor="#94A3B8"
              editable={!sendingWelcomeEmail}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowWelcomeEmailModal(false)}
                disabled={sendingWelcomeEmail}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSendButton]}
                onPress={handleSendWelcomeEmail}
                disabled={sendingWelcomeEmail}>
                {sendingWelcomeEmail ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSendText}>Send Email</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  actionRow: {
    flexDirection: 'row',
    marginBottom: s(18),
  },
  actionButton: {
    flex: 1,
    minHeight: s(62),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: s(8),
    paddingHorizontal: s(5),
    marginRight: s(7),
    borderRadius: s(11),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  loginAction: { borderColor: '#9333EA', backgroundColor: '#FAF5FF' },
  editAction: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  welcomeAction: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  actionButtonLast: { marginRight: 0 },
  actionButtonDisabled: { opacity: 0.6 },
  actionText: {
    color: '#1D4ED8',
    fontSize: font.xs,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: s(5),
  },
  loginActionText: { color: '#7E22CE' },
  editActionText: { color: '#2563EB' },
  welcomeActionText: { color: '#047857' },
  welcomeSentText: {
    color: '#94A3B8',
    fontSize: font.xs,
    textAlign: 'right',
    marginTop: -s(12),
    marginBottom: s(14),
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: font.base,
    fontWeight: '800',
    marginBottom: s(9),
  },
  infoGrid: {
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  infoGridRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  infoGridRowLast: { borderBottomWidth: 0 },
  infoCell: {
    flex: 1,
    paddingVertical: s(11),
    paddingHorizontal: s(13),
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: '#E2E8F0',
  },
  infoCellLeft: { borderLeftWidth: 0 },
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
  footerActions: { marginTop: s(20) },
  footerActionRow: { flexDirection: 'row' },
  footerButton: {
    flex: 1,
    minHeight: s(46),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(11),
    marginRight: s(9),
  },
  emailButton: { backgroundColor: '#4F46E5' },
  callButton: { backgroundColor: '#059669', marginRight: 0 },
  footerButtonText: {
    color: '#FFFFFF',
    fontSize: font.sm,
    fontWeight: '700',
    marginLeft: s(8),
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
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: s(18),
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  modalCard: {
    width: '100%',
    padding: s(20),
    borderRadius: s(16),
    backgroundColor: '#FFFFFF',
  },
  modalTitle: { color: '#0F172A', fontSize: font.base, fontWeight: '800' },
  modalMessage: { color: '#64748B', fontSize: font.xs, marginTop: s(6) },
  modalWarning: {
    color: '#B45309',
    fontSize: font.xs,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: s(8),
    paddingHorizontal: s(10),
    paddingVertical: s(8),
    marginTop: s(10),
  },
  modalLabel: {
    color: '#475569',
    fontSize: font.xs,
    fontWeight: '600',
    marginTop: s(14),
    marginBottom: s(6),
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: s(9),
    paddingHorizontal: s(11),
    paddingVertical: s(9),
    color: '#0F172A',
    fontSize: font.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: s(18),
  },
  modalButton: {
    minWidth: s(86),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(14),
    paddingVertical: s(10),
    borderRadius: s(9),
    marginLeft: s(8),
  },
  modalCancelButton: { borderWidth: 1, borderColor: '#CBD5E1' },
  modalSendButton: { backgroundColor: '#059669' },
  modalCancelText: { color: '#475569', fontSize: font.sm, fontWeight: '600' },
  modalSendText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '700' },
});
