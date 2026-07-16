import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { BackButton } from '../../../../components/buttons';

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
  onSubmit: () => void;
  onEditApplicant?: () => void;
  onEditJurisdiction?: () => void;
  onEditCompanyName?: () => void;
  onEditOwnership?: () => void;
  onEditAddress?: () => void;
  onEditDirectors?: () => void;
  onEditBusinessActivity?: () => void;
};

export default function ReviewSubmitScreen({ onBackPress, onSubmit, onEditApplicant, onEditJurisdiction, onEditCompanyName, onEditOwnership, onEditAddress, onEditDirectors, onEditBusinessActivity }: ReviewSubmitScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;

  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [signature, setSignature] = useState<string>('');
  const [date] = useState<string>('07/06/2026');

  const reviewSections: ReviewSection[] = [
    {
      title: 'Applicant',
      rows: [
        { label: 'I am the', value: 'owner' },
        { label: 'Contact', value: 'Gautam Kumar (gautamrajanexport@gmail.com)' },
      ],
    },
    {
      title: 'Jurisdiction & Entity',
      rows: [
        { label: 'Country', value: 'Costa Rica' },
        { label: 'Entity type', value: 'Sociedad Anónima (S.A.)' },
      ],
    },
    {
      title: 'Company Name',
      rows: [
        { label: 'Desired name', value: 'ooo' },
        { label: 'Alternate name', value: 'kjfksl' },
      ],
    },
    {
      title: 'Ownership',
      rows: [
        { label: 'Structure', value: 'branch' },
        { label: 'Holding company 1', value: '— (100.0%)' },
        { label: 'Holding company 2', value: '— (0%)' },
      ],
    },
    {
      title: 'Address & Representative',
      rows: [
        { label: 'Local address', value: 'yes' },
        { label: 'Local representative', value: 'yes' },
      ],
    },
    {
      title: 'Directors & Shareholders',
      rows: [
        { label: '1st person', value: 'Gautam Kumar — 100%' },
        { label: 'Total shareholding', value: '100%' },
      ],
    },
    {
      title: 'Business Activity',
      rows: [
        { label: 'Reason', value: 'Expanding an existing business internationally' },
        { label: 'Activity', value: 'Software Development / SaaS' },
      ],
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Review & <Text style={styles.titleAccent}>submit</Text></Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* <Text style={[styles.title, { color: colors.text }]}>
            Review & <Text style={styles.titleAccent}>submit</Text>
          </Text> */}
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
            <Text style={[styles.declarationText, { color: colors.muted }]}>
              I, the undersigned, on behalf of all the directors/shareholders of the company described above, appoint CompanyVesta (and/or its affiliated registered agents) as authorized representative to act on our behalf in all matters related to this company's registration. CompanyVesta is authorized to prepare, sign and submit the necessary documents to relevant authorities and to take any actions required for registration approval. We acknowledge CompanyVesta is not liable for delays, objections or rejections from authorities, registries, or banks. We confirm the accuracy of all the information provided and agree to indemnify CompanyVesta against any claims, costs or liabilities arising from this registration process.
            </Text>
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
              I have read and agree to the terms stated above, and confirm that all information provided is accurate to the best of my knowledge.
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
                  value={date}
                  editable={false}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footerColumn, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <TouchableOpacity
            style={[styles.submitButtonFull, (!isChecked || !signature) && styles.submitButtonDisabled]}
            onPress={() => {
              Toast.show({ type: 'success', text1: 'Registration submitted successfully!' });
              onSubmit();
            }}
            activeOpacity={0.85}
            disabled={!isChecked || !signature}
          >
            <Text style={styles.submitButtonText}>SUBMIT REGISTRATION</Text>
          </TouchableOpacity>
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
  declarationText: {
    fontSize: font.sm,
    lineHeight: 14,
    textAlign: 'justify',
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
