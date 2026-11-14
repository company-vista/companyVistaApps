import { font } from '../../../../theme/typography';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import { s } from '../../../../theme/responsive';
import { API_BASE_URL } from '../../../../config/api';
import {
  fetchAdminItinApplications,
  updateAdminItinApplication,
} from '../api/adminItinApplicationsApi';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'action_required', label: 'Action Required' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_OPTIONS = STATUS_FILTERS.filter(option => option.key !== 'all');

const STATUS_CONFIG = {
  new: { label: 'New', color: '#1D4ED8', backgroundColor: '#EFF6FF' },
  under_review: { label: 'Under Review', color: '#B45309', backgroundColor: '#FFFBEB' },
  action_required: { label: 'Action Required', color: '#C2410C', backgroundColor: '#FFF7ED' },
  completed: { label: 'Completed', color: '#047857', backgroundColor: '#ECFDF5' },
  rejected: { label: 'Rejected', color: '#B91C1C', backgroundColor: '#FEF2F2' },
};

const REASON_LABELS = {
  a: '(a) Claiming a tax treaty benefit',
  b: '(b) Nonresident - filing a U.S. federal tax return',
  c: '(c) U.S. resident alien - filing a U.S. federal tax return',
  d: '(d) Dependent of U.S. citizen/resident alien',
  e: '(e) Spouse of U.S. citizen/resident alien',
  f: '(f) Nonresident student/professor/researcher',
  g: '(g) Dependent/spouse of a visa holder',
  h: '(h) Other / claiming an exception',
};

const DOC_LABELS = {
  doc_passport: 'Passport',
  doc_altIds: 'Alternative ID documents',
  doc_visa: 'U.S. visa',
  doc_taxreturn: 'Tax return',
  doc_exception: 'Exception evidence',
  doc_company: 'Company documents',
};

const getStatusStyle = status =>
  STATUS_CONFIG[String(status || '').toLowerCase()] || STATUS_CONFIG.new;

const formatDate = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const titleCase = value =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

const displayValue = value => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

const formatAddress = address => {
  if (!address || typeof address !== 'object') return '';
  const cityLine = [address.city, address.state, address.zip].filter(Boolean).join(', ');
  return [address.line1, address.line2, cityLine, address.country]
    .filter(Boolean)
    .join('\n');
};

const applicantName = application => {
  const fullName = [application.firstName, application.middleName, application.lastName]
    .filter(Boolean)
    .join(' ');
  if (fullName) return fullName;
  const contactName = [application.contactFirst, application.contactLast]
    .filter(Boolean)
    .join(' ');
  return contactName || 'Unnamed applicant';
};

const companyName = application =>
  application.companyId?.companyName ||
  application.linkedCompany?.companyName ||
  application.usCompanyName ||
  '';

const documentUrl = path => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const DetailField = ({ label, value, multiline = false }) => (
  <View style={styles.detailField}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, multiline && styles.detailValueMultiline]}>
      {displayValue(value)}
    </Text>
  </View>
);

