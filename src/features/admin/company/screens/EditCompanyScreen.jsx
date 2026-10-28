import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import {
  fetchCompanyById,
  invalidateCompaniesCache,
  updateCompany,
} from '../api/companyApi';
import ScreenShell from '../components/ScreenShell';
import TopNav from '../components/TopNav';
import {
  STEP_TITLES,
  buildEditForm,
  buildUpdatePayload,
  createEmptyShareholder,
} from '../utils/editCompanyForm';
import {
  editColors,
  screenStyles,
} from '../components/editCompany/editCompanyStyles';
import StepIndicator from '../components/editCompany/StepIndicator';
import CompanyDetailsStep from '../components/editCompany/CompanyDetailsStep';
import BusinessInfoStep from '../components/editCompany/BusinessInfoStep';
import ShareholdersStep from '../components/editCompany/ShareholdersStep';

const TOTAL_STEPS = STEP_TITLES.length;

const EditCompanyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);

  const initialCompany = route?.params?.company || null;
  const companyId =
    route?.params?.companyId ||
    initialCompany?._id ||
    initialCompany?.id ||
    null;

  const [company, setCompany] = useState(initialCompany);
  const [form, setForm] = useState(() => buildEditForm(initialCompany));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!initialCompany);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!companyId) {
        setError('Company id missing.');
        setLoading(false);
        return;
      }
      if (!silent) {
        setLoading(true);
      }
      try {
        const data = await fetchCompanyById({ companyId });
        setCompany(data);
        setForm(buildEditForm(data));
        setErrors({});
        setError('');
      } catch (err) {
        setError(err?.message || 'Failed to load company. Please try again.');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [companyId],
  );

  useEffect(() => {
    load({ silent: Boolean(initialCompany) });
  }, [initialCompany, load]);

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(buildEditForm(company)),
    [company, form],
  );

  const handleChange = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const updateShareholder = useCallback((id, field, value) => {
    setForm(prev => ({
      ...prev,
      shareholders: prev.shareholders.map(shareholder =>
        shareholder.id === id ? { ...shareholder, [field]: value } : shareholder,
      ),
    }));
  }, []);

  const addShareholder = useCallback(() => {
    setForm(prev => ({
      ...prev,
      shareholders: [...prev.shareholders, createEmptyShareholder()],
    }));
  }, []);

  const removeShareholder = useCallback(id => {
    Alert.alert(
      'Remove member',
      'This will remove the shareholder from the company.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            setForm(prev => ({
              ...prev,
              shareholders: prev.shareholders.filter(
                shareholder => shareholder.id !== id,
              ),
            })),
        },
      ],
    );
  }, []);

  const validateDetailsStep = useCallback(() => {
    const nextErrors = {};
    if (!form.companyName.trim()) {
      nextErrors.companyName = 'Company name is required.';
    }
    if (!form.countryOfIncorporation.trim()) {
      nextErrors.countryOfIncorporation = 'Country is required.';
    }
    if (!form.stateOfRegistration.trim()) {
      nextErrors.stateOfRegistration = 'State is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  const handleNext = () => {
    if (step === 0 && !validateDetailsStep()) {
      return;
    }
    setStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
  };

  const handleBack = () => {
    setErrors({});
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handleSave = async () => {
    if (!validateDetailsStep()) {
      setStep(0);
      return;
    }
    if (!companyId) {
      Alert.alert('Missing company', 'Company id is not available.');
      return;
    }
    if (!token) {
      Alert.alert('Session expired', 'Please login again.');
      return;
    }

    setSaving(true);
    try {
      const payload = buildUpdatePayload(form, company);
      await updateCompany({ token, companyId, payload });
      invalidateCompaniesCache();
      Alert.alert('Saved', 'Company details updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Update failed', err?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenShell>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
          translucent
        />
        <TopNav navigation={navigation} title="Edit Company" />
        <View style={screenStyles.loadingBox}>
          <ActivityIndicator size="large" color={editColors.primary} />
          <Text style={screenStyles.loadingText}>Loading company...</Text>
        </View>
      </ScreenShell>
    );
  }

  if (!company) {
    return (
      <ScreenShell>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
          translucent
        />
        <TopNav navigation={navigation} title="Edit Company" />
        <View style={screenStyles.loadingBox}>
          <View style={screenStyles.errorBox}>
            <Text style={screenStyles.errorTitle}>Unable to load company</Text>
            <Text style={screenStyles.errorText}>
              {error || 'Company not found.'}
            </Text>
            <TouchableOpacity
              style={screenStyles.retryButton}
              onPress={() => load()}
              accessibilityRole="button">
              <Text style={screenStyles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenShell>
    );
  }

  const isLastStep = step === TOTAL_STEPS - 1;
  const bottomBarStyle = [
    screenStyles.bottomBar,
    { paddingBottom: 12 + insets.bottom },
  ];

  return (
    <ScreenShell>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent
      />
      <TopNav navigation={navigation} title="Edit Company" />
      <View style={screenStyles.container}>
        <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
        <KeyboardAvoidingView
          style={screenStyles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={screenStyles.flex}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={screenStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {error ? (
              <View style={screenStyles.warningBanner}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={editColors.warning}
                />
                <Text style={screenStyles.warningText}>{error}</Text>
              </View>
            ) : null}
            {step === 0 ? (
              <CompanyDetailsStep
                form={form}
                errors={errors}
                onChange={handleChange}
              />
            ) : null}
            {step === 1 ? (
              <BusinessInfoStep
                form={form}
                errors={errors}
                onChange={handleChange}
              />
            ) : null}
            {step === 2 ? (
              <ShareholdersStep
                shareholders={form.shareholders}
                onAdd={addShareholder}
                onRemove={removeShareholder}
                onUpdate={updateShareholder}
              />
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
        <View style={bottomBarStyle}>
          <View style={screenStyles.bottomRow}>
            {step > 0 ? (
              <TouchableOpacity
                style={screenStyles.backButton}
                onPress={handleBack}
                activeOpacity={0.8}
                accessibilityRole="button">
                <View style={screenStyles.backIconCircle}>
                  <Ionicons
                    name="arrow-back"
                    size={16}
                    color={editColors.text}
                  />
                </View>
                <Text style={screenStyles.backButtonText}>Back</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[
                screenStyles.primaryButton,
                saving && screenStyles.primaryButtonDisabled,
              ]}
              onPress={isLastStep ? handleSave : handleNext}
              disabled={saving}
              activeOpacity={0.85}
              accessibilityRole="button">
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={screenStyles.primaryButtonText}>
                    {isLastStep ? 'Save Changes' : 'Continue'}
                  </Text>
                  <Ionicons
                    name={isLastStep ? 'checkmark-circle-outline' : 'arrow-forward'}
                    size={18}
                    color="#ffffff"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
          <Text style={screenStyles.bottomHint}>
            {isLastStep
              ? hasChanges
                ? 'Review all steps before saving your changes.'
                : 'No changes yet — you can still save to confirm details.'
              : 'You can move between steps at any time.'}
          </Text>
        </View>
      </View>
    </ScreenShell>
  );
};

export default EditCompanyScreen;
