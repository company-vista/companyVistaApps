import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { BackButton, ContinueButton } from '../../../../components/buttons';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { resetCompanyRegistration, setApplicantInfo } from '../../../../store/slices/companyRegistrationSlice';
import { submitCompanyRegistration, updateCompanyRegistration } from '../../api/companyRegistrationApi';
export default function ReviewSubmitScreen({ onBackPress, onSubmit, onEditApplicant, onEditJurisdiction, onEditCompanyName, onEditOwnership, onEditAddress, onEditDirectors, onEditBusinessActivity, companyId }) {
    const handleEditJurisdiction = onEditJurisdiction ?? onEditCompanyName;
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const dispatch = useAppDispatch();
    const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;
    const isEditing = Boolean(companyId);
    const [isChecked, setIsChecked] = useState(false);
    const [signature, setSignature] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const reg = useAppSelector(state => state.companyRegistration);
    const token = useAppSelector(state => state.auth.token);
    const user = useAppSelector(state => state.auth.user);
    const today = new Date();
    const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    const nameParts = (user?.name ?? '').split(' ');
    const userFirstName = user?.firstName ?? nameParts[0] ?? '';
    const userLastName = user?.lastName ?? nameParts.slice(1).join(' ') ?? '';
    const [firstName, setFirstName] = useState(reg.firstName || userFirstName);
    const [lastName, setLastName] = useState(reg.lastName || userLastName);
    const [email, setEmail] = useState(reg.email || user?.email || '');
    const [phone, setPhone] = useState(reg.phone || user?.phone || user?.phoneNumber || user?.mobile || '');
    const [companyNameVal, setCompanyNameVal] = useState(reg.companyName || '');
    const [alternateNameVal, setAlternateNameVal] = useState(reg.alternateName || '');
    const [countryName, setCountryName] = useState(reg.jurisdictionName || reg.jurisdiction || '');
    const [stateName, setStateName] = useState(reg.stateOfIncorporation && reg.stateOfIncorporation !== '-- Select --' ? reg.stateOfIncorporation : '');
    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !companyNameVal.trim() || !countryName.trim() || !stateName.trim()) {
            Toast.show({ type: 'error', text1: 'All fields required', text2: 'Please fill all fields including country and state' });
            return;
        }
        dispatch(setApplicantInfo({ applicantType: reg.applicantType || 'owner', firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim() }));
        setIsSubmitting(true);
        const payload = {
            applicantType: reg.applicantType || 'owner',
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            companyName: companyNameVal.trim(),
            countryOfIncorporation: countryName.trim(),
            jurisdictionName: countryName.trim(),
            stateOfRegistration: stateName.trim(),
            companyType: reg.entityType,
            alternateCompanyName: alternateNameVal.trim() || reg.alternateName,
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
        if (!token) {
            Toast.show({ type: 'error', text1: 'Session expired', text2: 'Please login again' });
            setIsSubmitting(false);
            return;
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
            }
            else {
                Toast.show({ type: 'error', text1: 'Submission failed', text2: result.error });
            }
        }
        catch (error) {
            console.log('Company registration error:', error?.response?.data ?? error?.message ?? error);
            Toast.show({ type: 'error', text1: 'Something went wrong', text2: error?.response?.data?.message || error?.message || 'Please try again.' });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<View style={styles.screen}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress}/>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Review & <Text style={styles.titleAccent}>{isEditing ? 'update' : 'submit'}</Text></Text>
      </View>

      <View style={styles.body}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Please fill your applicant details to continue.
          </Text>

          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: '#e6a82a', marginBottom: 12 }]}>Applicant</Text>
            <View style={{ marginBottom: 14 }}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Full Name <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput style={[styles.input, { color: colors.text }]} value={`${firstName} ${lastName}`.trim()} onChangeText={(val) => { const parts = val.trim().split(/\s+/); setFirstName(parts[0] || ''); setLastName(parts.slice(1).join(' ') || ''); }} placeholder="Enter full name" placeholderTextColor={colors.inputPlaceholder} />
              </View>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Email <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput style={[styles.input, { color: colors.text }]} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.inputPlaceholder} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Phone Number <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput style={[styles.input, { color: colors.text }]} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={colors.inputPlaceholder} keyboardType="phone-pad" />
              </View>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Company Name <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput style={[styles.input, { color: colors.text }]} value={companyNameVal} onChangeText={setCompanyNameVal} placeholder="Enter company name" placeholderTextColor={colors.inputPlaceholder} />
              </View>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Alternate Name</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput style={[styles.input, { color: colors.text }]} value={alternateNameVal} onChangeText={setAlternateNameVal} placeholder="Enter alternate name (optional)" placeholderTextColor={colors.inputPlaceholder} />
              </View>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Country Name <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput style={[styles.input, { color: colors.text }]} value={countryName} onChangeText={setCountryName} placeholder="Enter country name" placeholderTextColor={colors.inputPlaceholder} />
              </View>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>State Name <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput style={[styles.input, { color: colors.text }]} value={stateName} onChangeText={setStateName} placeholder="Enter state name" placeholderTextColor={colors.inputPlaceholder} />
              </View>
            </View>
          </View>

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

          <TouchableOpacity style={styles.checkboxContainer} activeOpacity={0.8} onPress={() => setIsChecked(!isChecked)}>
            <View style={[styles.checkbox, { borderColor: colors.subtle }, isChecked && { backgroundColor: '#e6a82a', borderColor: '#e6a82a' }]}>
              {isChecked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              I agree to the terms and confirm all details are accurate.
            </Text>
          </TouchableOpacity>

          <View style={styles.inputsRow}>
            <View style={[styles.formGroup, { flex: 1.2, marginRight: 12 }]}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Signature <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: !signature ? '#ef4444' : colors.inputBorder }]}>
                <TextInput placeholder="Type your full name" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.text }]} value={signature} onChangeText={setSignature}/>
              </View>
              {!signature && <Text style={styles.errorText}>Required.</Text>}
            </View>

            <View style={[styles.formGroup, { flex: 0.8 }]}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Date <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput style={[styles.input, { color: colors.text }]} value={dateStr} editable={false}/>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footerColumn, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <ContinueButton label={isEditing ? 'Update Registration' : 'Submit Registration'} onPress={handleSubmit} disabled={!isChecked || !signature} loading={isSubmitting}/>
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
        paddingBottom: 8,
        gap: 10,
        borderBottomWidth: 1,
    },
    headerTitle: {
        flex: 1,
        fontSize: font.heading,
        fontWeight: '600',
    },
    body: {
        flex: 1,
        padding: 10,
        paddingBottom: 6,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 4,
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
        marginBottom: 10,
    },
    sectionCard: {
        borderWidth: 0.5,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
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
        padding: 10,
        marginBottom: 10,
    },
    declarationTitle: {
        fontSize: font.md,
        fontWeight: '700',
        marginBottom: 6,
    },
    declarationItem: {
        flexDirection: 'row',
        marginBottom: 6,
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
        marginBottom: 10,
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
        marginBottom: 4,
    },
    formGroup: {
        justifyContent: 'flex-start',
    },
    inputLabel: {
        fontSize: font.xs,
        fontWeight: '600',
        marginBottom: 4,
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
