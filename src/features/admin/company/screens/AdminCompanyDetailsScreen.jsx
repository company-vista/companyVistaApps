import { font } from '../../../../theme/typography';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useCompanyDetails } from '../hooks/useCompanyDetails';
import {
  addCompanyActivityLog,
  fetchCompanyActivityLog,
  fetchCompanyComplianceHistory,
} from '../api/companyApi';
import { useAppSelector } from '../../../../store/hooks';
import {
  TABS,
  formatDate,
  getAddonComplianceItems,
  getCoreComplianceItems,
  getDocumentCount,
} from '../utils/companyDetails';
import ScreenShell from '../components/ScreenShell';
import TopNav from '../components/TopNav';
import ScreenMessage from '../components/ScreenMessage';
import CompanyHeaderCard from '../components/CompanyHeaderCard';
import { AddonCard, ComplianceCard } from '../components/ComplianceCard';
import { InfoRow } from '../components/InfoCard';
import CompanyOverviewTab from '../components/CompanyOverviewTab';
import CompanyShareholdersTab from '../components/CompanyShareholdersTab';
import CompanyDocumentsTab from '../components/CompanyDocumentsTab';
import CompanyTimelineTab from '../components/CompanyTimelineTab';
import CompanyRecordsHeader from '../components/CompanyRecordsHeader';
import FormationDocumentPicker from '../components/formationDocuments/FormationDocumentPicker';
import FormationDocumentModal from '../components/formationDocuments/FormationDocumentModal';
import { styles } from '../components/companyDetailsStyles';

const CORE_COMPLIANCE_ICONS = {
  agentAddress: 'shield-checkmark-outline',
  stateFiling: 'document-text-outline',
  federalFiling: 'cash-outline',
};

const ADDON_COMPLIANCE_ICONS = {
  itin: 'key-outline',
  personalTax: 'receipt-outline',
  eVerifyDuns: 'ribbon-outline',
};

function formatActivityLogDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleString()
    : 'Date unavailable';
}

