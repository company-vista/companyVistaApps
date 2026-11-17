import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types as pickerTypes,
} from '@react-native-documents/picker';
import RNBlobUtil from 'react-native-blob-util';
import * as XLSX from 'xlsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font } from '../../../../theme/typography';
import { COUNTRIES } from '../../../../constants/countries';
import { useAppSelector } from '../../../../store/hooks';
import {
  bulkImportCompanies,
  createCompany,
  invalidateCompaniesCache,
  searchClientsForShareholder,
  verifyGst,
} from '../api/companyApi';
import ScreenShell from '../components/ScreenShell';
import TopNav from '../components/TopNav';
import FormField from '../components/editCompany/FormField';
import FormSelect from '../components/editCompany/FormSelect';
import { DESIGNATION_OPTIONS } from '../utils/editCompanyForm';

const USA_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
].map(name => ({ label: name, value: name }));

const COMPANY_TYPES_BY_COUNTRY = {
  'united states': ['LLC', 'C-Corp', 'S-Corp', 'Other'],
  usa: ['LLC', 'C-Corp', 'S-Corp', 'Other'],
  us: ['LLC', 'C-Corp', 'S-Corp', 'Other'],
  'united states of america': ['LLC', 'C-Corp', 'S-Corp', 'Other'],
  'united kingdom': ['Private limited company (Ltd)', 'LLP', 'PLC', 'Other'],
  uk: ['Private limited company (Ltd)', 'LLP', 'PLC', 'Other'],
  canada: ['Corporation', 'Other'],
  germany: ['GmbH', 'UG (haftungsbeschränkt)', 'AG', 'Other'],
  netherlands: ['BV', 'NV', 'Other'],
  ireland: ['Private company limited by shares (Ltd)', 'DAC', 'PLC', 'Other'],
  estonia: ['OÜ', 'AS', 'Other'],
  'new zealand': ['Limited company (Ltd)', 'Other'],
};

const GENERIC_COMPANY_TYPES = [
  'Private Limited', 'Public Limited', 'LLP', 'LLC', 'INC',
  'Sole Proprietorship', 'Partnership', 'Other',
];

const COUNTRY_OPTIONS = [
  ...COUNTRIES.map(country => ({ label: country.name, value: country.name })),
  { label: 'Other (enter manually)', value: '__other__' },
];

const OWNERSHIP_TYPE_OPTIONS = [
  { label: 'Individual(s)', value: 'Individual(s)' },
  { label: 'Company', value: 'Company' },
  { label: 'Joint Venture', value: 'Joint Venture' },
];

const REGISTRATION_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'In Review', value: 'in review' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
  { label: 'Closed', value: 'closed' },
];

const CHECKSUM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GSTIN_SHAPE_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const validateGstin = rawGstin => {
  const gstin = String(rawGstin || '').trim().toUpperCase();
  if (!gstin) return { valid: true, reason: '' };
  if (gstin.length !== 15) {
    return { valid: false, reason: 'GSTIN must be exactly 15 characters' };
  }
  if (!GSTIN_SHAPE_REGEX.test(gstin)) {
    return { valid: false, reason: 'GSTIN format is invalid' };
  }
  let factor = 2;
  let sum = 0;
  for (let index = 13; index >= 0; index -= 1) {
    let digit = factor * CHECKSUM_CHARS.indexOf(gstin[index]);
    digit = Math.floor(digit / 36) + (digit % 36);
    sum += digit;
    factor = factor === 2 ? 1 : 2;
  }
  const checkDigit = CHECKSUM_CHARS[(36 - (sum % 36)) % 36];
  if (checkDigit !== gstin[14]) {
    return { valid: false, reason: 'GSTIN check digit does not match' };
  }
  return { valid: true, reason: '' };
};

const isUSA = country =>
  ['usa', 'us', 'united states', 'united states of america'].includes(
    String(country || '').trim().toLowerCase(),
  );

const emptyShareholder = () => ({
  clientId: '',
  clientLabel: '',
  sharePercentage: '',
  designation: 'Shareholder',
});

