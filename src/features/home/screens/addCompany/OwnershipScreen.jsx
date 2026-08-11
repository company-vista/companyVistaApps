import { useState } from "react";
import { Text, TextInput, View, TouchableOpacity, ScrollView, StyleSheet, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RadioCard from "./components/ownershipRadioCard";
import { useThemeColors } from "../../../../theme/colors";
import { font } from '../../../../theme/typography';
import { BackButton, ContinueButton } from "../../../../components/buttons";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { setOwnership } from "../../../../store/slices/companyRegistrationSlice";
import Toast from "react-native-toast-message";
export default function OwnershipScreen({ onBackPress, onContinue }) {
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const dispatch = useAppDispatch();
    const reg = useAppSelector(state => state.companyRegistration);
    const [ownershipType, setOwnershipType] = useState(reg.ownershipType || "individual");
    const createEmptyHolding = () => ({
        legalName: '',
        country: '',
        registrationNo: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        addressCountry: '',
        ownershipPercent: '',
    });
    const [holdingCompanies, setHoldingCompanies] = useState(reg.holdingCompanies.length > 0 ? reg.holdingCompanies : [createEmptyHolding()]);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const updateHolding = (index, field, value) => {
        setHoldingCompanies((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
    };
    const addHoldingCompany = () => {
        setHoldingCompanies((prev) => [...prev, createEmptyHolding()]);
    };
    const removeHoldingCompany = (index) => {
        setHoldingCompanies((prev) => prev.filter((_, i) => i !== index));
    };
    const isPrimaryFieldEmpty = (h, field) => {
        if (!h)
            return false;
        return !h[field]?.trim();
    };
    const validate = () => {
        if (ownershipType === 'company' || ownershipType === 'branch') {
            const primary = holdingCompanies[0];
            if (!primary)
                return 'Holding company details are required';
            const requiredFields = [
                'legalName', 'country', 'registrationNo',
                'addressLine1', 'city', 'state', 'zip', 'addressCountry', 'ownershipPercent',
            ];
            for (const field of requiredFields) {
                if (!primary[field]?.trim()) {
                    const label = field === 'legalName' ? 'Legal entity name'
                        : field === 'registrationNo' ? 'Registration No.'
                            : field === 'addressLine1' ? 'Address Line 1'
                                : field === 'addressCountry' ? 'Country'
                                    : field === 'ownershipPercent' ? 'Ownership %'
                                        : field.charAt(0).toUpperCase() + field.slice(1);
                    return `${label} is required in Holding Company`;
                }
            }
        }
        return null;
    };
    const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;
    const RequiredAsterisk = () => (<Text style={{ color: '#ef4444', fontSize: font.base }}>*</Text>);
    const renderInputField = (placeholder, value, onChangeText, isRequired = false, options) => {
        const hasError = attemptedSubmit && isRequired && !value?.trim();
        return (<View style={[
                styles.inputWrapper,
                options?.half ? styles.halfInput : undefined,
                { backgroundColor: inputBg, borderColor: hasError ? '#ef4444' : colors.inputBorder }
            ]}>
        <TextInput placeholder={placeholder} placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.text }]} value={value} onChangeText={onChangeText} keyboardType={options?.keyboardType}/>
      </View>);
    };
    const renderHoldingCompanyForm = (h, index) => {
        const isPrimary = index === 0;
        const isEmpty = !h.legalName && !h.country && !h.registrationNo &&
            !h.addressLine1 && !h.addressLine2 && !h.city &&
            !h.state && !h.zip && !h.addressCountry && !h.ownershipPercent;
        const required = attemptedSubmit;
        return (<View key={index} style={styles.extraFields}>
        <View style={styles.holdingHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, flex: 1 }]}>
            {isPrimary ? 'Holding Company (Primary)' : `Holding Company #${index + 1}`}
            {required && <RequiredAsterisk />}
          </Text>
          {!isPrimary && isEmpty && (<TouchableOpacity onPress={() => removeHoldingCompany(index)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>)}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {renderInputField('Legal entity name', h.legalName, (v) => updateHolding(index, 'legalName', v), true)}
        </View>

        <View style={styles.row}>
          {renderInputField('Country', h.country, (v) => updateHolding(index, 'country', v), true, { half: true })}
          {renderInputField('Registration No.', h.registrationNo, (v) => updateHolding(index, 'registrationNo', v), true, { half: true })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Registered Address
        </Text>

        {renderInputField('Address Line 1', h.addressLine1, (v) => updateHolding(index, 'addressLine1', v), true)}
        {renderInputField('Address Line 2', h.addressLine2, (v) => updateHolding(index, 'addressLine2', v), false)}

        <View style={styles.row}>
          {renderInputField('City', h.city, (v) => updateHolding(index, 'city', v), true, { half: true })}
          {renderInputField('State', h.state, (v) => updateHolding(index, 'state', v), true, { half: true })}
        </View>

        <View style={styles.row}>
          {renderInputField('ZIP', h.zip, (v) => updateHolding(index, 'zip', v), true, { half: true })}
          {renderInputField('Country', h.addressCountry, (v) => updateHolding(index, 'addressCountry', v), true, { half: true })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {renderInputField('Ownership %', h.ownershipPercent, (v) => updateHolding(index, 'ownershipPercent', v), true, { keyboardType: 'numeric' })}
        </View>
      </View>);
    };
    return (<View style={styles.screen}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress}/>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Company owned</Text>
      </View>

      <View style={styles.body}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>
            How is the company <Text style={styles.titleAccent}>owned?</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Determines who holds ownership of the company.
          </Text>

          <RadioCard title="Owned by individual(s)" subtitle="One or more individual shareholders" value="individual" selected={ownershipType === "individual"} onPress={() => setOwnershipType("individual")}/>

          <RadioCard title="Owned by another company" subtitle="A local/international entity will hold shares" value="company" selected={ownershipType === "company"} onPress={() => setOwnershipType("company")}/>

          <RadioCard title="Branch / representative office" subtitle="This will be a branch of an existing company" value="branch" selected={ownershipType === "branch"} onPress={() => setOwnershipType("branch")}/>

          {ownershipType !== "individual" && (<View style={styles.extraFields}>
              {holdingCompanies.map((h, index) => renderHoldingCompanyForm(h, index))}

              <TouchableOpacity style={styles.addButton} onPress={addHoldingCompany}>
                <Text style={styles.addButtonText}>
                  + Add a second holding company
                </Text>
              </TouchableOpacity>
            </View>)}
        </ScrollView>

        <View style={[styles.footerColumn, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <ContinueButton onPress={() => {
            setAttemptedSubmit(true);
            const error = validate();
            if (error) {
                Toast.show({ type: 'error', text1: 'Required fields missing', text2: error });
                return;
            }
            dispatch(setOwnership({ ownershipType, holdingCompanies }));
            onContinue();
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
        padding: 16,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 8,
    },
    title: {
        fontSize: font.display,
        fontWeight: '500',
        lineHeight: 23,
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
    extraFields: {
        marginTop: 6,
    },
    sectionTitle: {
        fontSize: font.lg,
        fontWeight: '500',
        marginBottom: 10,
        marginTop: 16,
    },
    inputWrapper: {
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    input: {
        fontSize: font.base,
        paddingVertical: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    halfInput: {
        flex: 1,
    },
    holdingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    removeText: {
        color: '#ef4444',
        fontSize: font.base,
        fontWeight: '500',
    },
    addButton: {
        borderWidth: 0.5,
        borderColor: '#e6a82a',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    addButtonText: {
        color: '#e6a82a',
        fontSize: font.base,
        fontWeight: '500',
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
