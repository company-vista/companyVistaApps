import { font } from '../../../../theme/typography';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import { s } from '../../../../theme/responsive';
import {
  fetchAdminChangeRequest,
  sendAdminChangeRequestMessage,
  updateAdminChangeRequest,
} from '../api/adminChangeRequestsApi';

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: '#B45309', backgroundColor: '#FEF3C7', dot: '#F59E0B' },
  'in-progress': { label: 'In Progress', color: '#1D4ED8', backgroundColor: '#DBEAFE', dot: '#3B82F6' },
  approved: { label: 'Approved', color: '#15803D', backgroundColor: '#DCFCE7', dot: '#22C55E' },
  rejected: { label: 'Rejected', color: '#B91C1C', backgroundColor: '#FEE2E2', dot: '#EF4444' },
};

const URGENCY_CONFIG = {
  low: { label: 'Low', color: '#15803D', backgroundColor: '#DCFCE7' },
  medium: { label: 'Medium', color: '#B45309', backgroundColor: '#FEF3C7' },
  high: { label: 'High', color: '#B91C1C', backgroundColor: '#FEE2E2' },
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', description: 'Awaiting review', icon: 'time-outline' },
  { value: 'in-progress', label: 'In Progress', description: 'Currently being processed', icon: 'flash-outline' },
  { value: 'approved', label: 'Approve', description: 'Mark as completed', icon: 'checkmark-circle-outline' },
  { value: 'rejected', label: 'Reject', description: 'Decline this request', icon: 'close-circle-outline' },
];

const getStatusStyle = status =>
  STATUS_CONFIG[String(status || '').toLowerCase()] || STATUS_CONFIG.pending;

const getUrgencyStyle = urgency =>
  URGENCY_CONFIG[String(urgency || '').toLowerCase()] || URGENCY_CONFIG.low;

const formatDateTime = value => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

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

const formatKey = key =>
  String(key || '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, char => char.toUpperCase());

const formatValue = value => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={16} color="#64748B" />
    </View>
    <View style={styles.infoCopy}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {value === null || value === undefined || value === '' ? 'Not provided' : value}
      </Text>
    </View>
  </View>
);

const AdminChangeRequestDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const requestId = route.params?.requestId;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('pending');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const loadRequest = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const data = await fetchAdminChangeRequest({ token, id: requestId });
        setRequest(data);
        setStatus(data?.status || 'pending');
        setAdminNote(data?.adminNote || '');
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [requestId, token],
  );

  useFocusEffect(
    useCallback(() => {
      loadRequest();
    }, [loadRequest]),
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateAdminChangeRequest({
        token,
        id: requestId,
        status,
        adminNote,
      });
      setRequest(updated);
      setStatus(updated?.status || status);
      setAdminNote(updated?.adminNote || '');
      Alert.alert('Review saved', 'The change request was updated successfully.');
    } catch (saveError) {
      Alert.alert('Unable to save review', saveError.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async () => {
    const message = replyText.trim();
    if (!message) return;
    try {
      setSendingReply(true);
      const updated = await sendAdminChangeRequestMessage({
        token,
        id: requestId,
        message,
      });
      setRequest(updated);
      setReplyText('');
    } catch (sendError) {
      Alert.alert('Unable to send reply', sendError.message || 'Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const renderState = () => {
    if (loading && !request) {
      return (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading request details...</Text>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
        <Text style={styles.errorText}>{error || 'This request no longer exists.'}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => loadRequest()}
          accessibilityRole="button">
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  };

  const infoRows = request
    ? [
        {
          icon: 'person-outline',
          label: 'Client Name',
          value: `${request.clientId?.firstName || ''} ${request.clientId?.lastName || ''}`.trim(),
        },
        { icon: 'mail-outline', label: 'Email', value: request.clientId?.email },
        { icon: 'call-outline', label: 'Phone', value: request.clientId?.phoneNumber },
        { icon: 'business-outline', label: 'Company', value: request.companyId?.companyName },
        {
          icon: 'document-outline',
          label: 'Registration Number',
          value: request.companyId?.registrationNumber,
        },
        { icon: 'pricetag-outline', label: 'Request Type', value: request.type },
        {
          icon: 'time-outline',
          label: 'Last Updated',
          value: formatDateTime(request.updatedAt),
        },
      ]
    : [];

  const shareholder = request?.shareholderData;
  const shareholderAddress = shareholder
    ? [
        shareholder.address?.addressLine1,
        shareholder.address?.city,
        shareholder.address?.state,
        shareholder.address?.postalCode,
        shareholder.address?.country,
      ]
        .filter(Boolean)
        .join(', ')
    : '';
  const currentStatus = getStatusStyle(request?.status);
  const urgency = getUrgencyStyle(request?.urgency);
  const messages = request?.messages || [];
  const requestedChanges = request?.requestedChanges
    ? Object.entries(request.requestedChanges)
    : [];

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
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Request Details</Text>
          <Text style={styles.subtitle}>Review and respond to this request</Text>
        </View>
      </View>

      {!request ? (
        renderState()
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: s(28) + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadRequest(true)}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }>
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}

          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons name="document-text-outline" size={22} color="#4F46E5" />
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{request.type || 'Change Request'}</Text>
                <Text style={styles.heroMeta} numberOfLines={1}>
                  {request.companyId?.companyName || 'Unknown company'}
                </Text>
                <Text style={styles.heroMeta}>
                  Submitted {formatDateTime(request.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.heroBadges}>
              <View style={[styles.statusBadge, { backgroundColor: currentStatus.backgroundColor }]}>
                <View style={[styles.statusDot, { backgroundColor: currentStatus.dot }]} />
                <Text style={[styles.statusText, { color: currentStatus.color }]}>
                  {currentStatus.label}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: urgency.backgroundColor }]}>
                <Text style={[styles.statusText, { color: urgency.color }]}>
                  {urgency.label} urgency
                </Text>
              </View>
              {request.referenceNumber ? (
                <View style={styles.referenceBadge}>
                  <Text style={styles.referenceText}>#{request.referenceNumber}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.sectionCard}>
            {infoRows.map(row => (
              <InfoRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Message & Requested Changes</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.fieldLabel}>Client Message</Text>
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{request.message || 'No message provided.'}</Text>
            </View>

            {(request.fields || []).length > 0 ? (
              <View style={styles.block}>
                <Text style={styles.fieldLabel}>Selected Fields</Text>
                <View style={styles.tagsRow}>
                  {request.fields.map(field => (
                    <View key={field} style={styles.tag}>
                      <Text style={styles.tagText}>{field}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {requestedChanges.length > 0 ? (
              <View style={styles.block}>
                <Text style={styles.fieldLabel}>Requested Values</Text>
                {requestedChanges.map(([key, value]) => (
                  <View key={key} style={styles.changeRow}>
                    <Text style={styles.changeKey}>{formatKey(key)}</Text>
                    <Text style={styles.changeValue}>{formatValue(value)}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {request.replyToEmail ? (
              <View style={styles.block}>
                <Text style={styles.fieldLabel}>Reply To Email</Text>
                <Text style={styles.plainValue}>{request.replyToEmail}</Text>
              </View>
            ) : null}

            {request.attachment?.url ? (
              <View style={styles.block}>
                <Text style={styles.fieldLabel}>Attachment</Text>
                <Text style={styles.plainValue}>
                  {request.attachment.filename || request.attachment.url}
                </Text>
              </View>
            ) : null}
          </View>

          {shareholder ? (
            <>
              <Text style={styles.sectionTitle}>Shareholder / Director Data</Text>
              <View style={styles.sectionCard}>
                <InfoRow icon="person-outline" label="First Name" value={shareholder.firstName} />
                <InfoRow icon="person-outline" label="Last Name" value={shareholder.lastName} />
                <InfoRow icon="mail-outline" label="Email" value={shareholder.email} />
                <InfoRow
                  icon="call-outline"
                  label="Phone"
                  value={`${shareholder.countryCode || ''} ${shareholder.phoneNumber || ''}`.trim()}
                />
                <InfoRow icon="briefcase-outline" label="Designation" value={shareholder.designation} />
                <InfoRow
                  icon="pie-chart-outline"
                  label="Share Percentage"
                  value={
                    shareholder.sharePercentage !== null &&
                    shareholder.sharePercentage !== undefined
                      ? `${shareholder.sharePercentage}%`
                      : ''
                  }
                />
                <InfoRow
                  icon="card-outline"
                  label="Passport Number"
                  value={shareholder.passportNumber}
                />
                <InfoRow
                  icon="calendar-outline"
                  label="Date of Birth"
                  value={shareholder.dateOfBirth ? formatDate(shareholder.dateOfBirth) : ''}
                />
                <InfoRow icon="location-outline" label="Address" value={shareholderAddress} />
              </View>
            </>
          ) : null}

          <Text style={styles.sectionTitle}>Admin Review</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.fieldLabel}>Set Status</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map(option => {
                const active = status === option.value;
                const config = getStatusStyle(option.value);
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setStatus(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.statusOption,
                      active && {
                        borderColor: config.dot,
                        backgroundColor: config.backgroundColor,
                      },
                    ]}>
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={active ? config.color : '#94A3B8'}
                    />
                    <View style={styles.statusOptionCopy}>
                      <Text
                        style={[
                          styles.statusOptionLabel,
                          active && { color: config.color },
                        ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.statusOptionDescription}>{option.description}</Text>
                    </View>
                    {active ? (
                      <Ionicons name="checkmark-circle" size={19} color={config.dot} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, styles.noteLabel]}>Internal Admin Note</Text>
            <TextInput
              value={adminNote}
              onChangeText={setAdminNote}
              placeholder="Add internal notes visible only to the admin team..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              style={styles.noteInput}
            />

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              accessibilityRole="button">
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Review'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Conversation with Client</Text>
          <View style={styles.sectionCard}>
            {messages.length === 0 ? (
              <Text style={styles.emptyConversation}>
                No replies yet — send a message below to respond to the client.
              </Text>
            ) : (
              <View style={styles.messagesList}>
                {messages.map((message, index) => {
                  const isAdmin = message.sender === 'admin';
                  return (
                    <View
                      key={`${message.createdAt || index}-${index}`}
                      style={[
                        styles.messageBubble,
                        isAdmin ? styles.adminBubble : styles.clientBubble,
                      ]}>
                      <Text
                        style={[
                          styles.bubbleText,
                          isAdmin && styles.adminBubbleText,
                        ]}>
                        {message.message}
                      </Text>
                      <Text
                        style={[
                          styles.bubbleMeta,
                          isAdmin && styles.adminBubbleMeta,
                        ]}>
                        {message.senderName || (isAdmin ? 'Admin' : 'Client')} ·{' '}
                        {formatDateTime(message.createdAt)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.replyRow}>
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Reply to the client..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                style={styles.replyInput}
              />
              <Pressable
                onPress={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                style={[
                  styles.sendButton,
                  (sendingReply || !replyText.trim()) && styles.buttonDisabled,
                ]}
                accessibilityRole="button">
                {sendingReply ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={17} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default AdminChangeRequestDetails;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: s(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: s(38),
    height: s(38),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(10),
    backgroundColor: '#F1F5F9',
    marginRight: s(10),
  },
  headerCopy: { flex: 1 },
  title: { color: '#0F172A', fontSize: font.xl, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: font.xs, marginTop: s(2) },
  scrollContent: { padding: s(16) },
  inlineError: { color: '#B91C1C', fontSize: font.xs, marginBottom: s(10) },
  heroCard: {
    padding: s(14),
    borderRadius: s(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: s(18),
  },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroIcon: {
    width: s(46),
    height: s(46),
    borderRadius: s(13),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginRight: s(11),
  },
  heroCopy: { flex: 1 },
  heroTitle: { color: '#0F172A', fontSize: font.md, fontWeight: '800' },
  heroMeta: { color: '#64748B', fontSize: font.xs, marginTop: s(3) },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(7),
    marginTop: s(12),
    paddingTop: s(11),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
    paddingHorizontal: s(9),
    paddingVertical: s(4),
    borderRadius: s(7),
  },
  statusDot: { width: s(6), height: s(6), borderRadius: s(3) },
  statusText: { fontSize: font.tiny, fontWeight: '700' },
  referenceBadge: {
    paddingHorizontal: s(9),
    paddingVertical: s(4),
    borderRadius: s(7),
    backgroundColor: '#F1F5F9',
  },
  referenceText: { color: '#475569', fontSize: font.tiny, fontWeight: '700' },
  sectionTitle: {
    color: '#0F172A',
    fontSize: font.base,
    fontWeight: '800',
    marginBottom: s(9),
  },
  sectionCard: {
    borderRadius: s(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: s(14),
    marginBottom: s(18),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: s(9),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  infoIcon: {
    width: s(30),
    height: s(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(8),
    backgroundColor: '#F1F5F9',
    marginRight: s(9),
  },
  infoCopy: { flex: 1 },
  infoLabel: {
    color: '#94A3B8',
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { color: '#1E293B', fontSize: font.sm, fontWeight: '600', marginTop: s(2) },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: s(7),
  },
  messageBox: {
    padding: s(12),
    borderRadius: s(10),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: { color: '#334155', fontSize: font.sm, lineHeight: s(21) },
  block: { marginTop: s(14) },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(6) },
  tag: {
    paddingHorizontal: s(9),
    paddingVertical: s(4),
    borderRadius: s(12),
    backgroundColor: '#E0E7FF',
  },
  tagText: { color: '#3730A3', fontSize: font.xs, fontWeight: '600' },
  changeRow: {
    flexDirection: 'row',
    gap: s(10),
    paddingVertical: s(8),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  changeKey: {
    width: s(118),
    color: '#64748B',
    fontSize: font.xs,
    fontWeight: '700',
  },
  changeValue: { flex: 1, color: '#1E293B', fontSize: font.sm, fontWeight: '500' },
  plainValue: { color: '#1E293B', fontSize: font.sm, fontWeight: '500' },
  statusOptions: { gap: s(8), marginBottom: s(16) },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(9),
    paddingHorizontal: s(12),
    paddingVertical: s(10),
    borderRadius: s(11),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  statusOptionCopy: { flex: 1 },
  statusOptionLabel: { color: '#334155', fontSize: font.sm, fontWeight: '700' },
  statusOptionDescription: { color: '#94A3B8', fontSize: font.tiny, marginTop: s(2) },
  noteLabel: { marginTop: 0 },
  noteInput: {
    minHeight: s(96),
    padding: s(11),
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontSize: font.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(7),
    marginTop: s(12),
    paddingVertical: s(12),
    borderRadius: s(11),
    backgroundColor: '#4F46E5',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '700' },
  buttonDisabled: { opacity: 0.55 },
  emptyConversation: {
    color: '#94A3B8',
    fontSize: font.xs,
    fontStyle: 'italic',
    marginBottom: s(12),
  },
  messagesList: { gap: s(9), marginBottom: s(12) },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: s(11),
    paddingVertical: s(8),
    borderRadius: s(12),
  },
  adminBubble: { alignSelf: 'flex-end', backgroundColor: '#4F46E5' },
  clientBubble: { alignSelf: 'flex-start', backgroundColor: '#F1F5F9' },
  bubbleText: { color: '#1E293B', fontSize: font.sm },
  adminBubbleText: { color: '#FFFFFF' },
  bubbleMeta: { color: '#94A3B8', fontSize: font.tiny, marginTop: s(4) },
  adminBubbleMeta: { color: '#C7D2FE' },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: s(8),
    paddingTop: s(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  replyInput: {
    flex: 1,
    minHeight: s(44),
    maxHeight: s(110),
    paddingHorizontal: s(11),
    paddingVertical: s(9),
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontSize: font.sm,
  },
  sendButton: {
    width: s(44),
    height: s(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(10),
    backgroundColor: '#4F46E5',
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