const EMPTY_FORM = {
  companyName: '',
  countryOption: '',
  otherCountry: '',
  stateOfRegistration: '',
  cityOfRegistration: '',
  usAddress: { street: '', suite: '', city: '', zip: '' },
  companyType: '',
  ownershipType: 'Individual(s)',
  registrationStatus: 'pending',
  companyWebsite: '',
  principalActivity: '',
  companyIntroduction: '',
  registrationDate: '',
  Ein: '',
  gst: '',
  shareholders: [emptyShareholder()],
};

const getClientLabel = client =>
  [client.firstName, client.lastName].filter(Boolean).join(' ') ||
  client.companyName ||
  client.email ||
  'Unnamed Client';

const formatExcelDate = value => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const buildImportCompanies = rows => {
  const errors = [];
  const companyMap = {};

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const companyName = String(row.companyName || '').trim();
    const shareholderEmail = String(row.shareholderEmail || '')
      .trim()
      .toLowerCase();

    if (!companyName) {
      errors.push(`Row ${rowNumber}: companyName is required.`);
      return;
    }
    if (!shareholderEmail) {
      errors.push(`Row ${rowNumber}: shareholderEmail is required.`);
      return;
    }

    const sharePercentage =
      row.sharePercentage === '' || row.sharePercentage === undefined
        ? 0
        : Number(row.sharePercentage);
    if (
      Number.isNaN(sharePercentage) ||
      sharePercentage < 0 ||
      sharePercentage > 100
    ) {
      errors.push(
        `Row ${rowNumber}: sharePercentage must be between 0 and 100.`,
      );
      return;
    }

    if (!companyMap[companyName]) {
      companyMap[companyName] = {
        companyName,
        alternateCompanyName: String(row.alternateCompanyName || '').trim(),
        countryOfIncorporation: String(
          row.countryOfIncorporation || '',
        ).trim(),
        stateOfRegistration: String(row.stateOfRegistration || '').trim(),
        companyType: String(row.companyType || '').trim(),
        ownershipType: String(row.ownershipType || 'Individual(s)').trim(),
        companyWebsite: String(row.companyWebsite || '').trim(),
        principalActivity: String(row.principalActivity || '').trim(),
        companyIntroduction: String(row.companyIntroduction || '').trim(),
        registrationStatus: String(row.registrationStatus || 'pending').trim(),
        registrationDate: formatExcelDate(row.registrationDate),
        shareholders: [],
      };
    }

    companyMap[companyName].shareholders.push({
      email: shareholderEmail,
      sharePercentage,
      designation: String(row.designation || 'Shareholder').trim(),
    });
  });

  const companies = Object.values(companyMap);
  companies.forEach(company => {
    const totalShares = company.shareholders.reduce(
      (total, shareholder) => total + shareholder.sharePercentage,
      0,
    );
    if (totalShares > 0 && Math.abs(totalShares - 100) > 0.01) {
      errors.push(
        `${company.companyName}: total share percentage must equal 100 (currently ${totalShares}).`,
      );
    }
  });

  return { companies, errors };
};

