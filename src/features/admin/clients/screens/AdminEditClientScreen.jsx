import { font } from '../../../../theme/typography';
import React, { useEffect, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import { s } from '../../../../theme/responsive';
import { fetchAdminClient, updateAdminClient } from '../api/adminClientsApi';

const EMPTY_FORM = {
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
  { key: 'firstName', label: 'First name *' },
  { key: 'lastName', label: 'Last name *' },
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

const asText = value => (value == null ? '' : String(value));

const getDateInputValue = value => {
  if (!value) return '';
  const dateValue = value instanceof Date ? value.toISOString() : String(value);
  return dateValue.slice(0, 10);
};

const buildForm = client => ({
  ...EMPTY_FORM,
  firstName: asText(client.firstName),
  lastName: asText(client.lastName),
  email: asText(client.email),
  phoneNumber: asText(client.phoneNumber),
  countryCode: asText(client.countryCode || '+91'),
  dateOfBirth: getDateInputValue(client.dateOfBirth),
  passportNumber: asText(client.passportNumber),
  ssn: asText(client.ssn),
  itin: asText(client.itin),
  address: {
    ...EMPTY_FORM.address,
    ...(client.address || {}),
    addressLine1: asText(client.address?.addressLine1),
    city: asText(client.address?.city),
    state: asText(client.address?.state),
    postalCode: asText(client.address?.postalCode),
    country: asText(client.address?.country),
  },
  isPrimary: Boolean(client.isPrimary),
  status: asText(client.status || 'active'),
});

const AdminEditClientScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const clientId = route.params?.clientId;
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadClient = async () => {
      if (!clientId) {
        setError('Client ID is missing.');
        setLoading(false);
        return;
      }
      try {
        const client = await fetchAdminClient({ token, id: clientId });
        if (active) setForm(buildForm(client));
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load client details.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadClient();
    return () => {
      active = false;
    };
  }, [clientId, token]);

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

  const handleSave = async () => {
    if (saving) return;
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!form.phoneNumber.trim()) {
      setError('Phone number is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await updateAdminClient({
        token,
        id: clientId,
        payload: {
          ...form,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phoneNumber: form.phoneNumber.trim(),
          countryCode: form.countryCode.trim(),
          dateOfBirth: form.dateOfBirth || null,
        },
      });
      Alert.alert('Client updated', 'Client details were saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update client.');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = ({
    fieldKey,
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    autoCapitalize = 'words',
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
        <Text style={styles.headerTitle}>Edit Client</Text>
        <View style={styles.headerSpacer} />
      </View>
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.helperText}>Loading client details...</Text>
        </View>
      ) : (
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
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color="#B91C1C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
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
                fieldKey: 'email',
                label: 'Email *',
                value: form.email,
                onChangeText: value => updateField('email', value),
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              })}
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  {renderInput({
                    fieldKey: 'countryCode',
                    label: 'Code',
                    value: form.countryCode,
                    onChangeText: value => updateField('countryCode', value),
                    keyboardType: 'phone-pad',
                    autoCapitalize: 'none',
                  })}
                </View>
                <View style={styles.phoneNumber}>
                  {renderInput({
                    fieldKey: 'phoneNumber',
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
              <Text style={styles.sectionTitle}>Account details</Text>
              <View style={styles.optionRow}>
                <View style={styles.optionCopy}>
                  <Text style={styles.label}>Primary contact</Text>
                </View>
                <Pressable
                  onPress={() => updateField('isPrimary', !form.isPrimary)}
                  disabled={saving}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: form.isPrimary }}
                  style={[styles.toggle, form.isPrimary && styles.toggleActive]}>
                  <View
                    style={[
                      styles.toggleThumb,
                      form.isPrimary && styles.toggleThumbActive,
                    ]}
                  />
                </Pressable>
              </View>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusRow}>
                {['active', 'inactive', 'pending'].map(value => (
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
                        styles.statusText,
                        form.status === value && styles.statusTextActive,
                      ]}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              style={[styles.submitButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button">
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Save Changes</Text>
                  <Ionicons name="checkmark" size={19} color="#FFFFFF" />
                </>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

export default AdminEditClientScreen;

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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(10),
    backgroundColor: '#F1F5F9',
    marginRight: s(10),
  },
  headerTitle: { flex: 1, color: '#0F172A', fontSize: font.lg, fontWeight: '700' },
  headerSpacer: { width: s(38) },
  body: { flex: 1 },
  content: { padding: s(16) },
  section: {
    padding: s(14),
    marginBottom: s(12),
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: font.sm,
    fontWeight: '700',
    marginBottom: s(12),
  },
  field: { marginBottom: s(11) },
  label: { color: '#334155', fontSize: font.xs, fontWeight: '600', marginBottom: s(5) },
  input: {
    minHeight: s(42),
    paddingHorizontal: s(11),
    paddingVertical: s(8),
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: s(8),
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    fontSize: font.sm,
  },
  phoneRow: { flexDirection: 'row', gap: s(10) },
  countryCode: { width: s(88) },
  phoneNumber: { flex: 1 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(14),
  },
  optionCopy: { flex: 1 },
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
  statusRow: { flexDirection: 'row', gap: s(8), marginTop: s(7) },
  statusButton: {
    flex: 1,
    minHeight: s(38),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  statusButtonActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  statusText: { color: '#475569', fontSize: font.xs, fontWeight: '600' },
  statusTextActive: { color: '#1D4ED8' },
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
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: s(24) },
  helperText: { color: '#64748B', fontSize: font.sm, marginTop: s(10) },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    padding: s(12),
    marginBottom: s(12),
    borderRadius: s(9),
    backgroundColor: '#FEF2F2',
  },
  errorText: { flex: 1, color: '#B91C1C', fontSize: font.xs },
});
