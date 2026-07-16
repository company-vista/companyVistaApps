import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { BackButton } from '../../../../components/buttons';
import { useAppSelector } from '../../../../store/hooks';
import { formatDate } from '../../../../constants/dateFormatter';

interface RolesState {
  shareholder: boolean;
  director: boolean;
  secretary: boolean;
  representative: boolean;
}

type DirectorsShareholdersScreenProps = {
  onBackPress: () => void;
  onContinue: () => void;
};

export default function DirectorsShareholdersScreen({ onBackPress, onContinue }: DirectorsShareholdersScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;
  const user = useAppSelector(state => state.auth.user);
  const nameParts = (user?.name ?? '').split(' ');
  const userFirstName = user?.firstName ?? nameParts[0] ?? '';
  const userLastName = user?.lastName ?? nameParts.slice(1).join(' ') ?? '';
  const userEmail = user?.email ?? '';
  const userPhone = user?.phone ?? user?.phoneNumber ?? user?.mobile ?? '';
  const userCountryCode = user?.countryCode ?? '';
  const userDob = user?.dateOfBirth ?? user?.dob ?? '';
  const userPassport = user?.passportNo ?? user?.passportNumber ?? '';
  const userAddressLine1 = user?.address?.addressLine1 ?? user?.address?.street ?? user?.addressLine1 ?? user?.street ?? '';
  const userCity = user?.address?.city ?? '';
  const userState = user?.address?.state ?? user?.state ?? '';
  const userPostalCode = user?.address?.postalCode ?? user?.postalCode ?? '';
  const userCountry = user?.address?.country ?? user?.country ?? '';

  const [firstName, setFirstName] = useState(userFirstName);
  const [lastName, setLastName] = useState(userLastName);
  const [ownership, setOwnership] = useState('100');
  const [dob, setDob] = useState(userDob);
  const [passport, setPassport] = useState(userPassport);
  const [email, setEmail] = useState(userEmail);
  const [countryCode, setCountryCode] = useState(userCountryCode);
  const [phone, setPhone] = useState(userPhone);

  const [address, setAddress] = useState({
    line1: userAddressLine1,
    line2: '',
    city: userCity,
    state: userState,
    postalCode: userPostalCode,
    country: userCountry,
  });

  const [passportFile, setPassportFile] = useState<{ name: string; uri: string } | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<{ name: string; uri: string } | null>(null);

  const pickFile = async (onPick: (file: { name: string; uri: string }) => void) => {
    try {
      const [result] = await pick({ type: [types.images, types.pdf] });
      if (result) {
        onPick({ name: result.name ?? 'file', uri: result.uri });
      }
    } catch (err: any) {
      if (err && err.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  const [roles, setRoles] = useState<RolesState>({
    shareholder: true,
    director: false,
    secretary: false,
    representative: false,
  });

  const toggleRole = (key: keyof RolesState) => {
    setRoles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Directors & shareholders</Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Who are the <Text style={styles.titleAccent}>directors & shareholders</Text>?
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Add each individual's details, position or shareholder. You can add up to 5 people here.
          </Text>

          <Text style={[styles.shareholderIndicator, { color: colors.text }]}>
            Total shareholding: entered <Text style={{color: '#e6a82a', fontWeight: '700'}}>100%</Text>
          </Text>

          <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionHeadingGold, { color: '#e6a82a' }]}>1st Director / Shareholder</Text>

            <View style={[styles.infoBanner, { borderColor: '#6b5320', backgroundColor: 'rgba(230,168,42,0.08)' }]}>
              <Text style={styles.infoIcon}>{'\u2139'}</Text>
              <Text style={[styles.infoText, { color: colors.muted }]}>
                <Text style={{fontWeight: '700', color: '#e6a82a'}}>Auto-filled from your profile</Text> — fields below are pre-populated with your account details. You can edit any field if needed.
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>FIRST NAME <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={firstName} onChangeText={setFirstName} />
                </View>
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>LAST NAME <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={lastName} onChangeText={setLastName} />
                </View>
              </View>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.muted, marginTop: 4 }]}>ROLE(S) — SELECT ALL THAT APPLY ⓘ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkboxItem, { backgroundColor: colors.surface, borderColor: colors.border }, roles.shareholder && { borderColor: '#e6a82a' }]}
                onPress={() => toggleRole('shareholder')}
              >
                <View style={[styles.checkbox, roles.shareholder && { backgroundColor: '#e6a82a', borderColor: '#e6a82a' }]}>
                  {roles.shareholder && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>Shareholder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkboxItem, { backgroundColor: colors.surface, borderColor: colors.border }, roles.director && { borderColor: '#e6a82a' }]}
                onPress={() => toggleRole('director')}
              >
                <View style={[styles.checkbox, roles.director && { backgroundColor: '#e6a82a', borderColor: '#e6a82a' }]}>
                  {roles.director && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>Director</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkboxItem, { backgroundColor: colors.surface, borderColor: colors.border }, roles.secretary && { borderColor: '#e6a82a' }]}
                onPress={() => toggleRole('secretary')}
              >
                <View style={[styles.checkbox, roles.secretary && { backgroundColor: '#e6a82a', borderColor: '#e6a82a' }]}>
                  {roles.secretary && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>Company Secretary</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkboxItem, { backgroundColor: colors.surface, borderColor: colors.border }, roles.representative && { borderColor: '#e6a82a' }]}
                onPress={() => toggleRole('representative')}
              >
                <View style={[styles.checkbox, roles.representative && { backgroundColor: '#e6a82a', borderColor: '#e6a82a' }]}>
                  {roles.representative && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>Authorized Representative</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>OWNERSHIP % <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={ownership} keyboardType="numeric" onChangeText={setOwnership} />
                </View>
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>DATE OF BIRTH <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={formatDate(dob)} onChangeText={setDob} />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>PASSPORT NUMBER <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={passport} onChangeText={setPassport} />
                </View>
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>EMAIL <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={email} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 0.35, marginRight: 8 }}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>COUNTRY CODE <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={countryCode} editable={false} />
                </View>
              </View>
              <View style={{ flex: 0.65 }}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>PHONE NUMBER <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={phone} keyboardType="phone-pad" onChangeText={setPhone} />
                </View>
              </View>
            </View>

            <Text style={[styles.sectionHeadingGold, { color: '#e6a82a', fontSize: font.md, marginTop: 16, marginBottom: 12 }]}>
              Residential Address (as on passport)
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.addressLabel, { color: colors.subtle }]}>Address Line 1 / P.O. box</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput style={[styles.input, { color: colors.text }]} value={address.line1} onChangeText={t => setAddress({...address, line1: t})} />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.addressLabel, { color: colors.subtle }]}>Address Line 2 (optional)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput style={[styles.input, { color: colors.text }]} value={address.line2} onChangeText={t => setAddress({...address, line2: t})} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.addressLabel, { color: colors.subtle }]}>City</Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={address.city} onChangeText={t => setAddress({...address, city: t})} />
                </View>
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.addressLabel, { color: colors.subtle }]}>State</Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={address.state} onChangeText={t => setAddress({...address, state: t})} />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.addressLabel, { color: colors.subtle }]}>Postal / ZIP Code</Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={address.postalCode} onChangeText={t => setAddress({...address, postalCode: t})} />
                </View>
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.addressLabel, { color: colors.subtle }]}>Country</Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.input, { color: colors.text }]} value={address.country} />
                </View>
              </View>
            </View>

            <Text style={[styles.sectionHeadingGold, { color: '#e6a82a', fontSize: font.md, marginTop: 16, marginBottom: 12 }]}>
              Identity Documents
            </Text>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>PASSPORT COPY <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity style={[styles.uploadBox, { borderColor: '#6b5320', backgroundColor: colors.mode === 'dark' ? 'rgba(15,23,42,0.6)' : colors.surfaceAlt }]} activeOpacity={0.7} onPress={() => pickFile(setPassportFile)}>
                  <Text style={styles.uploadIcon}>{'\u2601'}</Text>
                  <Text style={[styles.uploadMainText, { color: colors.text }]}>{passportFile ? passportFile.name : 'Click or drag passport copy'}</Text>
                  <Text style={[styles.uploadSubText, { color: colors.subtle }]}>JPG, PNG, PDF</Text>
                </TouchableOpacity>
                <Text style={[styles.uploadHint, { color: colors.subtle }]}>JPG, PNG or PDF — max 10MB each</Text>
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>PROOF OF ADDRESS</Text>
                <TouchableOpacity style={[styles.uploadBox, { borderColor: '#6b5320', backgroundColor: colors.mode === 'dark' ? 'rgba(15,23,42,0.6)' : colors.surfaceAlt }]} activeOpacity={0.7} onPress={() => pickFile(setAddressProofFile)}>
                  <Text style={styles.uploadIcon}>{'\u2601'}</Text>
                  <Text style={[styles.uploadMainText, { color: colors.text }]}>{addressProofFile ? addressProofFile.name : 'Click or drag address proof'}</Text>
                  <Text style={[styles.uploadSubText, { color: colors.subtle }]}>JPG, PNG, PDF</Text>
                </TouchableOpacity>
                <Text style={[styles.uploadHint, { color: colors.subtle }]}>Utility bill / bank statement — JPG, PNG or PDF</Text>
              </View>
            </View>
          </View>

          <View style={[styles.warningBanner, { borderColor: '#6b5320', backgroundColor: colors.mode === 'dark' ? 'rgba(11,17,30,0.8)' : colors.surfaceAlt }]}>
            <Text style={styles.warningIcon}>{'\u2139'}</Text>
            <Text style={[styles.warningText, { color: colors.muted }]}>
              Total shareholding is already <Text style={{fontWeight: '700', color: '#e6a82a'}}>100%</Text> — adjust above to add more people
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footerColumn, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <TouchableOpacity
            style={styles.continueButtonFull}
            onPress={onContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue →</Text>
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
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 6,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: font.heading,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 18,
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
    marginBottom: 8,
  },
  shareholderIndicator: {
    fontSize: font.base,
    marginBottom: 14,
  },
  formCard: {
    // borderWidth: 0.5,
    borderRadius: 8,
    padding: 6,
    marginBottom: 14,
  },
  sectionHeadingGold: {
    fontSize: font.lg,
    fontWeight: '500',
    marginBottom: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoIcon: {
    color: '#e6a82a',
    fontSize: font.lg,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: font.sm,
    lineHeight: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  halfInput: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: font.xs,
    letterSpacing: 0.3,
    marginBottom: 6,
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
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    flexGrow: 0,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#64748B',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  checkMark: {
    color: '#0B111E',
    fontSize: font.sm,
    fontWeight: 'bold',
    marginTop: -1,
  },
  checkboxLabel: {
    fontSize: font.sm,
    fontWeight: '500',
  },
  addressLabel: {
    fontSize: font.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  uploadIcon: {
    fontSize: font.hero,
    color: '#e6a82a',
    marginBottom: 6,
  },
  uploadMainText: {
    fontSize: font.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  uploadSubText: {
    fontSize: font.xs,
  },
  uploadHint: {
    fontSize: font.xs,
    lineHeight: 11,
    marginTop: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderStyle: 'dashed',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  warningIcon: {
    color: '#e6a82a',
    fontSize: font.lg,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: font.sm,
  },
  footerColumn: {
    gap: 8,
  },
  continueButtonFull: {
    backgroundColor: '#e6a82a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: font.base,
    fontWeight: '500',
    color: '#1a1204',
  },
});
