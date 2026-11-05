import { font } from '../../../../theme/typography';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { pick, types } from '@react-native-documents/picker';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import { s } from '../../../../theme/responsive';
import {
  createAdminClient,
  uploadAdminClientItinLetter,
} from '../api/adminClientsApi';

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  countryCode: '+91',
  dateOfBirth: '',
  passportNumber: '',
  ssn: '',
  itin: '',
  address: {
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  isPrimary: false,
  status: 'active',
};

const PERSONAL_FIELDS = [
  { key: 'firstName', label: 'First name *', required: true },
  { key: 'lastName', label: 'Last name *', required: true },
  { key: 'dateOfBirth', label: 'Date of birth', placeholder: 'YYYY-MM-DD' },
  { key: 'passportNumber', label: 'Passport number' },
  { key: 'ssn', label: 'SSN' },
  { key: 'itin', label: 'ITIN' },
];

const ADDRESS_FIELDS = [
  { key: 'addressLine1', label: 'Street address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'postalCode', label: 'Postal code' },
  { key: 'country', label: 'Country' },
];

const AdminCreateClientScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [form, setForm] = useState(INITIAL_FORM);
  const [contactType, setContactType] = useState('primary');
  const [itinLetter, setItinLetter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }));
    setError('');
  };

  const updateAddress = (key, value) => {
    setForm(previous => ({
      ...previous,
      address: { ...previous.address, [key]: value },
    }));
    setError('');
  };

  const chooseItinLetter = async () => {
    try {
      const [file] = await pick({
        type: [types.pdf, types.images, types.doc, types.docx],
        allowMultiSelection: false,
      });
      if (file?.uri) {
        setItinLetter({
          uri: file.uri,
          name: file.name || `itin-letter-${Date.now()}`,
          type: file.type || 'application/octet-stream',
        });
        setError('');
      }
    } catch (pickerError) {
      if (
        pickerError?.code === 'DOCUMENT_PICKER_CANCELED' ||
        pickerError?.code === 'user_cancelled'
      ) {
        return;
      }
      setError(pickerError?.message || 'Unable to open the document picker.');
    }
  };

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required.';
    if (!form.lastName.trim()) return 'Last name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!form.phoneNumber.trim()) return 'Phone number is required.';
    return '';
  };

  const handleCreate = async () => {
    if (saving) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    let createdClient;
    try {
      createdClient = await createAdminClient({
        token,
        payload: {
          ...form,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          countryCode: form.countryCode.trim(),
          contactType,
        },
      });
    } catch (createError) {
      setError(createError.message);
      setSaving(false);
      return;
    }

    const clientId = createdClient._id || createdClient.id;
    if (itinLetter && clientId) {
      try {
        await uploadAdminClientItinLetter({ token, id: clientId, file: itinLetter });
      } catch (uploadError) {
        setSaving(false);
        Alert.alert(
          'Client created',
          `The client was created, but the ITIN letter could not be uploaded: ${uploadError.message}`,
          [
            {
              text: 'View client',
              onPress: () => {
                navigation.replace('AdminClientDetails', { clientId });
              },
            },
          ],
        );
        return;
      }
    }

    setSaving(false);
    Alert.alert('Client created', 'The client was added successfully.', [
      {
        text: 'View client',
        onPress: () => {
          if (clientId) {
            navigation.replace('AdminClientDetails', { clientId });
          } else {
            navigation.goBack();
          }
        },
      },
    ]);
  };

  const renderInput = ({
    fieldKey,
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    autoCapitalize = 'words',
    secureTextEntry = false,
  }) => (
    <View key={fieldKey} style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label.replace(' *', '')}
        placeholderTextColor="#94A3B8"
        style={styles.input}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        editable={!saving}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, s(12)) }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Client</Text>
        <View style={styles.headerSpacer} />
      </View>
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: s(24) + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.contactTypeSection}>
            <Text style={styles.sectionTitle}>Contact type</Text>
            <View style={styles.contactTypeRow}>
              {['primary', 'secondary'].map(type => (
                <Pressable
                  key={type}
                  onPress={() => setContactType(type)}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityState={{ selected: contactType === type }}
                  style={[
                    styles.contactTypeButton,
                    contactType === type && styles.contactTypeButtonActive,
                    contactType === type &&
                      type === 'secondary' &&
                      styles.secondaryButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.contactTypeText,
                      contactType === type && styles.contactTypeTextActive,
                    ]}>
                    {type === 'primary' ? 'Primary' : 'Secondary'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal information</Text>
            {PERSONAL_FIELDS.map(field =>
              renderInput({
                ...field,
                fieldKey: field.key,
                value: form[field.key],
                onChangeText: value => updateField(field.key, value),
              }),
            )}
            {renderInput({
              label: 'Email *',
              value: form.email,
              onChangeText: value => updateField('email', value),
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            })}
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                {renderInput({
                  label: 'Code',
                  value: form.countryCode,
                  onChangeText: value => updateField('countryCode', value),
                  keyboardType: 'phone-pad',
                  autoCapitalize: 'none',
                })}
              </View>
              <View style={styles.phoneNumber}>
                {renderInput({
                  label: 'Phone number *',
                  value: form.phoneNumber,
                  onChangeText: value => updateField('phoneNumber', value),
                  keyboardType: 'phone-pad',
                  autoCapitalize: 'none',
                })}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address information</Text>
            {ADDRESS_FIELDS.map(field =>
              renderInput({
                ...field,
                fieldKey: field.key,
                value: form.address[field.key],
                onChangeText: value => updateAddress(field.key, value),
              }),
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other details</Text>
            <Text style={styles.label}>ITIN letter</Text>
            <Pressable
              style={styles.fileButton}
              onPress={chooseItinLetter}
              disabled={saving}
              accessibilityRole="button">
              <Ionicons
                name={itinLetter ? 'document-text' : 'cloud-upload-outline'}
                size={19}
                color="#2563EB"
              />
              <Text style={styles.fileButtonText} numberOfLines={1}>
                {itinLetter?.name || 'Choose a PDF or image'}
              </Text>
              {itinLetter ? (
                <Pressable
                  onPress={() => setItinLetter(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Remove ITIN letter">
                  <Ionicons name="close-circle" size={20} color="#64748B" />
                </Pressable>
              ) : null}
            </Pressable>
            <View style={styles.optionRow}>
              <View style={styles.optionCopy}>
                <Text style={styles.label}>Primary contact</Text>
                <Text style={styles.helperText}>
                  Mark this client as a primary contact.
                </Text>
              </View>
              <Pressable
                onPress={() => updateField('isPrimary', !form.isPrimary)}
                accessibilityRole="switch"
                accessibilityState={{ checked: form.isPrimary }}
                style={[
                  styles.toggle,
                  form.isPrimary && styles.toggleActive,
                ]}>
                <View
                  style={[
                    styles.toggleThumb,
                    form.isPrimary && styles.toggleThumbActive,
                  ]}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account status</Text>
            <View style={styles.contactTypeRow}>
              {['active', 'inactive'].map(value => (
                <Pressable
                  key={value}
                  onPress={() => updateField('status', value)}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityState={{ selected: form.status === value }}
                  style={[
                    styles.statusButton,
                    form.status === value && styles.statusButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.contactTypeText,
                      form.status === value && styles.contactTypeTextActive,
                    ]}>
                    {value === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#B91C1C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.submitButton, saving && styles.disabledButton]}
            onPress={handleCreate}
            disabled={saving}
            accessibilityRole="button">
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Create Client</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </Pressable>
          <Text style={styles.requiredNote}>* Required fields</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AdminCreateClientScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    minHeight: s(58),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: s(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: s(38),
    height: s(38),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(10),
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#0F172A',
    fontSize: font.lg,
    fontWeight: '800',
  },
  headerSpacer: { width: s(38) },
  body: { flex: 1 },
  content: { padding: s(16) },
  contactTypeSection: {
    marginBottom: s(12),
    padding: s(14),
    borderRadius: s(14),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactTypeRow: { flexDirection: 'row', gap: s(10) },
  contactTypeButton: {
    flex: 1,
    minHeight: s(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(9),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactTypeButtonActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  secondaryButtonActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  contactTypeText: { color: '#475569', fontSize: font.sm, fontWeight: '600' },
  contactTypeTextActive: { color: '#FFFFFF' },
  section: {
    marginBottom: s(12),
    padding: s(14),
    borderRadius: s(14),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: font.base,
    fontWeight: '800',
    marginBottom: s(12),
  },
  field: { marginBottom: s(12) },
  label: {
    color: '#334155',
    fontSize: font.xs,
    fontWeight: '600',
    marginBottom: s(5),
  },
  input: {
    minHeight: s(44),
    paddingHorizontal: s(12),
    paddingVertical: s(9),
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: s(9),
    color: '#0F172A',
    fontSize: font.sm,
    backgroundColor: '#FFFFFF',
  },
  phoneRow: { flexDirection: 'row', gap: s(10) },
  countryCode: { width: s(82) },
  phoneNumber: { flex: 1 },
  fileButton: {
    minHeight: s(46),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(9),
    paddingHorizontal: s(12),
    borderRadius: s(9),
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  fileButtonText: { flex: 1, color: '#1D4ED8', fontSize: font.xs, fontWeight: '600' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: s(16),
  },
  optionCopy: { flex: 1, marginRight: s(12) },
  helperText: { color: '#64748B', fontSize: font.tiny, marginTop: s(3) },
  toggle: {
    width: s(46),
    height: s(26),
    justifyContent: 'center',
    padding: s(3),
    borderRadius: s(14),
    backgroundColor: '#CBD5E1',
  },
  toggleActive: { backgroundColor: '#2563EB' },
  toggleThumb: {
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: { alignSelf: 'flex-end' },
  statusButton: {
    flex: 1,
    minHeight: s(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(9),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusButtonActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(8),
    padding: s(12),
    marginBottom: s(12),
    borderRadius: s(9),
    backgroundColor: '#FEF2F2',
  },
  errorText: { flex: 1, color: '#B91C1C', fontSize: font.xs },
  submitButton: {
    minHeight: s(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(9),
    borderRadius: s(10),
    backgroundColor: '#2563EB',
  },
  disabledButton: { opacity: 0.65 },
  submitButtonText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '700' },
  requiredNote: {
    color: '#64748B',
    fontSize: font.tiny,
    textAlign: 'center',
    marginTop: s(10),
  },
});