const FormSection = ({ title, icon, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color="#4F46E5" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const ShareholderRow = ({
  shareholder,
  index,
  token,
  canRemove,
  onChange,
  onRemove,
}) => {
  const [query, setQuery] = useState(shareholder.clientLabel || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (shareholder.clientId || query.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const list = await searchClientsForShareholder({
          token,
          query: query.trim(),
        });
        if (!cancelled) {
          setResults(Array.isArray(list) ? list.slice(0, 8) : []);
        }
      } catch (error) {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, shareholder.clientId, token]);

  return (
    <View style={styles.shareholderCard}>
      <View style={styles.shareholderCardHeader}>
        <Text style={styles.shareholderIndex}>Shareholder {index + 1}</Text>
        {canRemove ? (
          <TouchableOpacity onPress={() => onRemove(index)} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.label}>Select Client *</Text>
      <View style={styles.clientSearchBox}>
        <Ionicons name="search-outline" size={16} color="#64748B" />
        <TextInput
          style={styles.clientSearchInput}
          value={query}
          placeholder="Search clients..."
          placeholderTextColor="#94A3B8"
          onChangeText={text => {
            setQuery(text);
            if (shareholder.clientId) {
              onChange(index, 'clientId', '');
              onChange(index, 'clientLabel', '');
            }
          }}
        />
        {searching ? <ActivityIndicator size="small" color="#4F46E5" /> : null}
      </View>
      {results.length > 0 ? (
        <View style={styles.clientResults}>
          {results.map(client => {
            const label = getClientLabel(client);
            return (
              <TouchableOpacity
                key={client._id || client.id}
                style={styles.clientResultItem}
                onPress={() => {
                  onChange(index, 'clientId', client._id || client.id);
                  onChange(index, 'clientLabel', label);
                  setQuery(label);
                  setResults([]);
                }}>
                <Text style={styles.clientResultName}>{label}</Text>
                {client.email ? (
                  <Text style={styles.clientResultEmail}>{client.email}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
      <View style={styles.shareholderRow}>
        <View style={styles.shareholderRowItem}>
          <FormSelect
            label="Designation"
            value={shareholder.designation}
            options={DESIGNATION_OPTIONS}
            onChange={value => onChange(index, 'designation', value)}
          />
        </View>
        <View style={styles.shareholderRowItem}>
          <FormField
            label="Share % (optional)"
            value={shareholder.sharePercentage}
            onChangeText={value => onChange(index, 'sharePercentage', value)}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
      </View>
    </View>
  );
};

const NewCompanyScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [gstResult, setGstResult] = useState(null);
  const [gstChecking, setGstChecking] = useState(false);
  const [importing, setImporting] = useState(false);

  const countryName =
    form.countryOption === '__other__'
      ? form.otherCountry.trim()
      : form.countryOption;
  const usa = isUSA(countryName);
  const india = String(countryName || '').toLowerCase() === 'india';
  const companyTypeOptions = useMemo(() => {
    const types =
      COMPANY_TYPES_BY_COUNTRY[String(countryName || '').trim().toLowerCase()] ||
      GENERIC_COMPANY_TYPES;
    return types.map(type => ({ label: type, value: type }));
  }, [countryName]);
  const stateOptions = useMemo(() => (usa ? USA_STATES : []), [usa]);

  const setField = (name, value) => {
    setForm(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: undefined }));
  };

  const setAddressField = (name, value) => {
    setForm(current => ({
      ...current,
      usAddress: { ...current.usAddress, [name]: value },
    }));
  };

  const handleCountryChange = value => {
    setForm(current => ({
      ...current,
      countryOption: value,
      otherCountry: value === '__other__' ? current.otherCountry : '',
      stateOfRegistration: '',
      cityOfRegistration: '',
      companyType: '',
      gst: '',
    }));
    setGstResult(null);
    setErrors(current => ({
      ...current,
      countryOfIncorporation: undefined,
      gst: undefined,
    }));
  };

  const handleShareholderChange = (index, field, value) => {
    setForm(current => ({
      ...current,
      shareholders: current.shareholders.map((shareholder, itemIndex) =>
        itemIndex === index
          ? { ...shareholder, [field]: value }
          : shareholder,
      ),
    }));
    setErrors(current => ({ ...current, shareholders: undefined }));
  };

  const addShareholder = () => {
    setForm(current => ({
      ...current,
      shareholders: [...current.shareholders, emptyShareholder()],
    }));
  };

  const removeShareholder = index => {
    setForm(current => ({
      ...current,
      shareholders: current.shareholders.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const totalShares = form.shareholders.reduce(
    (total, shareholder) =>
      total + (Number(shareholder.sharePercentage) || 0),
    0,
  );

  const handleVerifyGst = async () => {
    const check = validateGstin(form.gst);
    if (!check.valid) {
      setErrors(current => ({ ...current, gst: check.reason }));
      return;
    }
    setGstChecking(true);
    setGstResult(null);
    try {
      const result = await verifyGst({ token, gst: form.gst.trim().toUpperCase() });
      setGstResult(result?.message || (result?.registered ? 'GST verified' : 'GST not registered'));
    } catch (error) {
      setGstResult(error?.message || 'GST verification failed');
    } finally {
      setGstChecking(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    navigation.goBack();
  };

  const handleSubmit = async () => {
    const shareholders = form.shareholders.filter(item => item.clientId);
    const nextErrors = {};
    if (!form.companyName.trim()) {
      nextErrors.companyName = 'Company name is required.';
    }
    if (!countryName) {
      nextErrors.countryOfIncorporation = 'Country of incorporation is required.';
    }
    if (shareholders.length === 0) {
      nextErrors.shareholders = 'At least one shareholder is required.';
    }
    const withPercentage = shareholders.filter(
      item => item.sharePercentage !== '',
    );
    if (withPercentage.length > 0 && Math.abs(totalShares - 100) > 0.01) {
      nextErrors.shareholders = `Total share percentage must equal 100%. Current total: ${totalShares.toFixed(2)}%`;
    }
    if (india && form.gst.trim()) {
      const check = validateGstin(form.gst);
      if (!check.valid) nextErrors.gst = check.reason;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      companyName: form.companyName.trim(),
      alternateCompanyName: '',
      countryOfIncorporation: countryName,
      stateOfRegistration: form.stateOfRegistration.trim(),
      cityOfRegistration: form.cityOfRegistration.trim(),
      usAddress: {
        street: form.usAddress.street.trim(),
        suite: form.usAddress.suite.trim(),
        city: form.cityOfRegistration.trim() || form.usAddress.city.trim(),
        zip: form.usAddress.zip.trim(),
      },
      companyType: form.companyType,
      ownershipType: form.ownershipType,
      registrationStatus: form.registrationStatus,
      companyWebsite: form.companyWebsite.trim(),
      principalActivity: form.principalActivity.trim(),
      companyIntroduction: form.companyIntroduction.trim(),
      registrationDate: form.registrationDate.trim() || undefined,
      Ein: form.Ein.trim(),
      gst: form.gst.trim(),
      shareholders: shareholders.map(item => ({
        clientId: item.clientId,
        designation: item.designation,
        ...(item.sharePercentage !== ''
          ? { sharePercentage: Number(item.sharePercentage) || 0 }
          : {}),
      })),
    };

    setSaving(true);
    try {
      await createCompany({ token, payload });
      invalidateCompaniesCache();
      Alert.alert('Success', 'Company registered successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Registration failed', error?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImportExcel = async () => {
    if (importing || saving) return;
    setImporting(true);
    try {
      const [file] = await pick({
        type: [pickerTypes.xlsx, pickerTypes.xls],
      });
      if (!file?.uri) return;
      if (!file.name || !/\.(xlsx|xls)$/i.test(file.name)) {
        throw new Error('Please select an .xlsx or .xls file.');
      }

      const [copy] = await keepLocalCopy({
        files: [{ uri: file.uri, fileName: file.name }],
        destination: 'cachesDirectory',
      });
      if (copy.status !== 'success') {
        throw new Error(copy.copyError || 'Unable to read the selected file.');
      }

      const filePath = decodeURIComponent(
        copy.localUri.replace(/^file:\/\//, ''),
      );
      const base64 = await RNBlobUtil.fs.readFile(filePath, 'base64');
      const workbook = XLSX.read(base64, { type: 'base64', cellDates: true });
      const sheetName = workbook.SheetNames?.[0];
      if (!sheetName) {
        throw new Error('No worksheet found in the selected file.');
      }

      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: '',
        raw: false,
      });
      if (!rows.length) {
        throw new Error('The selected file has no data rows.');
      }

      const { companies, errors: importErrors } = buildImportCompanies(rows);
      if (importErrors.length) {
        const preview = importErrors.slice(0, 5).join('\n');
        const extra =
          importErrors.length > 5
            ? `\n...and ${importErrors.length - 5} more.`
            : '';
        Alert.alert('Import validation failed', `${preview}${extra}`);
        return;
      }

      await bulkImportCompanies({ token, companies });
      invalidateCompaniesCache();
      Alert.alert(
        'Import successful',
        `${companies.length} ${
          companies.length === 1 ? 'company' : 'companies'
        } imported.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return;
      }
      Alert.alert(
        'Import failed',
        error?.message || 'Unable to import the selected file.',
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <ScreenShell>
      <TopNav
        navigation={navigation}
        title="Register New Company"
        right={
          <TouchableOpacity
            style={[
              styles.importButton,
              (importing || saving) && styles.importButtonDisabled,
            ]}
            onPress={handleImportExcel}
            disabled={importing || saving}
            accessibilityRole="button">
            {importing ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={16} color="#4F46E5" />
                <Text style={styles.importButtonText}>Import Excel</Text>
              </>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <FormSection title="Company Details" icon="business-outline">
          <FormField
            label="Company Name"
            required
            value={form.companyName}
            onChangeText={value => setField('companyName', value)}
            placeholder="Enter company name"
            error={errors.companyName}
          />
          <FormSelect
            label="Country of Incorporation"
            required
            value={form.countryOption}
            options={COUNTRY_OPTIONS}
            onChange={handleCountryChange}
            placeholder="Select country"
            error={errors.countryOfIncorporation}
          />
          {form.countryOption === '__other__' ? (
            <FormField
              label="Country Name"
              required
              value={form.otherCountry}
              onChangeText={value => setField('otherCountry', value)}
              placeholder="Enter country name"
            />
          ) : null}
          <View style={styles.row}>
            <View style={styles.rowItem}>
              {usa ? (
                <FormSelect
                  label="State of Registration"
                  value={form.stateOfRegistration}
                  options={stateOptions}
                  onChange={value => setField('stateOfRegistration', value)}
                  placeholder="Select state"
                />
              ) : (
                <FormField
                  label="State / Province of Registration"
                  value={form.stateOfRegistration}
                  onChangeText={value => setField('stateOfRegistration', value)}
                  placeholder="State or province"
                />
              )}
            </View>
            <View style={styles.rowItem}>
              <FormField
                label="City of Registration"
                value={form.cityOfRegistration}
                onChangeText={value => setField('cityOfRegistration', value)}
                placeholder="City"
              />
            </View>
          </View>
          <FormField
            label="Street Address"
            value={form.usAddress.street}
            onChangeText={value => setAddressField('street', value)}
            placeholder="123 Main Street"
          />
          <FormField
            label="Suite / Apt / Floor (Optional)"
            value={form.usAddress.suite}
            onChangeText={value => setAddressField('suite', value)}
            placeholder="Suite 200"
          />
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FormField
                label="City (Address)"
                value={form.usAddress.city}
                onChangeText={value => setAddressField('city', value)}
                placeholder="City"
              />
            </View>
            <View style={styles.rowItem}>
              <FormField
                label="ZIP Code"
                value={form.usAddress.zip}
                onChangeText={value => setAddressField('zip', value)}
                placeholder="10001"
                maxLength={10}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FormSelect
                label="Company Type"
                value={form.companyType}
                options={companyTypeOptions}
                onChange={value => setField('companyType', value)}
                placeholder={
                  countryName ? 'Select company type' : 'Select country first'
                }
              />
            </View>
            <View style={styles.rowItem}>
              <FormSelect
                label="Ownership Type"
                value={form.ownershipType}
                options={OWNERSHIP_TYPE_OPTIONS}
                onChange={value => setField('ownershipType', value)}
              />
            </View>
          </View>
          <FormSelect
            label="Registration Status"
            value={form.registrationStatus}
            options={REGISTRATION_STATUS_OPTIONS}
            onChange={value => setField('registrationStatus', value)}
          />
        </FormSection>

        <FormSection title="Business Information" icon="briefcase-outline">
          <FormField
            label="Company Website"
            value={form.companyWebsite}
            onChangeText={value => setField('companyWebsite', value)}
            placeholder="https://www.example.com"
            autoCapitalize="none"
            keyboardType="url"
          />
          <FormField
            label="Principal Business Activity"
            value={form.principalActivity}
            onChangeText={value => setField('principalActivity', value)}
            placeholder="Describe the main business activities"
            multiline
          />
          <FormField
            label="Company Introduction"
            value={form.companyIntroduction}
            onChangeText={value => setField('companyIntroduction', value)}
            placeholder="Brief introduction about the company"
            multiline
          />
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FormField
                label="Incorporation Date"
                value={form.registrationDate}
                onChangeText={value => setField('registrationDate', value)}
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.rowItem}>
              <FormField
                label={usa ? 'EIN' : 'Tax / Company ID'}
                value={form.Ein}
                onChangeText={value => setField('Ein', value)}
                placeholder={usa ? 'Enter EIN' : 'Enter Tax/Company ID'}
                autoCapitalize="none"
              />
            </View>
          </View>
          {india ? (
            <View style={styles.gstField}>
              <Text style={styles.label}>GST Number (optional)</Text>
              <View style={styles.gstRow}>
                <TextInput
                  style={styles.gstInput}
                  value={form.gst}
                  onChangeText={value => {
                    setField('gst', value.toUpperCase());
                    setGstResult(null);
                  }}
                  placeholder="27AAPFU0939F1ZV"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  maxLength={15}
                />
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={handleVerifyGst}
                  disabled={gstChecking || !form.gst.trim()}>
                  {gstChecking ? (
                    <ActivityIndicator size="small" color="#4F46E5" />
                  ) : (
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  )}
                </TouchableOpacity>
              </View>
              {errors.gst ? (
                <Text style={styles.errorText}>{errors.gst}</Text>
              ) : gstResult ? (
                <Text style={styles.helperText}>{gstResult}</Text>
              ) : null}
            </View>
          ) : null}
        </FormSection>

        <FormSection title="Shareholders & Directors" icon="people-outline">
          <View style={styles.shareholderHeader}>
            <Text style={styles.helperText}>
              {form.shareholders.length} added
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={addShareholder}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Shareholder</Text>
            </TouchableOpacity>
          </View>
          {errors.shareholders ? (
            <Text style={styles.errorText}>{errors.shareholders}</Text>
          ) : null}
          {form.shareholders.map((shareholder, index) => (
            <ShareholderRow
              key={index}
              shareholder={shareholder}
              index={index}
              token={token}
              canRemove={form.shareholders.length > 1}
              onChange={handleShareholderChange}
              onRemove={removeShareholder}
            />
          ))}
          {totalShares > 0 ? (
            <View style={styles.totalBox}>
              <Text style={styles.helperText}>Total Share Percentage</Text>
              <Text
                style={[
                  styles.totalValue,
                  Math.abs(totalShares - 100) > 0.01 &&
                    styles.totalValueWarning,
                ]}>
                {totalShares.toFixed(2)}%
              </Text>
            </View>
          ) : null}
        </FormSection>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleClose}
          disabled={saving}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={saving}
          accessibilityRole="button">
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Register Company</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    marginLeft: 8,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonText: {
    color: '#4F46E5',
    fontSize: font.small,
    fontWeight: '700',
    marginLeft: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#EEF2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: font.base,
    fontWeight: '700',
    marginLeft: 8,
  },
  sectionBody: {
    padding: 14,
  },
  row: {
    flexDirection: 'row',
  },
  rowItem: {
    flex: 1,
  },
  label: {
    color: '#334155',
    fontSize: font.small,
    fontWeight: '600',
    marginBottom: 6,
  },
  helperText: {
    color: '#64748B',
    fontSize: font.small,
  },
  errorText: {
    color: '#DC2626',
    fontSize: font.small,
    marginTop: 4,
  },
  gstField: {
    marginTop: 8,
  },
  gstRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gstInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#0F172A',
    fontSize: font.bodySmall,
  },
  verifyButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    marginLeft: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#4F46E5',
    fontSize: font.small,
    fontWeight: '600',
  },
  shareholderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: font.small,
    fontWeight: '600',
    marginLeft: 4,
  },
  shareholderCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    padding: 12,
    marginBottom: 10,
  },
  shareholderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shareholderIndex: {
    color: '#334155',
    fontSize: font.bodySmall,
    fontWeight: '700',
  },
  clientSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  clientSearchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: font.bodySmall,
    marginLeft: 8,
  },
  clientResults: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  clientResultItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  clientResultName: {
    color: '#0F172A',
    fontSize: font.bodySmall,
    fontWeight: '600',
  },
  clientResultEmail: {
    color: '#64748B',
    fontSize: font.caption,
    marginTop: 2,
  },
  shareholderRow: {
    flexDirection: 'row',
  },
  shareholderRowItem: {
    flex: 1,
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    marginTop: 4,
  },
  totalValue: {
    color: '#059669',
    fontSize: font.base,
    fontWeight: '700',
  },
  totalValueWarning: {
    color: '#D97706',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#334155',
    fontSize: font.bodySmall,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: font.bodySmall,
    fontWeight: '700',
  },
});

export default NewCompanyScreen;
