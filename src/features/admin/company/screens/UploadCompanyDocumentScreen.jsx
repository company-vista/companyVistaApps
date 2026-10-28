import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pick, types } from '@react-native-documents/picker';
import { useAppSelector } from '../../../../store/hooks';
import {
  invalidateCompaniesCache,
  searchCompanies,
  SUPPORTED_DOCUMENT_TYPES,
  YEARLY_FILING_TYPES,
  uploadCompanyDocuments,
} from '../api/companyApi';
import ScreenShell from '../components/ScreenShell';
import TopNav from '../components/TopNav';
import SectionCard from '../components/editCompany/SectionCard';
import FormSelect from '../components/editCompany/FormSelect';
import {
  editColors,
  screenStyles,
  sharedStyles,
} from '../components/editCompany/editCompanyStyles';
import { getCompanyName } from '../utils/companyDetails';

const DOCUMENT_TYPE_LABELS = {
  mailsAndLetters: 'Mails and Letters',
  companyRegistrationDocuments: 'Company Registration',
  federalTaxDocuments: 'Federal Tax',
  annualStateFilingDocuments: 'Annual State Filing',
  otherDocuments: 'Other Documents',
};

const DOCUMENT_TYPES = SUPPORTED_DOCUMENT_TYPES.map(value => ({
  value,
  label: DOCUMENT_TYPE_LABELS[value],
}));

const COUNTRY_OPTIONS = [
  { label: 'India', value: 'IN' },
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'Canada', value: 'CA' },
  { label: 'European Union', value: 'EU' },
  { label: 'Australia', value: 'AU' },
  { label: 'Other', value: 'Other' },
];

