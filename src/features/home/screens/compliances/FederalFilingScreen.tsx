import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Switch,
  SafeAreaView,
  Alert,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { MainScreenProps, MainStackParamList } from '../../../../navigation/types';
import BackButton from '../../../../components/buttons/BackButton';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { pick, types } from '@react-native-documents/picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useAppSelector } from '../../../../store/hooks';
import { fetchClientCompanies } from '../../api/clientProfileApi';
import { API_BASE_URL } from '../../../../config/api';
import { useThemeColors } from '../../../../theme/colors';

type SelectedFile = {
  uri: string;
  name: string;
  type?: string | null;
};

export default function FederalTaxFiling() {
  const navigation = useNavigation<MainScreenProps<'FederalFiling'>['navigation']>();
  const route = useRoute<RouteProp<MainStackParamList, 'FederalFiling'>>();
  const selectedAction = route.params?.selectedAction;
  const colors = useThemeColors();
  const userCompanies = useAppSelector(state => state.auth.user?.companies ?? []);
  const token = useAppSelector(state => state.auth.token);
  const authUserId = useAppSelector(
    state => state.auth.user?._id ?? state.auth.user?.id ?? null,
  );

  // States
  const [company, setCompany] = useState('Select company');
  const [companyOptions, setCompanyOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [taxYear, setTaxYear] = useState('2025 - 2026');
  const [isTaxYearDropdownOpen, setIsTaxYearDropdownOpen] = useState(false);
  const [bookkeeping, setBookkeeping] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedBankStatements, setSelectedBankStatements] = useState<SelectedFile[]>([]);
  const [selectedFinancialStatements, setSelectedFinancialStatements] = useState<SelectedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{ status: string; message: string } | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(selectedAction?.companyId ?? null);
  const companiesLoadedKeyRef = useRef<string | null>(null);

  const buildCompanyOptions = (companies: Array<Record<string, any>>) =>
    companies.map((companyItem, index) => {
      const label =
        companyItem?.name ??
        companyItem?.companyName ??
        companyItem?.legalName ??
        companyItem?.businessName ??
        companyItem?.company?.name ??
        `Company ${index + 1}`;

      return {
        id: companyItem?._id ?? companyItem?.id ?? `${label}-${index}`,
        label,
      };
    });

  useEffect(() => {
    let isMounted = true;
    const authKey = token ?? 'guest';

    if (companiesLoadedKeyRef.current === authKey) {
      return () => {
        isMounted = false;
      };
    }

    companiesLoadedKeyRef.current = authKey;

    const loadCompanies = async () => {
      const fallbackCompanies = buildCompanyOptions(userCompanies as Array<Record<string, any>>);

      if (!token) {
        if (isMounted) {
          setCompanyOptions(fallbackCompanies);
        }
        return;
      }

      try {
        const result = await fetchClientCompanies({ token, userId: authUserId });

        if (!isMounted) {
          return;
        }

        const loadedCompanies = result?.companies?.length > 0 ? result.companies : userCompanies;
        const options = buildCompanyOptions(loadedCompanies as Array<Record<string, any>>);
        setCompanyOptions(options);
      } catch {
        if (isMounted) {
          setCompanyOptions(fallbackCompanies);
        }
      }
    };

    loadCompanies();

    return () => {
      isMounted = false;
    };
  }, [token, userCompanies, authUserId]);

  useEffect(() => {
    if (companyOptions.length > 0) {
      const defaultCompany = companyOptions.find(option => option.id === selectedCompanyId) ?? companyOptions[0];
      setCompany(prevCompany => {
        if (prevCompany === 'Select company' || !companyOptions.some(option => option.label === prevCompany)) {
          setSelectedCompanyId(defaultCompany.id);
          return defaultCompany.label;
        }

        const matchedOption = companyOptions.find(option => option.label === prevCompany);
        if (matchedOption) {
          setSelectedCompanyId(matchedOption.id);
        }
        return prevCompany;
      });
    }
  }, [companyOptions, selectedCompanyId]);

  const taxYearOptions = ['2023 - 2024', '2024 - 2025', '2025 - 2026', '2026 - 2027'];

  const handlePickDocument = async (type: 'bank' | 'financial') => {
    try {
      const response = await pick({
        type: [types.pdf, types.images, types.docx, types.plainText],
        allowMultiSelection: true,
      });

      const selectedFiles = response
        .filter(item => item?.uri)
        .map(item => ({
          uri: item.uri,
          name: item.name ?? `${type === 'bank' ? 'bank-statement' : 'financial-statement'}-${Date.now()}`,
          type: item.type ?? 'application/octet-stream',
        }));

      if (selectedFiles.length === 0) {
        Alert.alert('No files selected', 'Please choose at least one file.');
        return;
      }

      if (type === 'bank') {
        setSelectedBankStatements(prev => [...prev, ...selectedFiles]);
      } else {
        setSelectedFinancialStatements(prev => [...prev, ...selectedFiles]);
      }

      Alert.alert('Files selected', `${selectedFiles.length} file(s) added.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to open the picker right now.';
      Alert.alert('Document picker error', message);
    }
  };

  const removeSelectedFile = (type: 'bank' | 'financial', indexToRemove: number) => {
    if (type === 'bank') {
      setSelectedBankStatements(prev => prev.filter((_, index) => index !== indexToRemove));
    } else {
      setSelectedFinancialStatements(prev => prev.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleSubmit = async () => {
    const selectedCompany = selectedCompanyId ?? companyOptions.find(option => option.label === company)?.id ?? null;

    if (!selectedCompany) {
      Toast.show({ type: 'error', text1: 'Please select a company' });
      return;
    }

    if (!taxYear) {
      Toast.show({ type: 'error', text1: 'No pending tax year is available for filing' });
      return;
    }

    if (selectedBankStatements.length === 0) {
      Toast.show({ type: 'error', text1: 'Please upload at least one bank statement' });
      return;
    }

    if (bookkeeping && selectedFinancialStatements.length === 0) {
      Toast.show({ type: 'error', text1: 'Please upload financial statements (bookkeeping selected)' });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();

    formData.append('companyId', selectedCompany);
    formData.append("taxYear", taxYear.split(" - ")[0]);
    formData.append('hasBookkeeping', bookkeeping ? 'true' : 'false');
    formData.append('notes', additionalNotes.trim());

    selectedBankStatements.forEach(file => {
      formData.append('bankStatements', {
        uri: file.uri,
        name: file.name,
        type: file.type ?? 'application/octet-stream',
      } as any);
    });

    selectedFinancialStatements.forEach(file => {
      formData.append('financials', {
        uri: file.uri,
        name: file.name,
        type: file.type ?? 'application/octet-stream',
      } as any);
    });

    try {
      if (!token) {
        Toast.show({ type: 'error', text1: 'Authentication token is missing. Please sign in again.' });
        setSubmitting(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/federal-filing/submit`, formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data?.success) {
        Toast.show({
          type: 'success',
          text1: response.data.message || 'Federal filing submitted successfully!',
        });

        setSelectedBankStatements([]);
        setSelectedFinancialStatements([]);
        setAdditionalNotes('');
        setBookkeeping(false);
        setSubmissionStatus({
          status: 'submitted',
          message: 'Your filing has been submitted and is under review.',
        });

        setTimeout(() => setSubmissionStatus(null), 5000);
      } else {
        Toast.show({
          type: 'error',
          text1: response.data?.message || 'Failed to submit filing',
        });
      }
    } catch (error: any) {
      console.error({type: 'error', text1: `Error submitting filing: ${error}`});
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Failed to submit filing',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.topBarText}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{selectedAction?.title ?? 'Federal Tax Filing'}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>{selectedAction?.subtitle ?? 'Submit your annual federal tax return documents'}</Text>
        </View>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        {/* <View style={styles.header}>
          <View style={[styles.headerIconContainer, { backgroundColor: colors.accent }]}>
            <FontAwesome name="file-text" color="#fff" size={24} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Federal Tax Filing</Text>
            <Text style={[styles.headerSubtitle, { color: colors.muted }]}>Submit your annual federal tax return documents</Text>
          </View>
        </View> */}

        {/* Status Tracker */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Status Tracker</Text>
          <View style={styles.trackerContainer}>
            <View style={styles.stepRow}>
              <FontAwesome name="check-circle" color={colors.primary} size={20} />
              <Text style={[styles.stepText, { color: colors.muted, textDecorationLine: 'line-through' }]}>Company Selection</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: colors.primary }]} />
            <View style={styles.stepRow}>
              <FontAwesome name="check-circle" color={colors.primary} size={20} />
              <Text style={[styles.stepText, { color: colors.muted, textDecorationLine: 'line-through' }]}>Document Upload</Text>
            </View>
            <View style={[styles.stepLineActive, { backgroundColor: colors.accent }]} />
            <View style={styles.stepRow}>
              <FontAwesome name="clock-o" color={colors.accent} size={20} />
              <Text style={[styles.stepText, { color: colors.accent, fontWeight: '600' }]}>Submission (Current)</Text>
            </View>
          </View>
        </View>

        {/* Select Company Dropdown */}
        <View style={[styles.card, { backgroundColor: colors.surface, zIndex: 20 }]}>
          <View style={styles.labelRow}>
            <FontAwesome name="building" color={colors.accent} size={18} style={styles.fieldIcon} />
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Select Company</Text>
          </View>
          <Pressable
            style={[styles.dropdownSelector, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => setIsCompanyDropdownOpen(prev => !prev)}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}>{company}</Text>
            <FontAwesome name={isCompanyDropdownOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.muted} />
          </Pressable>
          {isCompanyDropdownOpen ? (
            <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              {companyOptions.length > 0 ? (
                companyOptions.map(option => (
                  <Pressable
                    key={option.id}
                    style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setCompany(option.label);
                      setSelectedCompanyId(option.id);
                      setIsCompanyDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: colors.text }]}>{option.label}</Text>
                  </Pressable>
                ))
              ) : (
                <View style={[styles.dropdownItem, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>No companies available</Text>
                </View>
              )}
            </View>
          ) : null}
        </View>

        {/* Tax Year Dropdown */}
        <View style={[styles.card, { backgroundColor: colors.surface, zIndex: 10 }]}>
          <View style={styles.labelRow}>
            <FontAwesome name="calendar" color={colors.accent} size={18} style={styles.fieldIcon} />
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Tax Year</Text>
          </View>
          <Pressable
            style={[styles.dropdownSelector, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => setIsTaxYearDropdownOpen(prev => !prev)}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}>{taxYear}</Text>
            <FontAwesome name={isTaxYearDropdownOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.muted} />
          </Pressable>
          {isTaxYearDropdownOpen ? (
            <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              {taxYearOptions.map(option => (
                <Pressable
                  key={option}
                  style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setTaxYear(option);
                    setIsTaxYearDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>{option}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Text style={[styles.helpText, { color: colors.danger }]}>Filing deadline: April 15, 2026</Text>
          <Text style={[styles.subHelpText, { color: colors.muted }]}>Only pending tax years are shown here.</Text>
        </View>

        {/* Bookkeeping Service Switch */}
        <View style={[styles.card, styles.rowBetween, { backgroundColor: colors.surface }]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={styles.labelRow}>
              <FontAwesome name="book" color={colors.accent} size={18} style={styles.fieldIcon} />
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Bookkeeping Service</Text>
            </View>
            <Text style={[styles.subHelpText, { color: colors.muted }]}>Enable if you need bookkeeping services for this filing</Text>
          </View>
          <Switch
            value={bookkeeping}
            onValueChange={(value) => setBookkeeping(value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={bookkeeping ? colors.accent : colors.surface}
          />
        </View>

        {/* Bank Statements Upload Area */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.rowBetween}>
            <View style={styles.labelRow}>
              <FontAwesome name="upload" color={colors.accent} size={18} style={styles.fieldIcon} />
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Bank Statements</Text>
            </View>
            <Text style={[styles.requiredBadge, { color: colors.danger }]}>* Required</Text>
          </View>
          
          <Pressable 
            style={({ pressed }) => [styles.uploadArea, { borderColor: colors.border, backgroundColor: colors.background }, pressed && { opacity: 0.7 }]} 
            onPress={() => handlePickDocument('bank')}
          >
            <FontAwesome name="upload" color={colors.muted} size={32} />
            <Text style={[styles.uploadText, { color: colors.text }]}>
              {selectedBankStatements.length > 0 ? `Selected: ${selectedBankStatements.length} file(s)` : 'Click to upload bank statements'}
            </Text>
            <Text style={[styles.uploadSubText, { color: colors.muted }]}>PDF, JPG, PNG, DOC (Max 10MB each)</Text>
            {selectedBankStatements.length > 0 ? (
              <View style={styles.fileList}>
                {selectedBankStatements.map((file, index) => (
                  <View key={`${file.uri}-${index}`} style={[styles.fileItem, { backgroundColor: colors.background }]}>
                    <FontAwesome name="file" size={12} color={colors.accent} />
                    <Text numberOfLines={1} style={[styles.fileItemText, { color: colors.text }]}>{file.name}</Text>
                    <Pressable onPress={() => removeSelectedFile('bank', index)} style={styles.removeButton}>
                      <FontAwesome name="times" size={12} color={colors.danger} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* Financial Statements (Conditional) */}
        {bookkeeping ? (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.rowBetween}>
              <View style={styles.labelRow}>
                <FontAwesome name="file-text" color={colors.accent} size={18} style={styles.fieldIcon} />
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Financial Statements</Text>
              </View>
              <Text style={[styles.requiredBadge, { color: colors.danger }]}>* Required</Text>
            </View>

            <Pressable 
              style={({ pressed }) => [styles.uploadArea, { borderColor: colors.border, backgroundColor: colors.background }, pressed && { opacity: 0.7 }]} 
              onPress={() => handlePickDocument('financial')}
            >
              <FontAwesome name="file-text" color={colors.muted} size={32} />
              <Text style={[styles.uploadText, { color: colors.text }]}>
                {selectedFinancialStatements.length > 0 ? `Selected: ${selectedFinancialStatements.length} file(s)` : 'Upload financial statements'}
              </Text>
              <Text style={[styles.uploadSubText, { color: colors.muted }]}>PDF, JPG, PNG, DOC (Max 10MB each)</Text>
              {selectedFinancialStatements.length > 0 ? (
                <View style={styles.fileList}>
                  {selectedFinancialStatements.map((file, index) => (
                    <View key={`${file.uri}-${index}`} style={[styles.fileItem, { backgroundColor: colors.background }]}>
                      <FontAwesome name="file" size={12} color={colors.accent} />
                      <Text numberOfLines={1} style={[styles.fileItemText, { color: colors.text }]}>{file.name}</Text>
                      <Pressable onPress={() => removeSelectedFile('financial', index)} style={styles.removeButton}>
                        <FontAwesome name="times" size={12} color={colors.danger} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : null}
            </Pressable>
          </View>
        ) : null}

        {/* Additional Notes Input */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.labelRow}>
            <FontAwesome name="file-text" color={colors.accent} size={18} style={styles.fieldIcon} />
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Additional Notes</Text>
          </View>
          <TextInput
            style={[styles.textArea, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
            multiline={true}
            numberOfLines={4}
            placeholder="Any additional information you'd like to share with our tax team..."
            placeholderTextColor={colors.inputPlaceholder}
            value={additionalNotes}
            onChangeText={(text) => setAdditionalNotes(text)}
          />
        </View>

{/* Submit Button */}
        <Pressable
          style={[styles.submitButton, { backgroundColor: colors.buttonBackground, shadowColor: colors.accent }, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={[styles.submitButtonText, { color: colors.textOnDark }]}>{submitting ? 'Submitting...' : 'Submit Federal Filing'}</Text>
        </Pressable>
        {submissionStatus ? <Text style={[styles.statusMessage, { color: colors.primary }]}>{submissionStatus.message}</Text> : null}

        {/* Footer Text */}
        <Text style={[styles.footerDisclaimer, { color: colors.muted }]}>
          By submitting, you confirm that the information provided is accurate and complete.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// Mobile Responsive Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 18
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
    paddingTop: 4
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  topBarText: {
    flex: 1,
    marginLeft: 12,
  },
  topBarSpacer: {
    width: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerIconContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 500,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  selectorText: {
    fontSize: 14,
  },
  helpText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  subHelpText: {
    fontSize: 11,
    marginTop: 2,
  },
  requiredBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  fileList: {
    width: '100%',
    marginTop: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
  },
  fileItemText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  trackerContainer: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 13,
    marginLeft: 8,
  },
  stepLine: {
    width: 2,
    height: 15,
    marginLeft: 9,
    marginVertical: 2,
  },
  stepLineActive: {
    width: 2,
    height: 15,
    marginLeft: 9,
    marginVertical: 2,
  },
  supportBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  supportDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  supportButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  footerDisclaimer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 14,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  statusMessage: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});
