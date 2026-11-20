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
import { useThemeColors, useResolvedThemeMode } from '../../../../theme/colors';
import {
  fetchAdminChangeRequest,
  sendAdminChangeRequestMessage,
  updateAdminChangeRequest,
} from '../api/adminChangeRequestsApi';

const getStatusConfig = colors => ({
  pending: {
    label: 'Pending Review',
    color: colors.muted,
    backgroundColor: colors.sheet,
    dot: colors.muted,
  },
  'in-progress': {
    label: 'In Progress',
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    dot: colors.accent,
  },
  approved: {
    label: 'Approved',
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    dot: colors.accent,
  },
  rejected: {
    label: 'Rejected',
    color: colors.danger,
    backgroundColor: colors.sheet,
    dot: colors.danger,
  },
});

const getUrgencyConfig = colors => ({
  low: { label: 'Low', color: colors.accent, backgroundColor: colors.accentSoft },
  medium: { label: 'Medium', color: colors.muted, backgroundColor: colors.sheet },
  high: { label: 'High', color: colors.danger, backgroundColor: colors.sheet },
});

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', description: 'Awaiting review', icon: 'time-outline' },
  { value: 'in-progress', label: 'In Progress', description: 'Currently being processed', icon: 'flash-outline' },
  { value: 'approved', label: 'Approve', description: 'Mark as completed', icon: 'checkmark-circle-outline' },
  { value: 'rejected', label: 'Reject', description: 'Decline this request', icon: 'close-circle-outline' },
];

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

const InfoRow = ({ icon, label, value }) => {
  const colors = useThemeColors();
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: colors.sheet }]}>
        <Ionicons name={icon} size={16} color={colors.muted} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={[styles.infoLabel, { color: colors.subtle }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>
          {value === null || value === undefined || value === '' ? 'Not provided' : value}
        </Text>
      </View>
    </View>
  );
};

const AdminChangeRequestDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const colors = useThemeColors();
  const isDark = useResolvedThemeMode() === 'dark';
  const statusConfig = getStatusConfig(colors);
  const urgencyConfig = getUrgencyConfig(colors);
  const getStatusStyle = status =>
    statusConfig[String(status || '').toLowerCase()] || statusConfig.pending;
  const getUrgencyStyle = urgency =>
    urgencyConfig[String(urgency || '').toLowerCase()] || urgencyConfig.low;
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
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.stateText, { color: colors.muted }]}>
            Loading request details...
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error || 'This request no longer exists.'}
        </Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={() => loadRequest()}
          accessibilityRole="button">
          <Text style={[styles.retryText, { color: colors.buttonText }]}>Try again</Text>
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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, s(12)),
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.backButton, { backgroundColor: colors.sheet }]}>
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Request Details</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Review and respond to this request
          </Text>
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
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }>
          {error ? <Text style={[styles.inlineError, { color: colors.danger }]}>{error}</Text> : null}

          <View
            style={[
              styles.heroCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <View style={styles.heroTop}>
              <View style={[styles.heroIcon, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="document-text-outline" size={22} color={colors.accent} />
              </View>
              <View style={styles.heroCopy}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  {request.type || 'Change Request'}
                </Text>
                <Text style={[styles.heroMeta, { color: colors.muted }]} numberOfLines={1}>
                  {request.companyId?.companyName || 'Unknown company'}
                </Text>
                <Text style={[styles.heroMeta, { color: colors.muted }]}>
                  Submitted {formatDateTime(request.createdAt)}
                </Text>
              </View>
            </View>
            <View style={[styles.heroBadges, { borderTopColor: colors.border }]}>
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
                <View style={[styles.referenceBadge, { backgroundColor: colors.sheet }]}>
                  <Text style={[styles.referenceText, { color: colors.muted }]}>
                    #{request.referenceNumber}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Client Information</Text>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            {infoRows.map(row => (
              <InfoRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Message & Requested Changes
          </Text>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>Client Message</Text>
            <View
              style={[
                styles.messageBox,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}>
              <Text style={[styles.messageText, { color: colors.text }]}>
                {request.message || 'No message provided.'}
              </Text>
            </View>

            {(request.fields || []).length > 0 ? (
              <View style={styles.block}>
                <Text style={[styles.fieldLabel, { color: colors.subtle }]}>Selected Fields</Text>
                <View style={styles.tagsRow}>
                  {request.fields.map(field => (
                    <View key={field} style={[styles.tag, { backgroundColor: colors.accentSoft }]}>
                      <Text style={[styles.tagText, { color: colors.accent }]}>{field}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {requestedChanges.length > 0 ? (
              <View style={styles.block}>
                <Text style={[styles.fieldLabel, { color: colors.subtle }]}>Requested Values</Text>
                {requestedChanges.map(([key, value]) => (
                  <View key={key} style={[styles.changeRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.changeKey, { color: colors.muted }]}>
                      {formatKey(key)}
                    </Text>
                    <Text style={[styles.changeValue, { color: colors.text }]}>
                      {formatValue(value)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {request.replyToEmail ? (
              <View style={styles.block}>
                <Text style={[styles.fieldLabel, { color: colors.subtle }]}>Reply To Email</Text>
                <Text style={[styles.plainValue, { color: colors.text }]}>{request.replyToEmail}</Text>
              </View>
            ) : null}

            {request.attachment?.url ? (
              <View style={styles.block}>
                <Text style={[styles.fieldLabel, { color: colors.subtle }]}>Attachment</Text>
                <Text style={[styles.plainValue, { color: colors.text }]}>
                  {request.attachment.filename || request.attachment.url}
                </Text>
              </View>
            ) : null}
          </View>

          {shareholder ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Shareholder / Director Data
              </Text>
              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <InfoRow icon="person-outline" label="First Name" value={shareholder.firstName} />
                <InfoRow icon="person-outline" label="Last Name" value={shareholder.lastName} />
                <InfoRow icon="mail-outline" label="Email" value={shareholder.email} />
                <InfoRow
                  icon="call-outline"
                  label="Phone"
                  value={`${shareholder.countryCode || ''} ${shareholder.phoneNumber || ''}`.trim()}
                />
                <InfoRow
                  icon="briefcase-outline"
                  label="Designation"
                  value={shareholder.designation}
                />
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

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Admin Review</Text>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>Set Status</Text>
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
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      active && {
                        borderColor: config.dot,
                        backgroundColor: config.backgroundColor,
                      },
                    ]}>
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={active ? config.color : colors.subtle}
                    />
                    <View style={styles.statusOptionCopy}>
                      <Text
                        style={[
                          styles.statusOptionLabel,
                          { color: colors.text },
                          active && { color: config.color },
                        ]}>
                        {option.label}
                      </Text>
                      <Text
                        style={[styles.statusOptionDescription, { color: colors.subtle }]}>
                        {option.description}
                      </Text>
                    </View>
                    {active ? (
                      <Ionicons name="checkmark-circle" size={19} color={config.dot} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, styles.noteLabel, { color: colors.subtle }]}>
              Internal Admin Note
            </Text>
            <TextInput
              value={adminNote}
              onChangeText={setAdminNote}
              placeholder="Add internal notes visible only to the admin team..."
              placeholderTextColor={colors.inputPlaceholder}
              multiline
              textAlignVertical="top"
              style={[
                styles.noteInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
            />

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[
                styles.saveButton,
                { backgroundColor: colors.accent },
                saving && styles.buttonDisabled,
              ]}
              accessibilityRole="button">
              {saving ? (
                <ActivityIndicator size="small" color={colors.buttonText} />
              ) : (
                <Ionicons name="save-outline" size={18} color={colors.buttonText} />
              )}
              <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>
                {saving ? 'Saving...' : 'Save Review'}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Conversation with Client
          </Text>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            {messages.length === 0 ? (
              <Text style={[styles.emptyConversation, { color: colors.subtle }]}>
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
                        { backgroundColor: isAdmin ? colors.accent : colors.sheet },
                      ]}>
                      <Text
                        style={[
                          styles.bubbleText,
                          { color: isAdmin ? colors.buttonText : colors.text },
                        ]}>
                        {message.message}
                      </Text>
                      <Text
                        style={[
                          styles.bubbleMeta,
                          { color: isAdmin ? colors.buttonText : colors.subtle },
                        ]}>
                        {message.senderName || (isAdmin ? 'Admin' : 'Client')} ·{' '}
                        {formatDateTime(message.createdAt)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={[styles.replyRow, { borderTopColor: colors.border }]}>
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Reply to the client..."
                placeholderTextColor={colors.inputPlaceholder}
                multiline
                textAlignVertical="top"
                style={[
                  styles.replyInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
              />
              <Pressable
                onPress={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                style={[
                  styles.sendButton,
                  { backgroundColor: colors.accent },
                  (sendingReply || !replyText.trim()) && styles.buttonDisabled,
                ]}
                accessibilityRole="button">
                {sendingReply ? (
                  <ActivityIndicator size="small" color={colors.buttonText} />
                ) : (
                  <Ionicons name="send" size={17} color={colors.buttonText} />
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
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: s(12),
    borderBottomWidth: 1,
  },
  backButton: {
    width: s(38),
    height: s(38),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(10),
    marginRight: s(10),
  },
  headerCopy: { flex: 1 },
  title: { fontSize: font.xl, fontWeight: '800' },
  subtitle: { fontSize: font.xs, marginTop: s(2) },
  scrollContent: { padding: s(16) },
  inlineError: { fontSize: font.xs, marginBottom: s(10) },
  heroCard: {
    padding: s(14),
    borderRadius: s(14),
    borderWidth: 1,
    marginBottom: s(18),
  },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroIcon: {
    width: s(46),
    height: s(46),
    borderRadius: s(13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(11),
  },
  heroCopy: { flex: 1 },
  heroTitle: { fontSize: font.md, fontWeight: '800' },
  heroMeta: { fontSize: font.xs, marginTop: s(3) },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(7),
    marginTop: s(12),
    paddingTop: s(11),
    borderTopWidth: StyleSheet.hairlineWidth,
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
  },
  referenceText: { fontSize: font.tiny, fontWeight: '700' },
  sectionTitle: {
    fontSize: font.base,
    fontWeight: '800',
    marginBottom: s(9),
  },
  sectionCard: {
    borderRadius: s(14),
    borderWidth: 1,
    padding: s(14),
    marginBottom: s(18),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: s(9),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoIcon: {
    width: s(30),
    height: s(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(8),
    marginRight: s(9),
  },
  infoCopy: { flex: 1 },
  infoLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { fontSize: font.sm, fontWeight: '600', marginTop: s(2) },
  fieldLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: s(7),
  },
  messageBox: {
    padding: s(12),
    borderRadius: s(10),
    borderWidth: 1,
  },
  messageText: { fontSize: font.sm, lineHeight: s(21) },
  block: { marginTop: s(14) },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(6) },
  tag: {
    paddingHorizontal: s(9),
    paddingVertical: s(4),
    borderRadius: s(12),
  },
  tagText: { fontSize: font.xs, fontWeight: '600' },
  changeRow: {
    flexDirection: 'row',
    gap: s(10),
    paddingVertical: s(8),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  changeKey: {
    width: s(118),
    fontSize: font.xs,
    fontWeight: '700',
  },
  changeValue: { flex: 1, fontSize: font.sm, fontWeight: '500' },
  plainValue: { fontSize: font.sm, fontWeight: '500' },
  statusOptions: { gap: s(8), marginBottom: s(16) },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(9),
    paddingHorizontal: s(12),
    paddingVertical: s(10),
    borderRadius: s(11),
    borderWidth: 1.5,
  },
  statusOptionCopy: { flex: 1 },
  statusOptionLabel: { fontSize: font.sm, fontWeight: '700' },
  statusOptionDescription: { fontSize: font.tiny, marginTop: s(2) },
  noteLabel: { marginTop: 0 },
  noteInput: {
    minHeight: s(96),
    padding: s(11),
    borderRadius: s(10),
    borderWidth: 1,
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
  },
  saveButtonText: { fontSize: font.sm, fontWeight: '700' },
  buttonDisabled: { opacity: 0.55 },
  emptyConversation: {
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
  adminBubble: { alignSelf: 'flex-end' },
  clientBubble: { alignSelf: 'flex-start' },
  bubbleText: { fontSize: font.sm },
  bubbleMeta: { fontSize: font.tiny, marginTop: s(4) },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: s(8),
    paddingTop: s(12),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  replyInput: {
    flex: 1,
    minHeight: s(44),
    maxHeight: s(110),
    paddingHorizontal: s(11),
    paddingVertical: s(9),
    borderRadius: s(10),
    borderWidth: 1,
    fontSize: font.sm,
  },
  sendButton: {
    width: s(44),
    height: s(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(10),
  },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: s(24) },
  stateText: { fontSize: font.sm, marginTop: s(10) },
  errorText: { fontSize: font.sm, textAlign: 'center', marginTop: s(10) },
  retryButton: {
    marginTop: s(12),
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: s(8),
  },
  retryText: { fontSize: font.sm, fontWeight: '600' },
});