const ItinApplicationCard = ({ item, onUpdated }) => {
  const token = useAppSelector(state => state.auth.token);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(item.status || 'new');
  const [adminNotes, setAdminNotes] = useState(item.adminNotes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(item.status || 'new');
    setAdminNotes(item.adminNotes || '');
  }, [item._id, item.status, item.adminNotes]);

  const badge = getStatusStyle(item.status);
  const name = applicantName(item);
  const company = companyName(item);
  const reason = REASON_LABELS[item.reasonCode] || item.reasonCode || '';
  const appId = item._id || item.id;

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateAdminItinApplication({
        token,
        id: appId,
        payload: { status, adminNotes },
      });
      onUpdated(appId, {
        status: updated.status ?? status,
        adminNotes: updated.adminNotes ?? adminNotes,
      });
      Alert.alert('Saved', 'ITIN application updated successfully.');
    } catch (saveError) {
      Alert.alert('Unable to save changes', saveError.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openDocument = async file => {
    const url = documentUrl(file?.path);
    if (!url) {
      Alert.alert('Document unavailable', 'This file has no download link.');
      return;
    }
    try {
      await Linking.openURL(url);
    } catch (linkError) {
      Alert.alert('Unable to open document', linkError.message || 'Please try again.');
    }
  };

  const mailingAddress = formatAddress(item.mailAddr);
  const foreignAddress =
    item.foreignSameAsMailing === false ? formatAddress(item.fgnAddr) : '';

  return (
    <View style={styles.applicationCard}>
      <Pressable
        onPress={() => setExpanded(value => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`ITIN application for ${name}`}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cardHeaderCopy}>
            <Text style={styles.applicantName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.contactText} numberOfLines={1}>
              {item.contactEmail || 'No email'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#94A3B8"
          />
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailLine}>
            <Ionicons name="call-outline" size={15} color="#64748B" />
            <Text style={styles.detailLineText} numberOfLines={1}>
              {[item.contactPhoneCode, item.contactPhone].filter(Boolean).join(' ') ||
                'No phone'}
            </Text>
          </View>
          <View style={styles.detailLine}>
            <Ionicons name="business-outline" size={15} color="#64748B" />
            <Text style={styles.detailLineText} numberOfLines={1}>
              {company || 'No company linked'}
            </Text>
          </View>
          <View style={styles.detailLine}>
            <Ionicons name="help-circle-outline" size={15} color="#64748B" />
            <Text style={styles.detailLineText} numberOfLines={2}>
              {reason || 'Reason not provided'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.applyingBadge}>
            <Text style={styles.applyingBadgeText}>
              {titleCase(item.applyingFor || 'self')}
            </Text>
          </View>
          {item.isExistingClient === 'yes' ? (
            <View style={styles.clientBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#15803D" />
              <Text style={styles.clientBadgeText}>Existing client</Text>
            </View>
          ) : null}
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.expandedPanel}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <View style={styles.detailGrid}>
            <DetailField label="Existing Client" value={titleCase(item.isExistingClient)} />
            <DetailField label="Applying For" value={titleCase(item.applyingFor)} />
            <DetailField label="Contact Name" value={[item.contactFirst, item.contactLast].filter(Boolean).join(' ')} />
            <DetailField label="Contact Email" value={item.contactEmail} />
            <DetailField
              label="Contact Phone"
              value={[item.contactPhoneCode, item.contactPhone].filter(Boolean).join(' ')}
            />
            <DetailField label="US Company" value={company} />
            <DetailField label="Submitted" value={formatDate(item.createdAt)} />
          </View>

          <Text style={styles.sectionTitle}>Reason & Treaty</Text>
          <View style={styles.detailGrid}>
            <DetailField label="Reason" value={reason} multiline />
            <DetailField label="Exception Type" value={item.exceptionType} />
            <DetailField label="Treaty Country" value={item.treatyCountry} />
            <DetailField label="Treaty Article" value={item.treatyArticle} />
            <DetailField label="Relation Name" value={item.relationName} />
            <DetailField label="Relation TIN" value={item.relationTin} />
            <DetailField label="Relation Type" value={item.relationType} />
            <DetailField label="Visa Type" value={item.visaType} />
            <DetailField label="Visa Number" value={item.visaNumber} />
            <DetailField
              label="Visa Expiry"
              value={formatDate(item.visaExpiry) || item.visaExpiryDisplay}
            />
          </View>

          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.detailGrid}>
            <DetailField label="Full Name" value={name} />
            <DetailField
              label="Date of Birth"
              value={formatDate(item.dateOfBirth) || item.dateOfBirthDisplay}
            />
            <DetailField label="Gender" value={titleCase(item.gender)} />
            <DetailField label="Country of Birth" value={item.countryOfBirth} />
            <DetailField label="City of Birth" value={item.cityOfBirth} />
            <DetailField label="Citizenship" value={item.citizenship} />
            <DetailField label="Foreign TIN" value={item.foreignTin} />
            <DetailField
              label="Name at Birth Differs"
              value={item.nameAtBirthDiffers ? 'Yes' : 'No'}
            />
            {item.nameAtBirthDiffers ? (
              <DetailField
                label="Name at Birth"
                value={[item.birthFirstName, item.birthLastName].filter(Boolean).join(' ')}
              />
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Addresses</Text>
          <View style={styles.detailGrid}>
            <DetailField label="Mailing Address Type" value={titleCase(item.mailAddrType)} />
            <DetailField
              label="Mailing Address"
              value={mailingAddress}
              multiline
            />
            <DetailField
              label="Foreign Address Same as Mailing"
              value={item.foreignSameAsMailing !== false ? 'Yes' : 'No'}
            />
            {foreignAddress ? (
              <DetailField label="Foreign Address" value={foreignAddress} multiline />
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>U.S. Connection</Text>
          <View style={styles.detailGrid}>
            <DetailField
              label="Connections"
              value={Array.isArray(item.usConnections) ? item.usConnections.join(', ') : ''}
              multiline
            />
            <DetailField label="U.S. Company Name" value={item.usCompanyName} />
            <DetailField label="U.S. Company EIN" value={item.usCompanyEin} />
            <DetailField label="U.S. Company State" value={item.usCompanyState} />
            <DetailField
              label="Ownership %"
              value={item.usCompanyOwnership !== undefined ? `${item.usCompanyOwnership}%` : ''}
            />
            <DetailField label="Income Description" value={item.usIncomeDescription} multiline />
            <DetailField label="Tax Year" value={item.taxYear} />
            <DetailField label="Had Prior TIN" value={titleCase(item.hadPriorTin)} />
            <DetailField label="Prior TIN Number" value={item.priorTinNumber} />
            <DetailField label="Prior TIN Name" value={item.priorTinName} />
            <DetailField label="Ever In U.S." value={titleCase(item.everInUS)} />
            <DetailField
              label="Days in U.S. (last 3 years)"
              value={[item.daysUS_y1, item.daysUS_y2, item.daysUS_y3]
                .map(day => (day === undefined || day === null ? '—' : day))
                .join(' / ')}
            />
          </View>

          <Text style={styles.sectionTitle}>Identity Documents</Text>
          <View style={styles.detailGrid}>
            <DetailField label="Has Passport" value={titleCase(item.hasPassport)} />
            <DetailField label="Passport Number" value={item.passportNumber} />
            <DetailField label="Passport Country" value={item.passportCountry} />
            <DetailField
              label="Passport Issue"
              value={formatDate(item.passportIssue) || item.passportIssueDisplay}
            />
            <DetailField
              label="Passport Expiry"
              value={formatDate(item.passportExpiry) || item.passportExpiryDisplay}
            />
            <DetailField label="Alternate Doc 1" value={item.altDoc1Type} />
            <DetailField label="Alternate Doc 2" value={item.altDoc2Type} />
          </View>

          <Text style={styles.sectionTitle}>Filing & Delivery</Text>
          <View style={styles.detailGrid}>
            <DetailField
              label="Tax Return Prep Needed"
              value={item.needTaxReturnPrep ? 'Yes' : 'No'}
            />
            <DetailField label="Filing Method" value={titleCase(item.filingMethod)} />
            <DetailField label="Package Delivery" value={titleCase(item.packageDelivery)} />
            <DetailField
              label="Delivery Address"
              value={item.packageDeliveryAddress}
              multiline
            />
            <DetailField label="Courier Preference" value={titleCase(item.courierPreference)} />
            <DetailField label="Courier Carrier" value={item.courierCarrier} />
            <DetailField
              label="Courier Cost Approved"
              value={item.courierCostApproval ? 'Yes' : 'No'}
            />
            <DetailField label="Delivery Notes" value={item.deliveryNotes} multiline />
            <DetailField
              label="Declaration Agreed"
              value={item.declarationAgree ? 'Yes' : 'No'}
            />
            <DetailField label="Signature Name" value={item.signatureName} />
            <DetailField
              label="Signature Date"
              value={formatDate(item.signatureDate) || item.signatureDateDisplay}
            />
          </View>

          <Text style={styles.sectionTitle}>Uploaded Documents</Text>
          {Object.entries(DOC_LABELS).map(([key, label]) => {
            const files = Array.isArray(item[key]) ? item[key] : [];
            if (!files.length) return null;
            return (
              <View key={key} style={styles.documentGroup}>
                <Text style={styles.documentGroupLabel}>{label}</Text>
                {files.map((file, index) => (
                  <Pressable
                    key={`${key}-${file.filename || index}`}
                    onPress={() => openDocument(file)}
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${file.originalname || label}`}
                    style={styles.documentRow}>
                    <Ionicons name="document-attach-outline" size={16} color="#4F46E5" />
                    <Text style={styles.documentName} numberOfLines={1}>
                      {file.originalname || file.filename || `Document ${index + 1}`}
                    </Text>
                    <Ionicons name="open-outline" size={14} color="#94A3B8" />
                  </Pressable>
                ))}
              </View>
            );
          })}
          {!Object.keys(DOC_LABELS).some(key =>
            Array.isArray(item[key]) && item[key].length > 0,
          ) ? (
            <Text style={styles.noDocuments}>No documents uploaded.</Text>
          ) : null}

          <Text style={styles.sectionTitle}>Review</Text>
          <View style={styles.block}>
            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map(option => {
                const active = status === option.key;
                const config = getStatusStyle(option.key);
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setStatus(option.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.statusOption,
                      active && {
                        borderColor: config.color,
                        backgroundColor: config.backgroundColor,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusOptionText,
                        active && { color: config.color },
                      ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.fieldLabel}>Admin Notes</Text>
            <TextInput
              value={adminNotes}
              onChangeText={setAdminNotes}
              placeholder="Internal notes about this application..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              style={styles.noteInput}
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            accessibilityRole="button">
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="save-outline" size={17} color="#FFFFFF" />
            )}
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const AdminItin = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const loadApplications = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const { applications: items } = await fetchAdminItinApplications({ token });
        setApplications(items);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      loadApplications();
    }, [loadApplications]),
  );

  const handleUpdated = useCallback((id, patch) => {
    setApplications(current =>
      current.map(item =>
        (item._id || item.id) === id ? { ...item, ...patch } : item,
      ),
    );
  }, []);

  const stats = useMemo(
    () => ({
      total: applications.length,
      new: applications.filter(item => item.status === 'new').length,
      under_review: applications.filter(item => item.status === 'under_review').length,
      action_required: applications.filter(item => item.status === 'action_required')
        .length,
      completed: applications.filter(item => item.status === 'completed').length,
      rejected: applications.filter(item => item.status === 'rejected').length,
    }),
    [applications],
  );

  const filteredApplications = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return applications.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!query) return true;
      const haystack = [
        applicantName(item),
        item.contactEmail,
        item.contactPhone,
        companyName(item),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [applications, searchText, statusFilter]);

  const renderApplication = ({ item }) => (
    <ItinApplicationCard item={item} onUpdated={handleUpdated} />
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading ITIN applications...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => loadApplications()}
            accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Ionicons name="card-outline" size={34} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No ITIN applications found</Text>
        <Text style={styles.emptyText}>Try adjusting the filters or search query.</Text>
      </View>
    );
  };

  const listHeader = (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total },
          { label: 'New', value: stats.new },
          { label: 'Under Review', value: stats.under_review },
          { label: 'Action Needed', value: stats.action_required },
          { label: 'Completed', value: stats.completed },
          { label: 'Rejected', value: stats.rejected },
        ].map(stat => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{loading ? '—' : stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={19} color="#94A3B8" />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by name, email, phone, or company..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search ITIN applications"
        />
        {searchText ? (
          <Pressable
            onPress={() => setSearchText('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={19} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        {STATUS_FILTERS.map(filter => {
          const active = statusFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              onPress={() => setStatusFilter(filter.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.filterChip, active && styles.filterChipActive]}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && applications.length > 0 ? (
        <Text style={styles.inlineError}>{error}</Text>
      ) : null}
      <Text style={styles.resultsText}>
        Showing {filteredApplications.length} of {applications.length} applications
      </Text>
    </View>
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
        <View style={styles.headerCopy}>
          <Text style={styles.title}>ITIN Applications</Text>
          <Text style={styles.subtitle}>Review and manage W-7 submissions</Text>
        </View>
      </View>
      <FlatList
        data={filteredApplications}
        keyExtractor={(item, index) => String(item._id || item.id || index)}
        renderItem={renderApplication}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          filteredApplications.length === 0 && styles.emptyListContent,
          { paddingBottom: s(24) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadApplications(true)}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      />
    </View>
  );
};

export default AdminItin;

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
  listContent: { paddingHorizontal: s(16), paddingTop: s(12) },
  emptyListContent: { flexGrow: 1 },
  statsRow: { flexDirection: 'row', gap: s(10), paddingBottom: s(12) },
  statCard: {
    minWidth: s(90),
    paddingHorizontal: s(14),
    paddingVertical: s(11),
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  statValue: { color: '#0F172A', fontSize: font.xl, fontWeight: '800' },
  statLabel: { color: '#64748B', fontSize: font.xs, marginTop: s(3) },
  searchBox: {
    minHeight: s(44),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: s(10),
  },
  searchInput: { flex: 1, color: '#0F172A', fontSize: font.sm, paddingVertical: s(8) },
  filterRow: { flexDirection: 'row', gap: s(8), paddingVertical: s(10) },
  filterChip: {
    minHeight: s(34),
    paddingHorizontal: s(12),
    justifyContent: 'center',
    borderRadius: s(18),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  filterText: { color: '#64748B', fontSize: font.xs, fontWeight: '600' },
  filterTextActive: { color: '#1D4ED8' },
  resultsText: { color: '#64748B', fontSize: font.xs, marginBottom: s(8) },
  inlineError: { color: '#B91C1C', fontSize: font.xs, paddingBottom: s(6) },
  applicationCard: {
    padding: s(13),
    marginBottom: s(10),
    borderRadius: s(13),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: s(42),
    height: s(42),
    borderRadius: s(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginRight: s(10),
  },
  avatarText: { color: '#4F46E5', fontSize: font.lg, fontWeight: '800' },
  cardHeaderCopy: { flex: 1, marginRight: s(8) },
  applicantName: { color: '#0F172A', fontSize: font.sm, fontWeight: '700' },
  contactText: { color: '#64748B', fontSize: font.xs, marginTop: s(2) },
  statusBadge: {
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    borderRadius: s(7),
    marginRight: s(6),
  },
  statusText: { fontSize: font.tiny, fontWeight: '700' },
  cardDetails: {
    gap: s(7),
    paddingVertical: s(10),
    marginTop: s(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  detailLine: { flexDirection: 'row', alignItems: 'center', gap: s(7) },
  detailLineText: { flex: 1, color: '#475569', fontSize: font.xs },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingTop: s(8),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  applyingBadge: {
    paddingHorizontal: s(8),
    paddingVertical: s(3),
    borderRadius: s(7),
    backgroundColor: '#F1F5F9',
  },
  applyingBadgeText: { color: '#475569', fontSize: font.tiny, fontWeight: '700' },
  clientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(3),
    paddingHorizontal: s(7),
    paddingVertical: s(3),
    borderRadius: s(7),
    backgroundColor: '#DCFCE7',
  },
  clientBadgeText: { color: '#15803D', fontSize: font.tiny, fontWeight: '700' },
  dateText: { flex: 1, color: '#64748B', fontSize: font.tiny, textAlign: 'right' },
  expandedPanel: {
    marginTop: s(11),
    paddingTop: s(11),
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: font.sm,
    fontWeight: '700',
    marginTop: s(6),
    marginBottom: s(8),
  },
  detailGrid: { gap: s(10), marginBottom: s(6) },
  detailField: { gap: s(2) },
  detailLabel: {
    color: '#94A3B8',
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailValue: { color: '#1E293B', fontSize: font.xs },
  detailValueMultiline: { lineHeight: s(16) },
  documentGroup: { marginBottom: s(10) },
  documentGroupLabel: { color: '#475569', fontSize: font.xs, fontWeight: '600' },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(7),
    paddingVertical: s(8),
    paddingHorizontal: s(10),
    marginTop: s(6),
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  documentName: { flex: 1, color: '#1D4ED8', fontSize: font.xs },
  noDocuments: { color: '#94A3B8', fontSize: font.xs },
  block: { marginTop: s(10), marginBottom: s(4) },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: s(6),
  },
  noteInput: {
    minHeight: s(78),
    padding: s(11),
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontSize: font.sm,
  },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: s(7) },
  statusOption: {
    paddingHorizontal: s(11),
    paddingVertical: s(7),
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  statusOptionText: { color: '#64748B', fontSize: font.xs, fontWeight: '600' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(7),
    marginTop: s(10),
    paddingVertical: s(11),
    borderRadius: s(10),
    backgroundColor: '#4F46E5',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '700' },
  buttonDisabled: { opacity: 0.55 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: s(24) },
  stateText: { color: '#64748B', fontSize: font.sm, marginTop: s(10) },
  errorText: { color: '#B91C1C', fontSize: font.sm, textAlign: 'center', marginTop: s(10) },
  emptyTitle: { color: '#64748B', fontSize: font.sm, fontWeight: '600', marginTop: s(10) },
  emptyText: { color: '#94A3B8', fontSize: font.xs, marginTop: s(4) },
  retryButton: {
    marginTop: s(12),
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: s(8),
    backgroundColor: '#2563EB',
  },
  retryText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '600' },
});
