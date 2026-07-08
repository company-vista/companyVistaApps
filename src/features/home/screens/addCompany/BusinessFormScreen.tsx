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
import { useThemeColors } from '../../../../theme/colors';
import { BackButton } from '../../../../components/buttons';

type BusinessFormScreenProps = {
  onBackPress: () => void;
  onContinue: () => void;
};

export default function BusinessFormScreen({ onBackPress, onContinue }: BusinessFormScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;

  const [website, setWebsite] = useState('');
  const [establishReason, setEstablishReason] = useState('-- Select --');
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [principalActivity, setPrincipalActivity] = useState('-- Select --');
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [briefIntroduction, setBriefIntroduction] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const reasonOptions = [
    '-- Select --',
    'Started a new business',
    'Expanding an existing business internationally',
    'Holding company / asset protection',
    'Investment vehicle',
    'Real estate ownership',
    'Intellectual property holding',
    'Changing type of organization',
    'Purchased an existing/going business',
    'Created a trust',
    'Estate planning',
    'Freelance / consulting work',
    'Other',
  ];

  const activityOptions = [
    '-- Select --',
    'Retail & Wholesale',
    'Professional Services',
    'Construction',
    'Transportation & Logistics',
    'Healthcare',
    'Education',
    'Hospitality & Tourism',
    'Agriculture',
    'Energy & Utilities',
    'Other',
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Business</Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Tell us about your <Text style={styles.titleAccent}>business</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Provide the details of your business operations.
          </Text>

          <Text style={[styles.fieldLabel, { color: colors.muted }]}>WEBSITE</Text>
          <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              placeholder="https://"
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.input, { color: colors.text }]}
              value={website}
              onChangeText={setWebsite}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.muted }]}>REASON FOR ESTABLISHING THE COMPANY <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}
            onPress={() => setShowReasonDropdown(!showReasonDropdown)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>{establishReason}</Text>
            <Text style={[styles.dropdownArrow, { color: colors.subtle }]}>
              {showReasonDropdown ? '\u25B2' : '\u25BC'}
            </Text>
          </TouchableOpacity>

          {showReasonDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {reasonOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownItem,
                    establishReason === option && { backgroundColor: colors.surfaceAlt },
                  ]}
                  onPress={() => {
                    setEstablishReason(option);
                    setShowReasonDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: colors.text },
                      establishReason === option && { color: '#e6a82a' },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.fieldLabel, { color: colors.muted }]}>PRINCIPAL BUSINESS ACTIVITY <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}
            onPress={() => setShowActivityDropdown(!showActivityDropdown)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>{principalActivity}</Text>
            <Text style={[styles.dropdownArrow, { color: colors.subtle }]}>
              {showActivityDropdown ? '\u25B2' : '\u25BC'}
            </Text>
          </TouchableOpacity>

          {showActivityDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {activityOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownItem,
                    principalActivity === option && { backgroundColor: colors.surfaceAlt },
                  ]}
                  onPress={() => {
                    setPrincipalActivity(option);
                    setShowActivityDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: colors.text },
                      principalActivity === option && { color: '#e6a82a' },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.fieldLabel, { color: colors.muted, marginTop: 16 }]}>
            BRIEF INTRODUCTION ABOUT THE COMPANY, PROPOSED ACTIVITIES AND BUSINESS PLAN <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.textAreaWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              placeholder="Describe your company, its proposed activities and business plan..."
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.textArea, { color: colors.text }]}
              value={briefIntroduction}
              onChangeText={setBriefIntroduction}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.muted }]}>ADDITIONAL INFORMATION / MESSAGE TO US</Text>
          <View style={[styles.textAreaWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              placeholder="Any additional information or message..."
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.textArea, { color: colors.text }]}
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 6,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
    marginBottom: 4,
  },
  titleAccent: {
    color: '#e6a82a',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
    marginBottom: 6,
    marginTop: 12,
    marginLeft: 6
  },
  required: {
    color: '#e6a82a',
  },
  inputWrapper: {
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  input: {
    fontSize: 12,
    paddingVertical: 16,
  },
  textAreaWrapper: {
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  textArea: {
    fontSize: 12,
    paddingVertical: 10,
    minHeight: 80,
  },
  hintText: {
    fontSize: 9,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 4,
  },
  dropdownText: {
    fontSize: 12,
  },
  dropdownArrow: {
    fontSize: 10,
  },
  dropdownList: {
    borderWidth: 0.5,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  halfInput: {
    flex: 1,
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
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1204',
  },
});
