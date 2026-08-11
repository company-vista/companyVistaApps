import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { BackButton, ContinueButton } from '../../../../components/buttons';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setBusinessInfo } from '../../../../store/slices/companyRegistrationSlice';
export default function BusinessFormScreen({ onBackPress, onContinue }) {
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const dispatch = useAppDispatch();
    const reg = useAppSelector(state => state.companyRegistration);
    const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;
    const [website, setWebsite] = useState(reg.website);
    const [establishReason, setEstablishReason] = useState(reg.establishReason !== '-- Select --' ? reg.establishReason : '-- Select --');
    const [showReasonDropdown, setShowReasonDropdown] = useState(false);
    const [principalActivity, setPrincipalActivity] = useState(reg.principalActivity !== '-- Select --' ? reg.principalActivity : '-- Select --');
    const [showActivityDropdown, setShowActivityDropdown] = useState(false);
    const [briefIntroduction, setBriefIntroduction] = useState(reg.briefIntroduction);
    const [additionalInfo, setAdditionalInfo] = useState(reg.additionalInfo);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
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
    return (<View style={styles.screen}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress}/>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Business</Text>
      </View>

      <View style={styles.body}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>
            Tell us about your <Text style={styles.titleAccent}>business</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Provide the details of your business operations.
          </Text>

          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Website</Text>
          <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput placeholder="https://" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.text }]} value={website} onChangeText={setWebsite} keyboardType="url" autoCapitalize="none"/>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Reason for establishing the company <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity style={[styles.dropdown, { backgroundColor: inputBg, borderColor: colors.inputBorder }]} onPress={() => setShowReasonDropdown(!showReasonDropdown)} activeOpacity={0.8}>
            <Text style={[styles.dropdownText, { color: colors.text }]}>{establishReason}</Text>
            <Text style={[styles.dropdownArrow, { color: colors.subtle }]}>
              {showReasonDropdown ? '\u25B2' : '\u25BC'}
            </Text>
          </TouchableOpacity>

          {showReasonDropdown && (<View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {reasonOptions.map((option) => (<TouchableOpacity key={option} style={[
                    styles.dropdownItem,
                    establishReason === option && { backgroundColor: colors.surfaceAlt },
                ]} onPress={() => {
                    setEstablishReason(option);
                    setShowReasonDropdown(false);
                }} activeOpacity={0.7}>
                  <Text style={[
                    styles.dropdownItemText,
                    { color: colors.text },
                    establishReason === option && { color: '#e6a82a' },
                ]}>
                    {option}
                  </Text>
                </TouchableOpacity>))}
            </View>)}

          {attemptedSubmit && establishReason === '-- Select --' && (<Text style={{ fontSize: 13, color: colors.danger, marginBottom: 4 }}>
              Please select a reason for establishing the company.
            </Text>)}

          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Principal business activity <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity style={[styles.dropdown, { backgroundColor: inputBg, borderColor: colors.inputBorder }]} onPress={() => setShowActivityDropdown(!showActivityDropdown)} activeOpacity={0.5}>
            <Text style={[styles.dropdownText, { color: colors.text }]}>{principalActivity}</Text>
            <Text style={[styles.dropdownArrow, { color: colors.subtle }]}>
              {showActivityDropdown ? '\u25B2' : '\u25BC'}
            </Text>
          </TouchableOpacity>

          {showActivityDropdown && (<View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {activityOptions.map((option) => (<TouchableOpacity key={option} style={[
                    styles.dropdownItem,
                    principalActivity === option && { backgroundColor: colors.surfaceAlt },
                ]} onPress={() => {
                    setPrincipalActivity(option);
                    setShowActivityDropdown(false);
                }} activeOpacity={0.7}>
                  <Text style={[
                    styles.dropdownItemText,
                    { color: colors.text },
                    principalActivity === option && { color: '#e6a82a' },
                ]}>
                    {option}
                  </Text>
                </TouchableOpacity>))}
            </View>)}

          {attemptedSubmit && principalActivity === '-- Select --' && (<Text style={{ fontSize: 13, color: colors.danger, marginBottom: 4 }}>
              Please select a principal business activity.
            </Text>)}

          <Text style={[styles.fieldLabel, { color: colors.muted, marginTop: 16 }]}>
            Brief introduction about the company, proposed activities and business plan <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.textAreaWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput placeholder="Describe your company, its proposed activities and business plan..." placeholderTextColor={colors.inputPlaceholder} style={[styles.textArea, { color: colors.text }]} value={briefIntroduction} onChangeText={setBriefIntroduction} multiline numberOfLines={5} textAlignVertical="top"/>
          </View>

          {attemptedSubmit && !briefIntroduction.trim() && (<Text style={{ fontSize: 13, color: colors.danger, marginBottom: 4 }}>
              Please provide a brief introduction about the company.
            </Text>)}

          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Additional information / message to us</Text>
          <View style={[styles.textAreaWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput placeholder="Any additional information or message..." placeholderTextColor={colors.inputPlaceholder} style={[styles.textArea, { color: colors.text }]} value={additionalInfo} onChangeText={setAdditionalInfo} multiline numberOfLines={4} textAlignVertical="top"/>
          </View>
        </ScrollView>

        <View style={[styles.footerColumn, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <ContinueButton onPress={() => {
            setAttemptedSubmit(true);
            if (establishReason !== '-- Select --' && principalActivity !== '-- Select --' && briefIntroduction.trim()) {
                dispatch(setBusinessInfo({ website, establishReason, principalActivity, briefIntroduction, additionalInfo }));
                onContinue();
            }
        }}/>
        </View>
      </View>
    </View>);
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
        flex: 1,
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
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: font.sm,
        letterSpacing: 0.3,
        marginBottom: 6,
        marginTop: 12,
        marginLeft: 6,
        fontWeight: 600
    },
    required: {
        color: '#e6a82a',
    },
    inputWrapper: {
        borderWidth: 0.3,
        borderRadius: 12,
        paddingHorizontal: 10,
        marginBottom: 4,
    },
    input: {
        fontSize: font.base,
        paddingVertical: 16,
    },
    textAreaWrapper: {
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 12,
    },
    textArea: {
        fontSize: font.base,
        paddingVertical: 10,
        minHeight: 80,
    },
    hintText: {
        fontSize: font.xs,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 0.3,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        marginBottom: 4,
    },
    dropdownText: {
        fontSize: font.base,
    },
    dropdownArrow: {
        fontSize: font.sm,
    },
    dropdownList: {
        borderWidth: 0.3,
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    dropdownItemText: {
        fontSize: font.base,
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
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: font.base,
        fontWeight: '500',
        color: '#1a1204',
    },
});