export function AdminCompanyHomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    company,
    compliance,
    documents,
    loading,
    refreshing,
    error,
    load,
    onRefresh,
  } = useCompanyDetails(route);

  const documentCount =
    documents?.length || (company ? getDocumentCount(company) : 0);
  const shareholderCount = company?.shareholders?.length || 0;
  const coreCompliance = getCoreComplianceItems(compliance);
  const addonCompliance = getAddonComplianceItems(compliance);
  const [formationPickerVisible, setFormationPickerVisible] = useState(false);
  const [formationModalVisible, setFormationModalVisible] = useState(false);

  const openRecords = useCallback(
    (initialTab = 'overview') => {
      navigation.navigate('AdminCompanyRecords', {
        companyId: company?._id || company?.id,
        company,
        compliance,
        initialTab,
      });
    },
    [navigation, company, compliance],
  );

  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      load({ isRefresh: true });
    }, [load]),
  );

  const handleEdit = useCallback(() => {
    navigation.navigate('EditCompany', {
      companyId: company?._id || company?.id,
      company,
    });
  }, [navigation, company]);

  const handleUpload = useCallback(() => {
    navigation.navigate('UploadCompanyDocument', {
      companyId: company?._id || company?.id,
      company,
    });
  }, [navigation, company]);

  if (!company) {
    return (
      <ScreenMessage
        navigation={navigation}
        loading={loading}
        message={error || 'Company details not found.'}
        onRetry={() => load()}
      />
    );
  }

  return (
    <ScreenShell>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent
      />
      <TopNav navigation={navigation} title="Company" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
          />
        }
      >
        <CompanyHeaderCard
          company={company}
          onEdit={handleEdit}
          onUpload={handleUpload}
          onFormationDocs={() => setFormationPickerVisible(true)}
        />

        <FormationDocumentPicker
          company={company}
          visible={formationPickerVisible}
          onClose={() => setFormationPickerVisible(false)}
          onSelect={key => {
            setFormationPickerVisible(false);
            if (key === 'formation') {
              setFormationModalVisible(true);
            }
          }}
        />
        <FormationDocumentModal
          company={company}
          visible={formationModalVisible}
          onClose={() => setFormationModalVisible(false)}
        />

        {error ? <Text style={styles.inlineError}>{error}</Text> : null}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Core Compliance</Text>
          <View style={styles.criticalPill}>
            <Text style={styles.criticalPillText}>Critical</Text>
          </View>
        </View>

        <View style={styles.complianceGrid}>
          {coreCompliance.map((entry, index) => (
            <ComplianceCard
              key={entry.key}
              wide={index === 0}
              title={entry.title}
              icon={CORE_COMPLIANCE_ICONS[entry.key]}
              item={entry.item}
              onPress={() => openRecords('overview')}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.addonSectionTitle]}>
          Add-on Compliance
        </Text>
        <View style={styles.addonGrid}>
          {addonCompliance.map(entry => (
            <AddonCard
              key={entry.key}
              title={entry.title}
              icon={ADDON_COMPLIANCE_ICONS[entry.key]}
              item={entry.item}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.banner}
          activeOpacity={0.85}
          onPress={() => openRecords('overview')}
        >
          <View style={styles.bannerIcon}>
            <Ionicons name="folder-open-outline" size={20} color="#1E3A8A" />
          </View>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>
              Company registrations & filings
            </Text>
            <Text style={styles.bannerSubtitle}>
              {shareholderCount} shareholder
              {shareholderCount === 1 ? '' : 's'} · {documentCount} document
              {documentCount === 1 ? '' : 's'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#1E3A8A" />
        </TouchableOpacity>

        <View style={[styles.sectionHeaderRow, styles.detailsHeaderRow]}>
          <Text style={styles.sectionTitle}>Company Details</Text>
          <TouchableOpacity onPress={() => openRecords('overview')}>
            <Text style={styles.linkText}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsCard}>
          <InfoRow label="Company type" value={company.companyType || '—'} />
          <InfoRow
            label="Registration number"
            value={company.registrationNumber || '—'}
          />
          <InfoRow
            label="Incorporated"
            value={formatDate(company.registrationDate)}
          />
          <InfoRow
            label="Shareholders"
            value={String(shareholderCount)}
            isLast
          />
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

export function AdminCompanyRecordsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const token = useAppSelector(state => state.auth.token);
  const {
    company,
    compliance,
    documents,
    loading,
    refreshing,
    error,
    load,
    onRefresh,
  } = useCompanyDetails(route);

  const initialTab = TABS.includes(route?.params?.initialTab)
    ? route.params.initialTab
    : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [manualLogAction, setManualLogAction] = useState('Call with client');
  const [manualLogDetails, setManualLogDetails] = useState('');
  const [savingManualLog, setSavingManualLog] = useState(false);
  const [manualLogError, setManualLogError] = useState('');
  const [complianceHistory, setComplianceHistory] = useState([]);
  const [complianceHistoryLoading, setComplianceHistoryLoading] =
    useState(false);
  const [complianceHistoryError, setComplianceHistoryError] = useState('');
  const companyId =
    route?.params?.companyId || company?._id || company?.id || null;

  const loadActivityLogs = useCallback(async () => {
    if (!companyId) return;
    setActivityLoading(true);
    setActivityError('');
    try {
      const logs = await fetchCompanyActivityLog({ token, companyId });
      setActivityLogs(logs);
    } catch (loadError) {
      setActivityError(
        loadError?.message || 'Failed to load activity logs. Please try again.',
      );
    } finally {
      setActivityLoading(false);
    }
  }, [companyId, token]);

  const loadComplianceHistory = useCallback(async () => {
    if (!companyId) return;
    setComplianceHistoryLoading(true);
    setComplianceHistoryError('');
    try {
      const history = await fetchCompanyComplianceHistory({
        token,
        companyId,
      });
      setComplianceHistory(history);
    } catch (loadError) {
      setComplianceHistoryError(
        loadError?.message ||
          'Failed to load compliance history. Please try again.',
      );
    } finally {
      setComplianceHistoryLoading(false);
    }
  }, [companyId, token]);

  useEffect(() => {
    if (activeTab === 'activity') {
      loadActivityLogs();
    }
  }, [activeTab, loadActivityLogs]);

  useEffect(() => {
    if (activeTab === 'timeline') {
      loadComplianceHistory();
    }
  }, [activeTab, loadComplianceHistory]);

  const handleRefresh = useCallback(() => {
    onRefresh();
    if (activeTab === 'activity') {
      loadActivityLogs();
    }
    if (activeTab === 'timeline') {
      loadComplianceHistory();
    }
  }, [activeTab, loadActivityLogs, loadComplianceHistory, onRefresh]);

  const handleAddActivityLog = useCallback(async () => {
    const details = manualLogDetails.trim();
    if (!details) {
      setManualLogError('Describe what happened before saving.');
      return;
    }

    setSavingManualLog(true);
    setManualLogError('');
    try {
      await addCompanyActivityLog({
        token,
        companyId,
        action: manualLogAction.trim() || 'Note',
        details,
      });
      setManualLogDetails('');
      await loadActivityLogs();
    } catch (saveError) {
      setManualLogError(
        saveError?.message || 'Failed to save log entry. Please try again.',
      );
    } finally {
      setSavingManualLog(false);
    }
  }, [
    companyId,
    loadActivityLogs,
    manualLogAction,
    manualLogDetails,
    token,
  ]);

  const shareholderCount = company?.shareholders?.length || 0;
  const documentCount =
    documents?.length || (company ? getDocumentCount(company) : 0);

  const tabs = useMemo(
    () => [
      { key: 'overview', label: 'Overview' },
      {
        key: 'shareholders',
        label: `Shareholders (${shareholderCount})`,
      },
      { key: 'documents', label: `Documents (${documentCount})` },
      { key: 'timeline', label: 'Timeline & Filing' },
      { key: 'upload', label: 'Uploaded Document' },
      { key: 'activity', label: 'Activity Logs' },
    ],
    [shareholderCount, documentCount],
  );

  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      load({ isRefresh: true });
    }, [load]),
  );

  const handleEdit = useCallback(() => {
    navigation.navigate('EditCompany', {
      companyId: company?._id || company?.id,
      company,
    });
  }, [navigation, company]);

  const handleUpload = useCallback(() => {
    navigation.navigate('UploadCompanyDocument', {
      companyId: company?._id || company?.id,
      company,
    });
  }, [navigation, company]);

  if (!company) {
    return (
      <ScreenMessage
        navigation={navigation}
        loading={loading}
        message={error || 'Company details not found.'}
        onRetry={() => load()}
      />
    );
  }

  return (
    <ScreenShell>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent
      />
      <TopNav navigation={navigation} title="Company Details" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
          />
        }
      >
        <CompanyRecordsHeader
          company={company}
          onEdit={handleEdit}
          onUpload={handleUpload}
        />

        {error ? <Text style={styles.inlineError}>{error}</Text> : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {activeTab === 'overview' ? (
          <CompanyOverviewTab company={company} compliance={compliance} />
        ) : null}
        {activeTab === 'shareholders' ? (
          <CompanyShareholdersTab company={company} />
        ) : null}
        {activeTab === 'documents' ? (
          <CompanyDocumentsTab company={company} documents={documents} />
        ) : null}
        {activeTab === 'timeline' ? (
          <CompanyTimelineTab
            company={company}
            compliance={compliance}
            complianceHistory={complianceHistory}
            historyLoading={complianceHistoryLoading}
            historyError={complianceHistoryError}
            onRetryHistory={loadComplianceHistory}
          />
        ) : null}
        {activeTab === 'upload' ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cloud-upload-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyText}>Upload documents</Text>
            <TouchableOpacity
              style={{
                marginTop: 12,
                backgroundColor: '#1E3A8A',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
              activeOpacity={0.8}
              onPress={handleUpload}
            >
              <Text
                style={{ color: '#FFFFFF', fontSize: font.sm, fontWeight: '600' }}
              >
                Go to Upload
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {activeTab === 'activity' ? (
          <View style={styles.activityLogList}>
            <View style={styles.manualLogCard}>
              <Text style={styles.manualLogLabel}>
                Add a manual entry (call, meeting, or note)
              </Text>
              <View style={styles.manualLogPickerWrap}>
                <Picker
                  selectedValue={manualLogAction}
                  onValueChange={setManualLogAction}
                  style={styles.manualLogPicker}
                  accessibilityLabel="Activity type"
                >
                  <Picker.Item label="Call with client" value="Call with client" />
                  <Picker.Item
                    label="Meeting with client"
                    value="Meeting with client"
                  />
                  <Picker.Item label="Email exchange" value="Email exchange" />
                  <Picker.Item label="Internal note" value="Internal note" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
              <TextInput
                value={manualLogDetails}
                onChangeText={value => {
                  setManualLogDetails(value);
                  if (manualLogError) setManualLogError('');
                }}
                placeholder="What was discussed / what happened..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                style={styles.manualLogInput}
                accessibilityLabel="Activity details"
              />
              {manualLogError ? (
                <Text style={styles.activityErrorText}>{manualLogError}</Text>
              ) : null}
              <TouchableOpacity
                style={[
                  styles.manualLogSubmit,
                  savingManualLog && styles.manualLogSubmitDisabled,
                ]}
                activeOpacity={0.8}
                disabled={savingManualLog}
                onPress={handleAddActivityLog}
              >
                {savingManualLog ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.manualLogSubmitText}>Add to log</Text>
                )}
              </TouchableOpacity>
            </View>
            {activityLoading ? (
              <View style={styles.emptyBox}>
                <ActivityIndicator size="small" color="#1E3A8A" />
                <Text style={styles.emptyText}>Loading activity logs...</Text>
              </View>
            ) : activityError ? (
              <View style={styles.emptyBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={32}
                  color="#DC2626"
                />
                <Text style={styles.activityErrorText}>{activityError}</Text>
                <TouchableOpacity
                  style={styles.activityRetryButton}
                  activeOpacity={0.8}
                  onPress={loadActivityLogs}
                >
                  <Text style={styles.activityRetryText}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : activityLogs.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="list-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptyText}>Nothing logged yet.</Text>
              </View>
            ) : (
              activityLogs.map((entry, index) => {
                const isManual = entry?.source === 'manual';
                return (
                  <View
                    key={
                      entry?._id ||
                      entry?.id ||
                      `${entry?.createdAt || 'activity'}-${index}`
                    }
                    style={styles.activityCard}
                  >
                    <View
                      style={[
                        styles.activityIconWrap,
                        isManual && styles.activityManualIconWrap,
                      ]}
                    >
                      <Ionicons
                        name={isManual ? 'call-outline' : 'time-outline'}
                        size={17}
                        color={isManual ? '#7C3AED' : '#1E3A8A'}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <View style={styles.activityHeader}>
                        <Text style={styles.activityAction}>
                          {entry?.action || 'Activity'}
                        </Text>
                        <Text style={styles.activityDate}>
                          {formatActivityLogDate(entry?.createdAt)}
                        </Text>
                      </View>
                      {entry?.details ? (
                        <Text style={styles.activityDetails}>
                          {entry.details}
                        </Text>
                      ) : null}
                      <Text style={styles.activityMeta}>
                        {entry?.performedBy?.name ||
                          entry?.performedBy?.email ||
                          'System'}
                        {isManual ? ' · manual entry' : ''}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}
