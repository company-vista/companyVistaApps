import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { BackButton, ContinueButton } from '../../../../components/buttons';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { resetCompanyRegistration } from '../../../../store/slices/companyRegistrationSlice';
import { submitCompanyRegistration, updateCompanyRegistration } from '../../api/companyRegistrationApi';

interface ReviewRow {
  label: string;
  value: string;
}

interface ReviewSection {
  title: string;
  rows: ReviewRow[];
}

type ReviewSubmitScreenProps = {
  onBackPress: () => void;
  onSubmit?: (companyId?: string) => void;
  onEditApplicant?: () => void;
  onEditJurisdiction?: () => void;
  onEditCompanyName?: () => void;
  onEditOwnership?: () => void;
  onEditAddress?: () => void;
  onEditDirectors?: () => void;
  onEditBusinessActivity?: () => void;
  companyId?: string | null;
};

export default function ReviewSubmitScreen({ onBackPress, onSubmit, onEditApplicant, onEditJurisdiction, onEditCompanyName, onEditOwnership, onEditAddress, onEditDirectors, onEditBusinessActivity, companyId }: ReviewSubmitScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;
  const isEditing = Boolean(companyId);

  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [signature, setSignature] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reg = useAppSelector(state => state.companyRegistration);
  const token = useAppSelector(state => state.auth.token);
  // const user = useAppSelector(state => state.auth.user);
  // const clientId = user?._id || user?.id || '';

  const today = new Date();
  const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

  const holdingSummary = reg.holdingCompanies.length > 0
    ? reg.holdingCompanies.map((h, i) => `${h.legalName || '—'} (${h.ownershipPercent || '0'}%)`).join(', ')
    : '—';

  const directorsSummary = reg.directors.length > 0
    ? reg.directors.map((d, i) => `${d.firstName} ${d.lastName} — ${d.ownership}%`).join(', ')
    : '—';

  const totalOwnership = reg.directors.reduce((sum, d) => sum + (parseFloat(d.ownership) || 0), 0);

  const localAddressSummary = reg.hasAddress === 'yes'
    ? [reg.localAddress.line1, reg.localAddress.city, reg.localAddress.state, reg.localAddress.postalCode, reg.localAddress.country].filter(Boolean).join(', ') || '—'
    : reg.hasAddress === 'no' ? 'CompanyVista arranged' : '—';

  const agentSummary = reg.hasAgent === 'yes'
    ? `${reg.agentDetails.firstName} ${reg.agentDetails.lastName}`.trim() || '—'
    : reg.hasAgent === 'no' ? 'CompanyVista arranged' : '—';

  const reviewSections: ReviewSection[] = [
    {
      title: 'Applicant',
      rows: [
        { label: 'I am the', value: reg.applicantType },
        { label: 'Contact', value: `${reg.firstName} ${reg.lastName}`.trim() || '—' },
        { label: 'Email', value: reg.email || '—' },
        { label: 'Phone', value: reg.phone || '—' },
      ],
    },
    {
      title: 'Jurisdiction & Entity',
      rows: [
        { label: 'Country', value: reg.jurisdictionName || reg.jurisdiction || '—' },
        { label: 'State', value: reg.stateOfIncorporation === '-- Select --' ? '—' : reg.stateOfIncorporation },
        { label: 'Entity type', value: reg.entityType === '-- Select --' ? '—' : reg.entityType },
      ],
    },
    {
      title: 'Company Name',
      rows: [
        { label: 'Desired name', value: reg.companyName || '—' },
        { label: 'Alternate name', value: reg.alternateName || '—' },
      ],
    },
    {
      title: 'Ownership',
      rows: [
        { label: 'Structure', value: reg.ownershipType },
        { label: 'Holding companies', value: holdingSummary },
      ],
    },
    {
      title: 'Address & Representative',
      rows: [
        { label: 'Local address', value: localAddressSummary },
        { label: 'Local representative', value: agentSummary },
      ],
    },
    {
      title: 'Directors & Shareholders',
      rows: [
        { label: 'People', value: directorsSummary },
        { label: 'Total shareholding', value: `${totalOwnership}%` },
      ],
    },
    {
      title: 'Business Activity',
      rows: [
        { label: 'Website', value: reg.website || '—' },
        { label: 'Reason', value: reg.establishReason === '-- Select --' ? '—' : reg.establishReason },
        { label: 'Activity', value: reg.principalActivity === '-- Select --' ? '—' : reg.principalActivity },
        { label: 'Introduction', value: reg.briefIntroduction ? (reg.briefIntroduction.length > 60 ? reg.briefIntroduction.substring(0, 60) + '...' : reg.briefIntroduction) : '—' },
      ],
    },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload: Record<string, any> = {
      applicantType: reg.applicantType,
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      phone: reg.phone,
      countryOfIncorporation: reg.jurisdictionName || reg.jurisdiction,
      jurisdictionName: reg.jurisdictionName,
      stateOfRegistration: reg.stateOfIncorporation,
      companyType: reg.entityType,
      companyName: reg.companyName,
      alternateCompanyName: reg.alternateName,
      ownershipType: reg.ownershipType,
      holdingCompanies: reg.holdingCompanies,
      hasLocalAddress: reg.hasAddress === 'yes',
      localAddress: reg.localAddress,
      hasLocalRepresentative: reg.hasAgent === 'yes',
      agentDetails: reg.agentDetails,
      agentAddress: reg.agentAddress,
      directors: reg.directors,
      companyWebsite: reg.website,
      establishReason: reg.establishReason,
      principalActivity: reg.principalActivity,
      companyIntroduction: reg.briefIntroduction,
      additionalInfo: reg.additionalInfo,
      representativePhone: reg.phone,
    };

    if (reg.holdingFiles && reg.holdingFiles.length > 0) {
      payload.holdingFiles = reg.holdingFiles;
    }
    if (reg.otherFiles && reg.otherFiles.length > 0) {
      payload.otherFiles = reg.otherFiles;
    }
   
    try {
      const result = isEditing && companyId
        ? await updateCompanyRegistration(companyId, payload, token)
        : await submitCompanyRegistration(payload, token);
      
      if (result.isSuccess) {
        Toast.show({ type: 'success', text1: isEditing ? 'Registration updated successfully!' : 'Registration submitted successfully!' });
        dispatch(resetCompanyRegistration());
        const newCompanyId = result.data?._id || result.data?.company?._id || result.data?.data?._id;
        onSubmit(newCompanyId);
      } else {
        Toast.show({ type: 'error', text1: 'Submission failed', text2: result.error });
      }
    } catch (error: any) {
      console.log('Company registration error:', error?.response?.data ?? error?.message ?? error);
      Toast.show({ type: 'error', text1: 'Something went wrong', text2: error?.response?.data?.message || error?.message || 'Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Review & <Text style={styles.titleAccent}>{isEditing ? 'update' : 'submit'}</Text></Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Please check your details below. Tap "Edit" next to any section to make changes.
          </Text>

          {reviewSections.map((section, index) => (
            <View key={index} style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: '#e6a82a' }]}>{section.title}</Text>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={
                    index === 0 ? onEditApplicant
                    : index === 1 ? onEditJurisdiction
                    : index === 2 ? onEditCompanyName
                    : index === 3 ? onEditOwnership
                    : index === 4 ? onEditAddress
                    : index === 5 ? onEditDirectors
                    : index === 6 ? onEditBusinessActivity
                    : undefined
                  }
                >
                  <Text style={styles.editButtonText}>EDIT</Text>
                </TouchableOpacity>
              </View>

              {section.rows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.cardRow}>
                  <Text style={[styles.rowLabel, { color: colors.subtle }]}>{row.label}</Text>
                  <Text style={[styles.rowValue, { color: colors.text }]}>{row.value}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={[styles.declarationBox, { borderColor: '#e6a82a', backgroundColor: colors.surface }]}>
            <Text style={[styles.declarationTitle, { color: colors.text }]}>Authorization & Declaration</Text>

            <View style={styles.declarationItem}>
              <Text style={[styles.declarationBullet, { color: '#e6a82a' }]}>•</Text>
              <Text style={[styles.declarationItemText, { color: colors.muted }]}>
                <Text style={{ fontWeight: '600', color: colors.text }}>Appointment: </Text>
                We authorize CompanyVista to act on our behalf to prepare, sign, and submit all company registration documents.
              </Text>
            </View>

            <View style={styles.declarationItem}>
              <Text style={[styles.declarationBullet, { color: '#e6a82a' }]}>•</Text>
              <Text style={[styles.declarationItemText, { color: colors.muted }]}>
                <Text style={{ fontWeight: '600', color: colors.text }}>Accuracy: </Text>
                We confirm all provided information is complete and accurate.
              </Text>
            </View>

            <View style={styles.declarationItem}>
              <Text style={[styles.declarationBullet, { color: '#e6a82a' }]}>•</Text>
              <Text style={[styles.declarationItemText, { color: colors.muted }]}>
                <Text style={{ fontWeight: '600', color: colors.text }}>Liability: </Text>
                CompanyVista is not liable for delays, objections, or rejections from government authorities or banks.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            activeOpacity={0.8}
            onPress={() => setIsChecked(!isChecked)}
          >
            <View style={[styles.checkbox, { borderColor: colors.subtle }, isChecked && { backgroundColor: '#e6a82a', borderColor: '#e6a82a' }]}>
              {isChecked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              I agree to the terms and confirm all details are accurate.
            </Text>
          </TouchableOpacity>

          <View style={styles.inputsRow}>
            <View style={[styles.formGroup, { flex: 1.2, marginRight: 12 }]}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>SIGNATURE (TYPE YOUR FULL LEGAL NAME) <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: !signature ? '#ef4444' : colors.inputBorder }]}>
                <TextInput
                  placeholder="Type your full name"
                  placeholderTextColor={colors.inputPlaceholder}
                  style={[styles.input, { color: colors.text }]}
                  value={signature}
                  onChangeText={setSignature}
                />
              </View>
              {!signature && <Text style={styles.errorText}>Required.</Text>}
            </View>

            <View style={[styles.formGroup, { flex: 0.8 }]}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>DATE <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={dateStr}
                  editable={false}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footerColumn, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <ContinueButton
            label={isEditing ? 'UPDATE REGISTRATION' : 'SUBMIT REGISTRATION'}
            onPress={handleSubmit}
            disabled={!isChecked || !signature}
            loading={isSubmitting}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: font.heading,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  title: {
    fontSize: font.xxl,
    fontWeight: '500',
    lineHeight: 21,
    marginBottom: 4,
  },
  titleAccent: {
    color: '#e6a82a',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: font.base,
    marginBottom: 16,
  },
  sectionCard: {
    borderWidth: 0.5,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    paddingBottom: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: font.md,
    fontWeight: '600',
  },
  editButtonText: {
    fontSize: font.sm,
    fontWeight: '600',
    color: '#e6a82a',
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLabel: {
    fontSize: font.sm,
    flex: 0.4,
  },
  rowValue: {
    fontSize: font.sm,
    textAlign: 'right',
    flex: 0.6,
    fontWeight: '500',
  },
  declarationBox: {
    borderWidth: 0.5,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  declarationTitle: {
    fontSize: font.md,
    fontWeight: '700',
    marginBottom: 10,
  },
  declarationItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  declarationBullet: {
    fontSize: font.md,
    lineHeight: 18,
  },
  declarationItemText: {
    fontSize: font.sm,
    lineHeight: 18,
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderRadius: 3,
    marginRight: 8,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#000000',
    fontSize: font.sm,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: font.sm,
    flex: 1,
    lineHeight: 15,
    
  },
  inputsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  formGroup: {
    justifyContent: 'flex-start',
  },
  inputLabel: {
    fontSize: font.xs,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  required: {
    color: '#e6a82a',
  },
  inputWrapper: {
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    fontSize: font.base,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: font.xs,
    color: '#ef4444',
    marginTop: 2,
  },
  footerColumn: {
    flexDirection: 'column',
    gap: 8,
  },
  submitButtonFull: {
    backgroundColor: '#e6a82a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: font.md,
    fontWeight: '600',
    color: '#1a1204',
  },
});
