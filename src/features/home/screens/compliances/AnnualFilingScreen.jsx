import React, { useEffect, useMemo, useState } from 'react';
import { Alert, View, Text, ScrollView, TextInput, TouchableOpacity, Pressable, StyleSheet, } from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useAppSelector } from '../../../../store/hooks';
import { fetchClientCompanies } from '../../api/clientProfileApi';
import { API_BASE_URL } from '../../../../config/api';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
const STEPS = [
    { number: 1, title: 'Company selection', subtitle: 'Select the company for filing', status: 'done' },
    { number: 2, title: 'Fiscal year', subtitle: 'Choose the filing year', status: 'upcoming' },
    { number: 3, title: 'Changes assessment', subtitle: 'Indicate if changes need reporting', status: 'upcoming' },
    { number: 4, title: 'Document upload', subtitle: 'Upload supporting documents', status: 'upcoming' },
    { number: 5, title: 'Submission', subtitle: 'Submit for review', status: 'active' },
    { number: 6, title: 'State review', subtitle: 'State processes your filing', status: 'upcoming' },
    { number: 7, title: 'Filed', subtitle: 'Filing confirmed by state', status: 'upcoming' },
];
export default function AnnualStateFilingScreen() {
    const colors = useThemeColors();
    const token = useAppSelector(state => state.auth.token);
    const authUserId = useAppSelector(state => state.auth.user?._id ?? state.auth.user?.id ?? null);
    const userCompanies = useAppSelector(state => state.auth.user?.companies ?? []);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [companyDataList, setCompanyDataList] = useState([]);
    const [company, setCompany] = useState('Select company');
    const [selectedCompanyIdState, setSelectedCompanyIdState] = useState(null);
    const [taxYearOptions, setTaxYearOptions] = useState([]);
    const [taxYear, setTaxYear] = useState('');
    const [isTaxYearDropdownOpen, setIsTaxYearDropdownOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(null);
    const [notes, setNotes] = useState('');
    const [changesMessage, setChangesMessage] = useState('');
    const [supportingDocs, setSupportingDocs] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const getCompanyCreatedYear = (companyRecord) => {
        if (!companyRecord) {
            return null;
        }
        const createdAt = companyRecord.createdAt ?? companyRecord.created_at ?? companyRecord.created;
        const date = createdAt ? new Date(String(createdAt)) : null;
        if (date && !Number.isNaN(date.getTime())) {
            return date.getFullYear();
        }
        return null;
    };
    const buildFiscalYearOptions = (companyRecord) => {
        const currentYear = new Date().getFullYear();
        const createdYear = getCompanyCreatedYear(companyRecord);
        const lastYear = currentYear - 1;
        const startYear = createdYear ? Math.max(createdYear, lastYear - 4) : lastYear - 4;
        const options = [];
        for (let year = lastYear; year >= startYear; year -= 1) {
            options.push(`${year} - ${year + 1}`);
        }
        if (options.length === 0) {
            options.push(`${lastYear} - ${currentYear}`);
            options.push(`${lastYear - 1} - ${lastYear}`);
            options.push(`${lastYear - 2} - ${lastYear - 1}`);
            options.push(`${lastYear - 3} - ${lastYear - 2}`);
        }
        return options;
    };
    const fetchRecentSubmissions = async () => {
        // Placeholder for refresh logic after a successful submission.
    };
    const handlePickSupportingDocuments = async () => {
        try {
            const response = await pick({
                type: [types.pdf, types.images, types.docx, types.plainText],
                allowMultiSelection: true,
            });
            const selectedFiles = response
                .filter(item => item?.uri)
                .map(item => ({
                    uri: item.uri,
                    name: item.name ?? `supporting-document-${Date.now()}`,
                    type: item.type ?? 'application/octet-stream',
                }));
            if (selectedFiles.length === 0) {
                Alert.alert('No files selected', 'Please choose at least one document to upload.');
                return;
            }
            setSupportingDocs(prev => [...prev, ...selectedFiles]);
            Toast.show({ type: 'success', text1: `${selectedFiles.length} document(s) selected` });
        }
        catch (error) {
            const err = error;
            if (err?.code === 'DOCUMENT_PICKER_CANCELED' || err?.code === 'user_cancelled') {
                return;
            }
            const message = err?.message ?? 'Unable to open the document picker.';
            Toast.show({ type: 'error', text1: message });
        }
    };
    const removeSupportingDocument = (indexToRemove) => {
        setSupportingDocs(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    const handleSubmit = async () => {
        const selectedCompany = selectedCompanyIdState;
        const fiscalYear = taxYear;
        const stateFilingNotes = notes;
        const hasChangesValue = hasChanges === true;
        const clientId = authUserId;
        if (!selectedCompany) {
            Toast.show({ type: 'error', text1: 'Select a company' });
            return;
        }
        if (!fiscalYear) {
            Toast.show({ type: 'error', text1: 'No pending fiscal year available' });
            return;
        }
        if (hasChanges === null) {
            Toast.show({ type: 'error', text1: 'Please answer the changes question' });
            return;
        }
        if (hasChanges === true && !changesMessage.trim()) {
            Toast.show({ type: 'error', text1: 'Describe the changes' });
            return;
        }
        if (!supportingDocs.length) {
            Toast.show({ type: 'error', text1: 'Upload at least one document' });
            return;
        }
        if (!clientId) {
            Toast.show({ type: 'error', text1: 'Client information is missing. Please sign in again.' });
            return;
        }
        const fiscalYearNumber = parseInt(String(fiscalYear).split(' - ')[0], 10);
        if (Number.isNaN(fiscalYearNumber)) {
            Toast.show({ type: 'error', text1: 'Invalid fiscal year selected' });
            return;
        }
        setSubmitting(true);
        const fd = new FormData();
        fd.append('companyId', selectedCompany);
        fd.append('clientId', clientId);
        fd.append('fiscalYear', String(fiscalYearNumber));
        fd.append('hasChanges', String(hasChangesValue));
        if (hasChangesValue) {
            fd.append('changesMessage', changesMessage);
        }
        fd.append('stateFilingNotes', stateFilingNotes);
        supportingDocs.forEach(f => fd.append('supportingDocuments', f));
        try {
            const res = await axios.post(`${API_BASE_URL}/api/annual-filing/submit`, fd, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token ?? '',
                },
            });
            if (res.data.success) {
                Toast.show({ type: 'success', text1: res.data.message || 'Annual filing submitted!' });
                setSupportingDocs([]);
                setChangesMessage('');
                setNotes('');
                setHasChanges(null);
                fetchRecentSubmissions();
                setSubmissionStatus({ message: 'Annual filing submitted and is under review.' });
                setTimeout(() => setSubmissionStatus(null), 5000);
            }
        }
        catch (err) {
            console.log(err);
            const errorMessage = typeof err === 'object' && err !== null && 'response' in err && err.response?.data?.message
                ? err.response.data.message
                : 'Submission failed';
            Toast.show({ type: 'error', text1: errorMessage });
        }
        finally {
            setSubmitting(false);
        }
    };
    const buildCompanyOptions = (companies) => companies.map((companyItem, index) => {
        const label = companyItem?.name ??
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
        const loadCompanies = async () => {
            const fallbackCompanies = buildCompanyOptions(userCompanies);
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
                const companyList = loadedCompanies;
                setCompanyDataList(companyList);
                setCompanyOptions(buildCompanyOptions(companyList));
            }
            catch {
                if (isMounted) {
                    setCompanyOptions(fallbackCompanies);
                }
            }
        };
        loadCompanies();
        return () => {
            isMounted = false;
        };
    }, [token, JSON.stringify(userCompanies), authUserId]);
    useEffect(() => {
        if (companyOptions.length === 0) {
            return;
        }
        const defaultCompany = companyOptions.find(option => option.id === selectedCompanyIdState) ?? companyOptions[0];
        setCompany(prevCompany => {
            if (prevCompany === 'Select company' || !companyOptions.some(option => option.label === prevCompany)) {
                if (defaultCompany.id !== selectedCompanyIdState) {
                    setSelectedCompanyIdState(defaultCompany.id);
                }
                return defaultCompany.label;
            }
            return prevCompany;
        });
    }, [companyOptions, selectedCompanyIdState]);
    const progressStatuses = useMemo(() => {
        const statuses = ['upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'];
        const hasCompany = company !== 'Select company';
        const hasTaxYear = Boolean(taxYear);
        const hasChangesAnswer = hasChanges !== null;
        const hasDocuments = supportingDocs.length > 0;
        const isSubmitted = Boolean(submissionStatus);
        if (!hasCompany) {
            statuses[0] = 'active';
            return statuses;
        }
        statuses[0] = 'done';
        if (!hasTaxYear) {
            statuses[1] = 'active';
            return statuses;
        }
        statuses[1] = 'done';
        if (!hasChangesAnswer) {
            statuses[2] = 'active';
            return statuses;
        }
        statuses[2] = 'done';
        if (!hasDocuments) {
            statuses[3] = 'active';
            return statuses;
        }
        statuses[3] = 'done';
        statuses[4] = isSubmitted ? 'done' : 'active';
        statuses[5] = isSubmitted ? 'active' : 'upcoming';
        statuses[6] = 'upcoming';
        return statuses;
    }, [company, hasChanges, supportingDocs.length, taxYear, submissionStatus]);
    useEffect(() => {
        const selectedCompany = companyDataList.find(item => item._id === selectedCompanyIdState || item.id === selectedCompanyIdState);
        const options = buildFiscalYearOptions(selectedCompany ?? null);
        setTaxYearOptions(options);
        if (!options.includes(taxYear)) {
            setTaxYear(options[0] ?? '');
        }
    }, [companyDataList, selectedCompanyIdState, taxYear]);
    return (<View style={styles.safeArea}>
        <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* ***************** SELECT COMPANY SECTION *********************** */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, zIndex: 20 }]}>
                <View style={styles.cardLabelRow}>
                    <Feather name="briefcase" size={15} color={colors.accent} />
                    <Text style={[styles.cardLabel, { color: colors.text }]}>Select Company</Text>
                </View>
                <Pressable style={[styles.selectField, { borderColor: colors.border }]} onPress={() => setIsCompanyDropdownOpen(prev => !prev)}>
                    <Text style={[styles.selectFieldText, { color: colors.text }]}>{company}</Text>
                    <Feather name={isCompanyDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
                </Pressable>
                {isCompanyDropdownOpen && (<View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    {companyOptions.length > 0 ? (companyOptions.map(option => (<Pressable key={option.id} style={[styles.dropdownItem, { backgroundColor: colors.surface }]} onPress={() => {
                        setCompany(option.label);
                        setSelectedCompanyIdState(option.id);
                        setIsCompanyDropdownOpen(false);
                    }}>
                        <Text style={[styles.dropdownItemText, { color: colors.text }]}>{option.label}</Text>
                    </Pressable>))) : (<Text style={[styles.dropdownEmptyText, { color: colors.muted }]}>No companies available</Text>)}
                </View>)}
            </View>


            {/* ***************** FISCIAL YEAR SECTION *********************** */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, zIndex: 10 }]}>
                <View style={styles.cardLabelRow}>
                    <Feather name="calendar" size={15} color={colors.primary} />
                    <Text style={[styles.cardLabel, { color: colors.text }]}>Fiscal year</Text>
                </View>
                <Pressable style={[styles.selectField, { marginBottom: 8, borderColor: colors.border }]} onPress={() => setIsTaxYearDropdownOpen(prev => !prev)}>
                    <Text style={[styles.selectFieldText, { color: colors.text }]}>{taxYear}</Text>
                    <Feather name={isTaxYearDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
                </Pressable>
                {isTaxYearDropdownOpen && (<View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    {taxYearOptions.map(option => (<Pressable key={option} style={[styles.dropdownItem, { backgroundColor: colors.surface }]} onPress={() => {
                        setTaxYear(option);
                        setIsTaxYearDropdownOpen(false);
                    }}>
                        <Text style={[styles.dropdownItemText, { color: colors.text }]}>{option}</Text>
                    </Pressable>))}
                </View>)}
                <Text style={[styles.hintText, { color: colors.muted }]}>Deadline: typically 2-4 months after fiscal year end.</Text>
            </View>
            {/* ***************** FISCIAL YEAR SECTION *********************** */}

            {/* ***************** ANY CHANGE TO REPORT SECTION *********************** */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardLabelRowBetween}>
                    <View style={styles.cardLabelRow}>
                        <Feather name="edit-3" size={15} color={colors.accent} />
                        <Text style={[styles.cardLabel, { color: colors.text }]}>Any Changes To Report?</Text>
                    </View>
                    <Text style={[styles.requiredText, { color: colors.danger }]}>Required</Text>
                </View>
                <View style={styles.choiceRow}>
                    <TouchableOpacity style={[
                        styles.choiceButton,
                        { borderColor: colors.border },
                        hasChanges === true && styles.choiceButtonActive,
                    ]} onPress={() => setHasChanges(true)}>
                        <Text style={[
                            styles.choiceButtonText,
                            { color: colors.text },
                            hasChanges === true && styles.choiceButtonTextActive,
                        ]}>
                            Yes, I have changes
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[
                        styles.choiceButton,
                        { borderColor: colors.border },
                        hasChanges === false && styles.choiceButtonActive,
                    ]} onPress={() => {
                        setHasChanges(false);
                        setChangesMessage('');
                    }}>
                        <Text style={[
                            styles.choiceButtonText,
                            { color: colors.text },
                            hasChanges === false && styles.choiceButtonTextActive,
                        ]}>
                            No, no changes
                        </Text>
                    </TouchableOpacity>
                </View>
                {hasChanges === true ? (<View style={{ marginTop: 12 }}>
                    <Text style={[styles.cardLabel, { color: colors.text, marginBottom: 8 }]}>Describe the changes</Text>
                    <TextInput style={[styles.notesInput, { borderColor: colors.border, color: colors.text }]} placeholder="Describe the changes to your annual filing..." placeholderTextColor={colors.muted} multiline value={changesMessage} onChangeText={setChangesMessage} />
                    <Text style={[styles.hintText, { color: colors.muted }]}>Provide details so our compliance team can review your changes.</Text>
                </View>) : null}
            </View>

            {/* ***************** SUPPORTING DOCUMENTS SECTION *********************** */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardLabelRowBetween}>
                    <View style={styles.cardLabelRow}>
                        <Feather name="upload-cloud" size={15} color={colors.accent} />
                        <Text style={[styles.cardLabel, { color: colors.text }]}>Supporting Documents</Text>
                    </View>
                    <Text style={[styles.requiredText, { color: colors.danger }]}>Required</Text>
                </View>
                <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.border }]} onPress={handlePickSupportingDocuments}>
                    <Feather name="upload" size={20} color={colors.muted} />
                    <Text style={[styles.uploadTitle, { color: colors.muted }]}>Click To Upload Documents</Text>
                    <Text style={[styles.uploadHint, { color: colors.muted }]}>Annual report, Financial statements, Amendment docs</Text>
                    <Text style={[styles.uploadHint, { color: colors.muted }]}>PDF, JPG, PNG, DOC (max 10MB each)</Text>
                </TouchableOpacity>
                {supportingDocs.length > 0 ? (<View style={styles.selectedFilesContainer}>
                    {supportingDocs.map((file, index) => (<View key={`${file.uri}-${index}`} style={[styles.selectedFileItem, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                        <Text numberOfLines={1} style={[styles.selectedFileText, { color: colors.text, flex: 1 }]}>{file.name}</Text>
                        <Pressable style={styles.removeFileButton} onPress={() => removeSupportingDocument(index)}>
                            <Text style={[styles.removeFileButtonText, { color: colors.danger }]}>Remove</Text>
                        </Pressable>
                    </View>))}
                </View>) : null}
            </View>


            {/* ***************** STATE FILING NOTES SECTION *********************** */}

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardLabelRow}>
                    <Feather name="file-text" size={15} color={colors.muted} />
                    <Text style={[styles.cardLabel, { color: colors.text }]}>State Filing Notes</Text>
                </View>
                <TextInput style={[styles.notesInput, { borderColor: colors.border, color: colors.text }]} placeholder="Any specific instructions or notes for the state filing team..." placeholderTextColor={colors.muted} multiline value={notes} onChangeText={setNotes} />
                <Text style={[styles.hintText, { color: colors.muted }]}>Optional - include special requests or clarifications.</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardLabel, { marginBottom: 14, color: colors.text }]}>Status Tracker</Text>
                {STEPS.map((step, index) => {
                    const status = progressStatuses[index];
                    return (<View key={step.number} style={styles.stepRow}>
                        <View style={styles.stepIndicatorColumn}>
                            <StepBullet status={status} number={step.number} colors={colors} />
                            {index < STEPS.length - 1 && <View style={[styles.stepConnector, { backgroundColor: colors.border }]} />}
                        </View>
                        <View style={{ paddingBottom: 16, flex: 1 }}>
                            <Text style={[
                                styles.stepTitle,
                                { color: colors.text },
                                status === 'active' && { color: colors.primary },
                                status === 'upcoming' && { color: colors.muted },
                            ]}>
                                {step.title}
                            </Text>
                            <Text style={[styles.stepSubtitle, { color: colors.muted }]}>{step.subtitle}</Text>
                        </View>
                    </View>);
                })}
            </View>

            <View style={styles.submitButtonWrapper}>
                <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.buttonBackground }]} onPress={handleSubmit} disabled={submitting}>
                    <Text style={[styles.submitButtonText, { color: colors.surface }]}>Submit State Filing</Text>
                    <Feather name="send" size={15} style={styles.sendIcon} color={colors.surface} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    </View>);
}
function StepBullet({ status, number, colors }) {
    if (status === 'done') {
        return (<View style={[styles.stepBullet, { backgroundColor: colors.primary }]}>
            <Text style={[styles.stepBulletNumberActive, { color: colors.surface }]}>✓</Text>
        </View>);
    }
    if (status === 'active') {
        return (<View style={[styles.stepBullet, { backgroundColor: colors.primary }]}>
            <Text style={[styles.stepBulletNumberActive, { color: colors.background }]}>{number}</Text>
        </View>);
    }
    return (<View style={[
        styles.stepBullet,
        { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    ]}>
        <Text style={[styles.stepBulletNumber, { color: colors.muted }]}>{number}</Text>
    </View>);
}

// STYLING SECTION
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: 0,
    },
    screen: {
        flex: 1,
    },
    content: {
        padding: 14,
        paddingBottom: 62,
        flexGrow: 1,
    },
    card: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
    },
    cardLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardLabelRowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: font.md,
        fontWeight: '500',
        marginBottom: 0,
    },
    requiredText: {
        fontSize: 11,
    },
    selectField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 10,
        marginTop: 8,
    },
    selectFieldText: {
        fontSize: 14,
    },
    hintText: {
        fontSize: 12,
    },
    choiceRow: {
        flexDirection: 'row',
        gap: 8,
    },
    choiceButton: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 10,
        alignItems: 'center',
    },
    choiceButtonActive: {
        backgroundColor: 'rgba(59,130,246,0.12)',
    },
    choiceButtonText: {
        fontSize: 12,
    },
    choiceButtonTextActive: {
        fontWeight: '600',
    },
    uploadBox: {
        borderWidth: 1.6,
        borderStyle: 'dashed',
        borderRadius: 18,
        paddingVertical: 20,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    uploadTitle: {
        fontSize: 14,
        marginTop: 8,
    },
    uploadHint: {
        fontSize: 11,
        marginTop: 2,
    },
    notesInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        minHeight: 60,
        fontSize: 10,
        textAlignVertical: 'top',
        marginBottom: 6,
        marginTop: 8,
    },
    selectedFilesContainer: {
        marginTop: 12,
        gap: 8,
    },
    selectedFileItem: {
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    selectedFileText: {
        fontSize: 12,
    },
    removeFileButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    removeFileButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    stepRow: {
        flexDirection: 'row',
        gap: 12,
    },
    stepIndicatorColumn: {
        alignItems: 'center',
    },
    stepBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepBulletNumber: {
        fontSize: 11,
    },
    stepBulletNumberActive: {
        fontSize: 11,
        fontWeight: '600',
    },
    stepConnector: {
        width: 2,
        flex: 1,
        minHeight: 22,
    },
    stepTitle: {
        fontSize: 13,
        fontWeight: '600',
    },
    stepSubtitle: {
        fontSize: 11,
        marginTop: 1,
    },
    supportCard: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
    },
    supportText: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: 8,
        marginBottom: 12,
    },
    supportButton: {
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
    },
    supportButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    dropdownList: {
        marginTop: 8,
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    dropdownItemText: {
        fontSize: 13,
    },
    dropdownEmptyText: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 13,
    },
    submitButtonWrapper: {
        paddingTop: 16,
        paddingBottom: 36,
    },
    submitButton: {
        borderRadius: 24,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    sendIcon: {
        rotation: '45deg',
        transform: [{ rotate: '20deg' }],
    },
});
