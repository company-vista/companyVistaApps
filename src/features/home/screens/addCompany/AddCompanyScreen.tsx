import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '../../../../theme/colors';
import { useAppSelector } from '../../../../store/hooks';
import { BackButton } from '../../../../components/buttons';
import JurisdictionSelectionScreen from './JurisdictionSelectionScreen';
import EntityDetailScreen from './EntityDetailScreen';
import OwnershipScreen from './OwnershipScreen';
import RegisteredAddressScreen from './RegisteredAddressScreen';
import DirectorsShareholdersScreen from './DirectorsShareholdersScreen';
import BusinessFormScreen from './BusinessFormScreen';
import AdditionalDocumentsScreen from './AdditionalDocumentsScreen';
import ReviewSubmitScreen from './ReviewSubmitScreen';

type ApplicantType = 'owner' | 'representative' | 'partner';

interface ApplicantOption {
  id: ApplicantType;
  title: string;
  description: string;
}

const applicantOptions: ApplicantOption[] = [
  {
    id: 'owner',
    title: 'Owner / Director',
    description: "I'm a founder or director of this company",
  },
  {
    id: 'representative',
    title: 'Representative',
    description: "I'm applying on behalf of the owner(s)",
  },
  {
    id: 'partner',
    title: 'CompanyVista Partner',
    description: "I'm a referral / channel partner",
  },
];

const TOTAL_STEPS = 5;
const CURRENT_STEP = 1;

function StepProgress({ total, current }: { total: number; current: number }) {
  const colors = useThemeColors();
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.progressSegment,
            idx < current
              ? styles.progressSegmentActive
              : { backgroundColor: colors.border },
          ]}
        />
      ))}
    </View>
  );
}

function RadioOption({
  option,
  selected,
  onSelect,
  colors,
}: {
  option: ApplicantOption;
  selected: boolean;
  onSelect: (id: ApplicantType) => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.radioCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selected && { borderColor: '#e6a82a', backgroundColor: 'rgba(230,168,42,0.06)' },
      ]}
      onPress={() => onSelect(option.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.radioCircle, selected && { borderColor: '#e6a82a' }]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.radioTextWrap}>
        <Text style={[styles.radioTitle, { color: colors.text }]}>{option.title}</Text>
        <Text style={[styles.radioDescription, { color: colors.subtle }]}>{option.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

type AddCompanyScreenProps = {
  onBackPress: () => void;
  onSubmit?: () => void;
};

export default function AddCompanyScreen({ onBackPress, onSubmit: onFormSubmit }: AddCompanyScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const user = useAppSelector(state => state.auth.user);
  const nameParts = (user?.name ?? '').split(' ');
  const userFirstName = user?.firstName ?? nameParts[0] ?? '';
  const userLastName = user?.lastName ?? nameParts.slice(1).join(' ') ?? '';

  const [step, setStep] = useState(1);
  const [applicantType, setApplicantType] = useState<ApplicantType>('owner');
  const [firstName, setFirstName] = useState(userFirstName);
  const [lastName, setLastName] = useState(userLastName);
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? user?.phoneNumber ?? user?.mobile ?? '');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);

  const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;

  if (step === 2) {
    return (
      <JurisdictionSelectionScreen
        onBackPress={() => setStep(1)}
        onContinue={(countryCode: string) => {
          setSelectedJurisdiction(countryCode);
          setStep(3);
        }}
      />
    );
  }

  if (step === 3) {
    return (
      <EntityDetailScreen
        selectedJurisdiction={selectedJurisdiction}
        onBackPress={() => setStep(2)}
        onContinue={() => setStep(4)}
      />
    );
  }

  if (step === 4) {
    return <OwnershipScreen onBackPress={() => setStep(3)} onContinue={() => setStep(5)} />;
  }

  if (step === 5) {
    return <RegisteredAddressScreen onBackPress={() => setStep(4)} onContinue={() => setStep(6)} />;
  }

  if (step === 6) {
    return <DirectorsShareholdersScreen onBackPress={() => setStep(5)} onContinue={() => setStep(7)} />;
  }

  if (step === 7) {
    return <BusinessFormScreen onBackPress={() => setStep(6)} onContinue={() => setStep(8)} />;
  }

  if (step === 8) {
    return <AdditionalDocumentsScreen onBackPress={() => setStep(7)} onContinue={() => setStep(9)} />;
  }

  if (step === 9) {
    return (
      <ReviewSubmitScreen
        onBackPress={() => setStep(8)}
        onSubmit={onFormSubmit ?? (() => {})}
        onEditApplicant={() => setStep(1)}
        onEditJurisdiction={() => setStep(2)}
        onEditCompanyName={() => setStep(3)}
        onEditOwnership={() => setStep(4)}
        onEditAddress={() => setStep(5)}
        onEditDirectors={() => setStep(6)}
        onEditBusinessActivity={() => setStep(7)}
      />
    );
  }

  const handleContinue = () => {
    setStep(2);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Company</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: safeAreaInsets.bottom + 24 }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Let's set up your <Text style={styles.titleAccent}>company</Text>, step by step.
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          This guided form adapts to the country you're registering in — you'll only
          see the questions that apply to you. It shouldn't take more than 5 minutes.
        </Text>

        <StepProgress total={TOTAL_STEPS} current={CURRENT_STEP} />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Who's <Text style={styles.titleAccent}>applying</Text> today?
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
          This helps us address the right person and route the application correctly.
        </Text>

        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text }]}>
            I AM THE <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.helpCircle, { borderColor: colors.subtle }]}>
            <Text style={[styles.helpCircleText, { color: colors.subtle }]}>?</Text>
          </View>
        </View>

        <View style={styles.radioGroup}>
          {applicantOptions.map((option) => (
            <RadioOption
              key={option.id}
              option={option}
              selected={applicantType === option.id}
              onSelect={setApplicantType}
              colors={colors}
            />
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.fieldHalf}>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>FIRST NAME</Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={colors.inputPlaceholder}
              />
            </View>
          </View>
          <View style={styles.fieldHalf}>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>LAST NAME</Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={colors.inputPlaceholder}
              />
            </View>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>EMAIL ADDRESS</Text>
          <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.inputPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>PHONE NUMBER</Text>
          <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={colors.inputPlaceholder}
              keyboardType="phone-pad"
            />
          </View>
          <Text style={[styles.helperText, { color: colors.subtle }]}>with country code</Text>
        </View>

        <View style={styles.footerColumn}>
          <TouchableOpacity style={styles.continueButtonFull} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.continueButtonText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 10,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 23,
    marginBottom: 6,
  },
  titleAccent: {
    color: '#e6a82a',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 18,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 18,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
  progressSegmentActive: {
    backgroundColor: '#e6a82a',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
  },
  required: {
    color: '#e6a82a',
  },
  helpCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCircleText: {
    fontSize: 8,
  },
  radioGroup: {
    gap: 8,
    marginBottom: 16,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#3a4258',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e6a82a',
  },
  radioTextWrap: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  radioDescription: {
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 9,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  inputWrapper: {
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    fontSize: 12,
    paddingVertical: 16,
  },
  helperText: {
    fontSize: 9,
    marginTop: 4,
  },
  footerColumn: {
    marginTop: 6,
  },
  continueButtonFull: {
    backgroundColor: '#e6a82a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#1a1204',
    fontSize: 12,
    fontWeight: '500',
  },
});