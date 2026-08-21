import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import axios from 'axios'; // Ensure axios is installed
import { BackButton } from '../../../../components/buttons';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { API_BASE_URL } from '../../../../config/api';
import { useAppSelector } from '../../../../store/hooks';
import Toast from 'react-native-toast-message';
// ─── Constants ───────────────────────────────────────────────────────────────
const FIELDS = [
    { key: 'name', label: 'Company name', shortLabel: 'Company name' },
    { key: 'web', label: 'Company website', shortLabel: 'Website' },
    { key: 'act', label: 'Principal activity', shortLabel: 'Activity' },
    { key: 'intro', label: 'Company introduction', shortLabel: 'Introduction' },
    { key: 'sh', label: 'Shareholders / Directors', shortLabel: 'Holders' },
    { key: 'addr', label: 'Local address', shortLabel: 'Address' },
    { key: 'rep', label: 'Local representative', shortLabel: 'Representative' },
];
const INITIAL_SHAREHOLDER = {
    firstName: '',
    lastName: '',
    designation: '',
    phone: '',
    dob: '',
    sharePercent: '',
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
};
const INITIAL_FORM = {
    name: '',
    alt: '',
    reg: '',
    web: '',
    act: '',
    intro: '',
    addr: '',
    rep: '',
    message: '',
    sh: { ...INITIAL_SHAREHOLDER },
};
const Chip = ({ field, selected, onPress, colors }) => {
    const s = styles(colors);
    return (<TouchableOpacity style={[s.chip, selected && s.chipSelected]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[
            s.chipText,
            selected && s.chipTextSelected,
            { textAlign: 'center' },
        ]} numberOfLines={1}>
        {field.shortLabel}
        {selected ? '  ✓' : ''}
      </Text>
    </TouchableOpacity>);
};
const FormField = ({ label, value, placeholder, onChangeText, multiline = false, keyboardType = 'default', colors, }) => {
    const s = styles(colors);
    return (<View style={s.fieldBlock}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput style={[s.fieldInput, multiline && s.fieldInputMulti]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} multiline={multiline} numberOfLines={multiline ? 3 : 1} keyboardType={keyboardType} autoCapitalize="none"/>
    </View>);
};
const BasicInfoScreen = ({ onBackPress, companyId, clientId, urgency, selectedCategory }) => {
    const colors = useThemeColors();
    const token = useAppSelector(state => state.auth.token);
    const CATEGORY_FIELDS = {
        'Company info': ['name', 'web', 'act', 'intro'],
        'Shareholder/Director': ['sh'],
        'Local address': ['addr'],
        'Local Rep.': ['rep'],
    };
    const initialFields = selectedCategory ? CATEGORY_FIELDS[selectedCategory] : undefined;
    const [selected, setSelected] = useState(() => initialFields ? new Set(initialFields) : new Set());
    const [formValues, setFormValues] = useState(INITIAL_FORM);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const totalCount = FIELDS.length;
    const selectedCount = selected.size;
    const allSelected = selectedCount === totalCount;
    useEffect(() => {
        const fields = selectedCategory ? CATEGORY_FIELDS[selectedCategory] : undefined;
        if (fields) {
            setSelected(new Set(fields));
        }
    }, [selectedCategory]);
    const toggleField = (key) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };
    const toggleAll = () => {
        if (allSelected) {
            setSelected(new Set());
        }
        else {
            setSelected(new Set(FIELDS.map(f => f.key)));
        }
    };
    const setField = (key, value) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
    };
    const setShField = (key, value) => {
        setFormValues(prev => ({
            ...prev,
            sh: { ...prev.sh, [key]: value },
        }));
    };
    // Integrated and customized handleSubmit function
    const handleSubmit = async () => {
        // 1. Validation check for selected fields
        if (selected.size === 0) {
            Toast.show({ type: 'error', text1: `Please select at least one field to update${selectedCategory ? ` for ${selectedCategory}` : ''}.` });
            return;
        }
        // Required field validation
        const fieldsArray = Array.from(selected);
        const missing = [];
        for (const key of fieldsArray) {
            if (key === 'sh') {
                const sh = formValues.sh;
                const shMissing = [];
                if (!sh.firstName.trim())
                    shMissing.push('First name');
                if (!sh.lastName.trim())
                    shMissing.push('Last name');
                if (!sh.designation.trim())
                    shMissing.push('Designation');
                if (!sh.phone.trim())
                    shMissing.push('Phone');
                if (!sh.sharePercent.trim())
                    shMissing.push('Share %');
                if (!sh.address1.trim())
                    shMissing.push('Address line 1');
                if (!sh.city.trim())
                    shMissing.push('City');
                if (!sh.state.trim())
                    shMissing.push('State');
                if (!sh.postalCode.trim())
                    shMissing.push('Postal code');
                if (!sh.country.trim())
                    shMissing.push('Country');
                if (shMissing.length)
                    missing.push(`Shareholder/Director: ${shMissing.join(', ')}`);
            }
            else if (!formValues[key]?.toString().trim()) {
                const label = FIELDS.find(f => f.key === key)?.label || key;
                missing.push(label);
            }
        }
        if (missing.length) {
            Toast.show({ type: 'error', text1: `Please fill in required fields: ${missing.join('; ')}` });
            setSubmitting(false);
            return;
        }
        try {
            setSubmitting(true);
            await axios.post(`${API_BASE_URL}/api/change-requests`, {
                companyId,
                clientId,
                urgency,
                selectedCategory,
                type: selectedCategory,
                fields: fieldsArray,
                requestedChanges: formValues,
                shareholderData: selected.has('sh') ? formValues.sh : undefined,
                message: formValues.message,
            }, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                    'Content-Type': 'application/json',
                },
            });
            Toast.show({ type: 'success', text1: 'Request submitted successfully' });
            // Reset state on successful submission
            setFormValues(INITIAL_FORM);
            setSelected(new Set());
            setSubmitted(true);
        }
        catch (err) {
            Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to submit your request.' });
        }
        finally {
            setSubmitting(false);
        }
    };
    if (submitted) {
        return (<SafeAreaView style={styles(colors).safe}>
        <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.mode === 'dark' ? colors.background : '#fff'}/>
        <View style={styles(colors).successContainer}>
          <Text style={styles(colors).successIcon}>✓</Text>
          <Text style={styles(colors).successTitle}>Update submitted</Text>
          <Text style={styles(colors).successSub}>
            Your change request has been sent to the admin team.
          </Text>
          <TouchableOpacity style={styles(colors).successBtn} onPress={() => {
                setSubmitted(false);
                onBackPress?.();
            }}>
            <Text style={styles(colors).successBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>);
    }
    return (<SafeAreaView style={styles(colors).safe}>
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.mode === 'dark' ? colors.background : '#fff'}/>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header - fixed at top */}
        <View style={styles(colors).header}>
          <View style={styles(colors).headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <BackButton onPress={onBackPress}/>
              <Text style={styles(colors).headerTitle} numberOfLines={1}>
                {selectedCategory ? `Update ${selectedCategory}` : 'Select fields to update'}
              </Text>
            </View>
            {!selectedCategory && (<TouchableOpacity onPress={toggleAll}>
                <Text style={styles(colors).selectAllBtn}>
                  {allSelected ? 'Deselect all' : 'Select all'}
                </Text>
              </TouchableOpacity>)}
          </View>
        </View>
        <ScrollView style={styles(colors).scroll} contentContainerStyle={styles(colors).scrollContent} keyboardShouldPersistTaps="handled">

          {/* 3-Column Buttons Layout - only show when no category pre-selected */}
          {!selectedCategory && (<>
              <View style={styles(colors).chipsGrid}>
                {FIELDS.map(field => (<Chip key={field.key} field={field} selected={selected.has(field.key)} onPress={() => toggleField(field.key)} colors={colors}/>))}
              </View>

              <View style={styles(colors).footBar}>
                <Text style={styles(colors).countText}>
                  {selectedCount} of {totalCount} selected
                </Text>
              </View>
            </>)}

          {/* Dynamic Form */}
          {(selectedCount > 0 || !!selectedCategory) && (<View style={styles(colors).formArea}>

              {selected.has('name') && (<FormField label="New company name" value={formValues.name} placeholder="Enter the registered company name..." onChangeText={v => setField('name', v)} colors={colors}/>)}

              {selected.has('alt') && (<FormField label="New alternate name" value={formValues.alt} placeholder="Enter the updated alternate name..." onChangeText={v => setField('alt', v)} colors={colors}/>)}

              {selected.has('reg') && (<FormField label="New registration number" value={formValues.reg} placeholder="Enter new registration number..." onChangeText={v => setField('reg', v)} colors={colors}/>)}

              {selected.has('web') && (<FormField label="New company website" value={formValues.web} placeholder="https://company.com" onChangeText={v => setField('web', v)} keyboardType="url" colors={colors}/>)}

              {selected.has('act') && (<FormField label="New principal activity" value={formValues.act} placeholder="Describe the updated business activity..." onChangeText={v => setField('act', v)} colors={colors}/>)}

              {selected.has('intro') && (<FormField label="Updated company introduction" value={formValues.intro} placeholder="Enter the updated company introduction..." onChangeText={v => setField('intro', v)} multiline colors={colors}/>)}

              {selected.has('addr') && (<FormField label="Updated local address" value={formValues.addr} placeholder="Enter full local / business address..." onChangeText={v => setField('addr', v)} colors={colors}/>)}

              {selected.has('rep') && (<FormField label="Updated local representative details" value={formValues.rep} placeholder="Enter name and contact details..." onChangeText={v => setField('rep', v)} colors={colors}/>)}

              {selected.has('sh') && (<View style={styles(colors).shCard}>
                  <Text style={styles(colors).shCardTitle}>
                    Shareholder / director details
                  </Text>
                  <View style={styles(colors).shGrid}>
                    <View style={styles(colors).shGridHalf}>
                      <FormField label="First name" value={formValues.sh.firstName} placeholder="First name" onChangeText={v => setShField('firstName', v)} colors={colors}/>
                    </View>
                    <View style={styles(colors).shGridHalf}>
                      <FormField label="Last name" value={formValues.sh.lastName} placeholder="Last name" onChangeText={v => setShField('lastName', v)} colors={colors}/>
                    </View>
                    <View style={styles(colors).shGridHalf}>
                      <FormField label="Designation" value={formValues.sh.designation} placeholder="Designation" onChangeText={v => setShField('designation', v)} colors={colors}/>
                    </View>
                    <View style={styles(colors).shGridHalf}>
                      <FormField label="Phone" value={formValues.sh.phone} placeholder="Phone" onChangeText={v => setShField('phone', v)} keyboardType="phone-pad" colors={colors}/>
                    </View>
                    <View style={styles(colors).shGridHalf}>
                      <FormField label="DOB (DD/MM/YYYY)" value={formValues.sh.dob} placeholder="DD/MM/YYYY" onChangeText={v => setShField('dob', v)} colors={colors}/>
                    </View>
                    <View style={styles(colors).shGridHalf}>
                      <FormField label="Share %" value={formValues.sh.sharePercent} placeholder="0%" onChangeText={v => setShField('sharePercent', v)} keyboardType="numeric" colors={colors}/>
                    </View>
                    
                    <View style={{ width: '100%', marginBottom: 4 }}>
                      <FormField label="Address line 1" value={formValues.sh.address1} placeholder="Address line 1" onChangeText={v => setShField('address1', v)} colors={colors}/>
                    </View>

                    <View style={styles(colors).shGridHalf}>
                      <FormField label="City" value={formValues.sh.city} placeholder="City" onChangeText={v => setShField('city', v)} colors={colors}/>
                    </View>
                    <View style={styles(colors).shGridHalf}>
                      <FormField label="State" value={formValues.sh.state} placeholder="State" onChangeText={v => setShField('state', v)} colors={colors}/>
                    </View>
                    <View style={styles(colors).shGridHalf}>
                      <FormField label="Postal code" value={formValues.sh.postalCode} placeholder="Postal code" onChangeText={v => setShField('postalCode', v)} keyboardType="numeric" colors={colors}/>
                    </View>
                    <View style={styles(colors).shGridHalf}>
                      <FormField label="Country" value={formValues.sh.country} placeholder="Country" onChangeText={v => setShField('country', v)} colors={colors}/>
                    </View>
                  </View>
                </View>)}

              {/* Message to admin team */}
              <View style={styles(colors).messageBlock}>
                <Text style={styles(colors).messageLabel}>
                  Message to admin team
                </Text>
                <TextInput style={[styles(colors).fieldInput, styles(colors).messageInput]} value={formValues.message} onChangeText={v => setField('message', v)} placeholder="Write your message here..." placeholderTextColor={colors.muted} multiline numberOfLines={4} textAlignVertical="top"/>
              </View>

              <TouchableOpacity style={styles(colors).submitBtn} onPress={handleSubmit} activeOpacity={0.8} disabled={submitting} // Disable button when submitting
        >
                {submitting ? (<ActivityIndicator color={colors.buttonText}/>) : (<Text style={[styles(colors).submitBtnText, { color: colors.buttonText }]}>Submit update</Text>)}
              </TouchableOpacity>
            </View>)}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>);
};
// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = (colors) => StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 14,
        paddingBottom: 100,
        paddingTop: 6,
    },
    // Header
    header: {
        paddingHorizontal: 14,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: colors.mode === 'dark' ? colors.background : '#FFFFFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        zIndex: 10,
        elevation: 4,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: font.xxl,
        fontWeight: '600',
        color: colors.text,
        flexShrink: 1,
        marginRight: 8,
        marginLeft: 14,
    },
    selectAllBtn: {
        fontSize: font.xxl,
        color: colors.primary,
        fontWeight: '500',
    },
    // Fixed 3-Column Grid for Buttons
    chipsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 10,
        marginBottom: 12,
    },
    chip: {
        width: '31.5%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.mode === 'dark' ? '#475569' : colors.border,
        backgroundColor: colors.surface,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    chipSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    chipText: {
        fontSize: font.md,
        fontWeight: '500',
        color: colors.muted,
        textAlign: 'center',
    },
    chipTextSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    // Footer bar
    footBar: {
        marginBottom: 16,
        marginTop: 18,
    },
    countText: {
        fontSize: font.lg,
        color: colors.muted,
    },
    // Form area
    formArea: {
        rowGap: 16,
        padding: 14
    },
    fieldBlock: {
        rowGap: 6,
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: font.md,
        fontWeight: '500',
        color: colors.text,
        textTransform: 'none',
        letterSpacing: 0.4,
    },
    fieldInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 15,
        fontSize: font.md,
        color: colors.text,
        backgroundColor: colors.surface,
    },
    fieldInputMulti: {
        minHeight: 72,
        textAlignVertical: 'top',
        paddingTop: 8,
    },
    // Shareholder card
    shCard: {
        backgroundColor: colors.surface,
        borderWidth: 0.5,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 16,
        gap: 14,
    },
    shCardTitle: {
        fontSize: font.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    shGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
    },
    shGridHalf: {
        width: '48%',
    },
    // Submit Button
    submitBtn: {
        backgroundColor: colors.buttonBackground,
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
        width: '100%',
        marginTop: 3,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
        overflow: 'hidden',
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: font.xxl,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    // Success screen
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    successIcon: {
        fontSize: 48,
        color: '#22C55E',
    },
    successTitle: {
        fontSize: font.hero,
        fontWeight: '600',
        color: colors.text,
    },
    successSub: {
        fontSize: font.lg,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: 16,
    },
    successBtn: {
        backgroundColor: colors.primary,
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    successBtnText: {
        color: '#FFFFFF',
        fontSize: font.xxl,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    // Message to admin
    messageBlock: {
        marginTop: 16,
    },
    messageLabel: {
        fontSize: font.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    messageInput: {
        minHeight: 100,
        paddingTop: 12,
        opacity: 1,
    },
});
export default BasicInfoScreen;