const FILING_YEAR_OPTIONS = Array.from({ length: 8 }, (_, index) => {
  const year = new Date().getFullYear() - index;
  return { label: String(year), value: String(year) };
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const EMPTY_FILES = [];

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const buildEmptyFiles = () =>
  Object.fromEntries(DOCUMENT_TYPES.map(type => [type.value, []]));

const buildEmptyFilingYears = () =>
  Object.fromEntries(YEARLY_FILING_TYPES.map(type => [type, '']));

const resolveCountry = company => {
  const value = String(
    company?.countryOfIncorporation || company?.country || '',
  ).toLowerCase();
  if (!value) return 'US';
  if (
    value.includes('united states') ||
    value.includes('america') ||
    value === 'usa' ||
    value === 'us'
  ) {
    return 'US';
  }
  if (value.includes('india') || value === 'in') return 'IN';
  if (value.includes('united kingdom') || value === 'gb') return 'UK';
  if (value.includes('canada') || value === 'ca') return 'CA';
  if (value.includes('australia') || value === 'au') return 'AU';
  if (value.includes('europe') || value === 'eu') return 'EU';
  if (value.length === 2) return value.toUpperCase();
  return 'Other';
};

const formatFileSize = bytes => {
  if (!bytes || Number.isNaN(Number(bytes))) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = Number(bytes);
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getFileIcon = name => {
  const extension = String(name || '')
    .split('.')
    .pop()
    .toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(extension)) {
    return 'image-outline';
  }
  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'grid-outline';
  }
  return 'document-text-outline';
};

const UploadCompanyDocumentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);

  const routeCompany = route?.params?.company || null;
  const routeCompanyId =
    route?.params?.companyId || routeCompany?._id || routeCompany?.id || null;
  const initialCompany =
    routeCompany || (routeCompanyId ? { _id: routeCompanyId } : null);

  const [selectedCompany, setSelectedCompany] = useState(initialCompany);
  const [companySearch, setCompanySearch] = useState('');
  const [companyResults, setCompanyResults] = useState([]);
  const [searchingCompany, setSearchingCompany] = useState(false);
  const [country, setCountry] = useState(() => resolveCountry(initialCompany));
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [activeType, setActiveType] = useState(DOCUMENT_TYPES[0].value);
  const [filesByType, setFilesByType] = useState(buildEmptyFiles);
  const [filingYears, setFilingYears] = useState(buildEmptyFilingYears);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const companyId = selectedCompany?._id || selectedCompany?.id || null;

  const selectedType = useMemo(
    () =>
      DOCUMENT_TYPES.find(option => option.value === activeType) ||
      DOCUMENT_TYPES[0],
    [activeType],
  );
  const isYearlyType = YEARLY_FILING_TYPES.includes(activeType);
  const activeFiles = filesByType[activeType] || EMPTY_FILES;
  const totalFiles = useMemo(
    () =>
      DOCUMENT_TYPES.reduce(
        (total, type) => total + (filesByType[type.value]?.length || 0),
        0,
      ),
    [filesByType],
  );
  const totalSize = useMemo(
    () =>
      Object.values(filesByType)
        .flat()
        .reduce((total, file) => total + (Number(file.size) || 0), 0),
    [filesByType],
  );
  useEffect(() => {
    if (selectedCompany || companySearch.trim().length < 2) {
      setCompanyResults([]);
      setSearchingCompany(false);
      return undefined;
    }

    let active = true;
    setSearchingCompany(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchCompanies({
          keyword: companySearch.trim(),
        });
        if (active) {
          const list = Array.isArray(results) ? results : [];
          setCompanyResults(list.slice(0, 8));
        }
      } catch (searchError) {
        if (active) setCompanyResults([]);
      } finally {
        if (active) setSearchingCompany(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [companySearch, selectedCompany]);

  const handleSelectCompany = useCallback(company => {
    setSelectedCompany(company);
    setCompanySearch('');
    setCompanyResults([]);
    setCountry(resolveCountry(company));
    setError('');
  }, []);

  const handleClearCompany = useCallback(() => {
    setSelectedCompany(null);
    setCompanySearch('');
    setCompanyResults([]);
    setError('');
  }, []);

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    setTags(previous =>
      previous.includes(tag) ? previous : [...previous, tag],
    );
    setTagInput('');
  }, [tagInput]);

  const handleRemoveTag = useCallback(tag => {
    setTags(previous => previous.filter(item => item !== tag));
  }, []);

  const handleSelectType = useCallback(value => {
    setActiveType(value);
    setError('');
  }, []);

  const handleFilingYearChange = useCallback(
    value => {
      setFilingYears(previous => ({ ...previous, [activeType]: value }));
      setError('');
    },
    [activeType],
  );

  const handlePickFiles = useCallback(async () => {
    try {
      const response = await pick({
        type: [
          types.pdf,
          types.images,
          types.doc,
          types.docx,
          types.xls,
          types.xlsx,
        ],
        allowMultiSelection: true,
      });
      const picked = response.filter(item => item?.uri);

      if (!picked.length) return;

      const oversized = picked.filter(
        item => item.size && item.size > MAX_FILE_SIZE,
      );
      if (oversized.length) {
        setError('Each file must be 10 MB or smaller.');
        return;
      }

      const unsupported = picked.filter(
        item => item.type && !ALLOWED_MIME_TYPES.has(item.type),
      );
      if (unsupported.length) {
        setError('Some selected files have unsupported types.');
        return;
      }

      const selected = picked.map(item => ({
        uri: item.uri,
        name: item.name || `document-${Date.now()}`,
        type: item.type || 'application/octet-stream',
        size: item.size ?? null,
      }));

      setFilesByType(previous => {
        const current = previous[activeType] || [];
        const seen = new Set(current.map(file => file.uri));
        const merged = [...current];
        selected.forEach(file => {
          if (!seen.has(file.uri)) {
            seen.add(file.uri);
            merged.push(file);
          }
        });
        return { ...previous, [activeType]: merged };
      });
      setError('');
    } catch (pickerError) {
      if (
        pickerError?.code === 'DOCUMENT_PICKER_CANCELED' ||
        pickerError?.code === 'user_cancelled'
      ) {
        return;
      }
      setError(pickerError?.message || 'Unable to open the document picker.');
    }
  }, [activeType]);

  const removeFile = useCallback(
    uri => {
      setFilesByType(previous => ({
        ...previous,
        [activeType]: (previous[activeType] || EMPTY_FILES).filter(
          file => file.uri !== uri,
        ),
      }));
    },
    [activeType],
  );

  const handleUpload = useCallback(async () => {
    if (!companyId) {
      setError('Company id missing.');
      return;
    }
    if (!token) {
      Alert.alert('Session expired', 'Please login again.');
      return;
    }
    if (!totalFiles) {
      setError('Select at least one file to upload.');
      return;
    }

    const missingYearType = YEARLY_FILING_TYPES.find(
      type => filesByType[type]?.length && !filingYears[type],
    );
    if (missingYearType) {
      setActiveType(missingYearType);
      setError(
        `Select the filing year for ${DOCUMENT_TYPE_LABELS[missingYearType]}.`,
      );
      return;
    }

    setUploading(true);
    setError('');

    try {
      const result = await uploadCompanyDocuments({
        token,
        companyId,
        filesByType,
        filingYears,
        country,
        tags,
        sendNotification,
        isDraft,
      });
      invalidateCompaniesCache();
      const uploadedCount = result?.uploadedCount ?? totalFiles;
      Alert.alert(
        'Upload complete',
        `${uploadedCount} document${
          uploadedCount === 1 ? '' : 's'
        } uploaded successfully${isDraft ? ' as draft' : ''}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (uploadError) {
      const message =
        uploadError?.message || 'Upload failed. Please try again.';
      setError(message);
      Alert.alert('Upload failed', message);
    } finally {
      setUploading(false);
    }
  }, [
    companyId,
    country,
    filingYears,
    filesByType,
    isDraft,
    navigation,
    sendNotification,
    tags,
    token,
    totalFiles,
  ]);

  const uploadLabel = isDraft
    ? 'Save as Draft'
    : totalFiles
    ? `Upload ${totalFiles} Document${totalFiles === 1 ? '' : 's'}`
    : 'Upload Documents';

  return (
    <ScreenShell>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent
      />
      <TopNav navigation={navigation} title="Upload Document" />
      <View style={styles.container}>
        <ScrollView
          style={screenStyles.flex}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={screenStyles.scrollContent}
        >
          <SectionCard
            title="Select Company"
            subtitle="Search and choose the company for this upload."
            icon="people-outline"
          >
            {selectedCompany ? (
              <View style={styles.selectedCompanyCard}>
                <View style={styles.companyTextWrap}>
                  <Text style={styles.companyLabel}>Selected company</Text>
                  <Text style={styles.companyName} numberOfLines={2}>
                    {getCompanyName(selectedCompany)}
                  </Text>
                  {selectedCompany.registrationNumber ? (
                    <Text style={styles.companyHint}>
                      Reg: {selectedCompany.registrationNumber}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={handleClearCompany}
                  disabled={uploading}
                  accessibilityRole="button"
                >
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.searchRow}>
                  <Ionicons
                    name="search"
                    size={18}
                    color={editColors.textMuted}
                  />
                  <TextInput
                    style={styles.searchInput}
                    value={companySearch}
                    onChangeText={setCompanySearch}
                    placeholder="Search companies by name"
                    placeholderTextColor={editColors.textSoft}
                    autoCapitalize="words"
                    selectionColor={editColors.primary}
                  />
                  {searchingCompany ? (
                    <ActivityIndicator
                      size="small"
                      color={editColors.primary}
                    />
                  ) : companySearch ? (
                    <TouchableOpacity
                      onPress={() => setCompanySearch('')}
                      accessibilityRole="button"
                      accessibilityLabel="Clear company search"
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={editColors.textSoft}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {companyResults.length ? (
                  <View style={styles.companyResults}>
                    {companyResults
                      .filter(
                        result =>
                          result &&
                          (result._id || result.id || result.companyName),
                      )
                      .map(result => (
                        <TouchableOpacity
                          key={result._id || result.id || result.companyName}
                          style={styles.companyResult}
                          onPress={() => handleSelectCompany(result)}
                          activeOpacity={0.75}
                        >
                          <View style={styles.companyTextWrap}>
                            <Text
                              style={styles.companyResultName}
                              numberOfLines={1}
                            >
                              {getCompanyName(result)}
                            </Text>
                            {result.registrationNumber ? (
                              <Text style={styles.companyResultMeta}>
                                Reg: {result.registrationNumber}
                              </Text>
                            ) : null}
                          </View>
                          <Text style={styles.selectLabel}>Select</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                ) : companySearch.trim().length >= 2 && !searchingCompany ? (
                  <Text style={styles.searchHint}>No companies found.</Text>
                ) : (
                  <Text style={styles.searchHint}>
                    Type at least 2 characters to search.
                  </Text>
                )}
              </>
            )}
          </SectionCard>

          <SectionCard
            title="Shared Document Details"
            subtitle="These details apply to every file in this upload."
            icon="pricetags-outline"
          >
            <FormSelect
              label="Country"
              value={country}
              options={COUNTRY_OPTIONS}
              onChange={setCountry}
              required
              placeholder="Select country"
            />

            <View style={sharedStyles.field}>
              <Text style={sharedStyles.label}>Tags (Optional)</Text>
              <View style={styles.tagRow}>
                <TextInput
                  style={[sharedStyles.input, styles.tagInput]}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Type a tag"
                  placeholderTextColor={editColors.textSoft}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleAddTag}
                  selectionColor={editColors.primary}
                />
                <TouchableOpacity
                  style={[
                    styles.tagAddButton,
                    !tagInput.trim() && styles.tagAddButtonDisabled,
                  ]}
                  onPress={handleAddTag}
                  disabled={!tagInput.trim()}
                  accessibilityRole="button"
                  accessibilityLabel="Add tag"
                >
                  <Ionicons name="add" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {tags.length ? (
                <View style={styles.tagsWrap}>
                  {tags.map(tag => (
                    <View key={tag} style={styles.tagPill}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveTag(tag)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${tag}`}
                      >
                        <Ionicons
                          name="close"
                          size={13}
                          color={editColors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </SectionCard>

          <SectionCard
            title="Advanced Options"
            subtitle="Control notifications and client visibility."
            icon="options-outline"
          >
            <View style={styles.optionRow}>
              <View style={styles.optionIcon}>
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={editColors.primary}
                />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Notify Company</Text>
                <Text style={styles.optionSubtitle}>
                  Email company shareholders
                </Text>
              </View>
              <Switch
                value={sendNotification}
                onValueChange={setSendNotification}
                disabled={uploading}
                trackColor={{ false: '#e5e7eb', true: editColors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.optionRow, styles.optionRowBorder]}>
              <View style={[styles.optionIcon, styles.optionIconWarning]}>
                <Ionicons
                  name="eye-off-outline"
                  size={18}
                  color={editColors.warning}
                />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Save as Draft</Text>
                <Text style={styles.optionSubtitle}>
                  Hidden from client until published
                </Text>
              </View>
              <Switch
                value={isDraft}
                onValueChange={setIsDraft}
                disabled={uploading}
                trackColor={{ false: '#e5e7eb', true: editColors.warning }}
                thumbColor="#FFFFFF"
              />
            </View>
          </SectionCard>

          <SectionCard
            title="Select Files by Type"
            subtitle="Each tab keeps its own files and filing year."
            icon="cloud-upload-outline"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsScroll}
              contentContainerStyle={styles.tabsRow}
            >
              {DOCUMENT_TYPES.map(type => {
                const active = type.value === activeType;
                const count = filesByType[type.value]?.length || 0;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.tab, active && styles.tabActive]}
                    onPress={() => handleSelectType(type.value)}
                    disabled={uploading}
                    activeOpacity={0.8}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      style={[styles.tabLabel, active && styles.tabLabelActive]}
                    >
                      {type.label}
                    </Text>
                    {count ? (
                      <View
                        style={[
                          styles.tabBadge,
                          active && styles.tabBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tabBadgeText,
                            active && styles.tabBadgeTextActive,
                          ]}
                        >
                          {count}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {isYearlyType ? (
              <FormSelect
                label="Filing year"
                value={filingYears[activeType] || ''}
                options={FILING_YEAR_OPTIONS}
                onChange={handleFilingYearChange}
                required
                placeholder="Select filing year"
              />
            ) : null}

            <TouchableOpacity
              style={styles.picker}
              onPress={handlePickFiles}
              disabled={uploading}
              activeOpacity={0.75}
              accessibilityRole="button"
            >
              <View style={styles.pickerIcon}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={26}
                  color={editColors.primary}
                />
              </View>
              <Text style={styles.pickerTitle}>
                Tap to add {selectedType.label}
              </Text>
              <Text style={styles.pickerHint}>
                PDF, DOC, DOCX, XLS, XLSX, JPG or PNG · Max 10 MB each
              </Text>
            </TouchableOpacity>

            {activeFiles.map((file, index) => {
              const fileSize = formatFileSize(file.size);
              return (
                <View key={`${file.uri}-${index}`} style={styles.fileRow}>
                  <View style={styles.fileIcon}>
                    <Ionicons
                      name={getFileIcon(file.name)}
                      size={18}
                      color={editColors.primary}
                    />
                  </View>
                  <View style={styles.fileTextWrap}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <Text style={styles.fileMeta} numberOfLines={1}>
                      {fileSize || 'Ready to upload'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFile(file.uri)}
                    disabled={uploading}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${file.name}`}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={editColors.danger}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}

            {activeFiles.length ? null : (
              <Text style={styles.emptyFiles}>
                No files added to {selectedType.label.toLowerCase()} yet.
              </Text>
            )}

            {totalFiles ? (
              <View style={styles.summaryWrap}>
                {DOCUMENT_TYPES.filter(
                  type => filesByType[type.value]?.length,
                ).map(type => {
                  const count = filesByType[type.value].length;
                  const year = YEARLY_FILING_TYPES.includes(type.value)
                    ? filingYears[type.value]
                    : '';
                  return (
                    <View key={type.value} style={styles.summaryPill}>
                      <Text style={styles.summaryText}>
                        {type.label}: {count}
                        {year ? ` (${year})` : ''}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {totalFiles ? (
              <Text style={styles.fileCount}>
                {totalFiles} file{totalFiles === 1 ? '' : 's'} selected
                {totalSize ? ` · ${formatFileSize(totalSize)}` : ''}
              </Text>
            ) : null}
          </SectionCard>
        </ScrollView>

        <View
          style={[
            screenStyles.bottomBar,
            { paddingBottom: 12 + insets.bottom },
          ]}
        >
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[
              screenStyles.primaryButton,
              (uploading || !totalFiles || !companyId) &&
                screenStyles.primaryButtonDisabled,
            ]}
            onPress={handleUpload}
            disabled={uploading || !totalFiles || !companyId}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={screenStyles.primaryButtonText}>
                  {uploadLabel}
                </Text>
                <Ionicons
                  name={isDraft ? 'save-outline' : 'cloud-upload-outline'}
                  size={18}
                  color="#ffffff"
                />
              </>
            )}
          </TouchableOpacity>
          <Text style={screenStyles.bottomHint}>
            {isDraft
              ? 'Draft documents stay hidden from the client until published.'
              : `Uploaded documents appear in the company documents tab.${
                  sendNotification ? ' Shareholders will be notified.' : ''
                }`}
          </Text>
        </View>
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: editColors.background,
  },
  selectedCompanyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: editColors.primaryBorder,
    backgroundColor: editColors.primarySoft,
  },
  companyTextWrap: {
    flex: 1,
  },
  companyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: editColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: editColors.text,
    marginTop: 2,
  },
  companyHint: {
    fontSize: 11,
    color: editColors.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },
  changeButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: editColors.surface,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: editColors.danger,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: editColors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fbfbfd',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: editColors.text,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  companyResults: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: editColors.border,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: editColors.surface,
  },
  companyResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  companyResultName: {
    fontSize: 13,
    fontWeight: '600',
    color: editColors.text,
  },
  companyResultMeta: {
    fontSize: 11,
    color: editColors.textMuted,
    marginTop: 2,
  },
  selectLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: editColors.primary,
    marginLeft: 10,
  },
  searchHint: {
    fontSize: 11,
    color: editColors.textMuted,
    marginTop: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  tagAddButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: editColors.primary,
  },
  tagAddButtonDisabled: {
    opacity: 0.45,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: editColors.primarySoft,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: editColors.primary,
    marginRight: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: editColors.border,
    marginTop: 12,
    paddingTop: 16,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: editColors.primarySoft,
    marginRight: 10,
  },
  optionIconWarning: {
    backgroundColor: editColors.warningSoft,
  },
  optionTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: editColors.text,
  },
  optionSubtitle: {
    fontSize: 11,
    color: editColors.textMuted,
    marginTop: 2,
  },
  tabsScroll: {
    marginHorizontal: -4,
    marginBottom: 12,
  },
  tabsRow: {
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: editColors.border,
    backgroundColor: editColors.surface,
    marginRight: 8,
  },
  tabActive: {
    borderColor: editColors.primaryBorder,
    backgroundColor: editColors.primarySoft,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: editColors.textMuted,
  },
  tabLabelActive: {
    color: editColors.primary,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: editColors.border,
    marginLeft: 6,
  },
  tabBadgeActive: {
    backgroundColor: editColors.primary,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: editColors.textMuted,
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  picker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: editColors.primaryBorder,
    borderRadius: 16,
    backgroundColor: editColors.primarySoft,
    paddingVertical: 22,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  pickerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: editColors.surface,
    marginBottom: 8,
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: editColors.primary,
    textAlign: 'center',
  },
  pickerHint: {
    fontSize: 11,
    color: editColors.textMuted,
    marginTop: 3,
    textAlign: 'center',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: editColors.border,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fcfcff',
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: editColors.primarySoft,
    marginRight: 10,
  },
  fileTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: editColors.text,
  },
  fileMeta: {
    fontSize: 11,
    color: editColors.textMuted,
    marginTop: 2,
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: editColors.dangerSoft,
  },
  summaryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: editColors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  summaryPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: editColors.primarySoft,
    marginRight: 6,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: '600',
    color: editColors.primary,
  },
  fileCount: {
    fontSize: 11,
    fontWeight: '600',
    color: editColors.success,
    marginTop: 2,
  },
  emptyFiles: {
    fontSize: 11,
    color: editColors.textMuted,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    color: editColors.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default UploadCompanyDocumentScreen;
