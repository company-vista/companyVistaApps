import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { BackButton, ContinueButton } from '../../../../components/buttons';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setEntityDetails } from '../../../../store/slices/companyRegistrationSlice';
const usStates = [
    '-- Select --', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois',
    'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
    'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
    'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];
const entityOptionsByCountry = {
    US: ['-- Select --', 'LLC (Limited Liability Company)', 'C-Corp (C-Corporation)', 'S-Corp (S-Corporation)', 'Non-Profit'],
    CA: ['-- Select --', 'Federal Corporation', 'Provincial Corporation'],
    MX: ['-- Select --', 'S.A. de C.V. (Sociedad Anónima de Capital Variable)', 'S. de R.L. (Sociedad de Responsabilidad Limitada)'],
    CR: ['-- Select --', 'S.A. (Sociedad Anónima)', 'S.R.L. (Responsabilidad Limitada)'],
    GB: ['-- Select --', 'Ltd (Private Limited Company)', 'LLP (Limited Liability Partnership)', 'PLC (Public Limited Company)'],
    IE: ['-- Select --', 'Private Limited Company'],
    DE: ['-- Select --', 'GmbH (Gesellschaft mit beschränkter Haftung)', 'AG (Aktiengesellschaft)'],
    NL: ['-- Select --', 'B.V. (Besloten Vennootschap)', 'N.V. (Naamloze Vennootschap)'],
    FR: ['-- Select --', 'SARL (Société à Responsabilité Limitée)', 'SAS (Société par Actions Simplifiée)', 'SA (Société Anonyme)'],
    CH: ['-- Select --', 'GmbH (Gesellschaft mit beschränkter Haftung)', 'AG (Aktiengesellschaft)'],
    EE: ['-- Select --', 'Osaühing (OÜ)'],
    PL: ['-- Select --', 'Sp. z o.o. (Spółka z ograniczoną odpowiedzialnością)'],
    CY: ['-- Select --', 'Private Limited Company'],
    MT: ['-- Select --', 'Ltd (Private Limited Company)', 'PLC (Public Limited Company)'],
    AE: ['-- Select --', 'Mainland Company', 'Free Zone Company'],
    SA: ['-- Select --', 'LLC (Limited Liability Company)', 'Joint Stock Co.'],
    QA: ['-- Select --', 'LLC (Limited Liability Company)', 'QFZ (Qatar Financial Zone) Company'],
    KW: ['-- Select --', 'LLC (Limited Liability Company)', 'KSC (Kuwaiti Shareholding Company)'],
    OM: ['-- Select --', 'LLC (Limited Liability Company)', 'SAOC (Omani Joint Stock Company)'],
    BH: ['-- Select --', 'LLC (Limited Liability Company)', 'WLL (With Limited Liability)', 'BSC (Bahraini Shareholding Company)'],
    SG: ['-- Select --', 'Private Ltd (Private Limited)', 'LLP (Limited Liability Partnership)'],
    HK: ['-- Select --', 'Private Ltd (Private Limited)', 'Limited by Guarantee'],
    CN: ['-- Select --', 'WFOE (Wholly Foreign-Owned Enterprise)', 'JV (Joint Venture)', 'FICE (Foreign Invested Commercial Enterprise)'],
    JP: ['-- Select --', 'KK (Kabushiki Kaisha)', 'GK (Godo Kaisha)', 'YK (Yugen Kaisha)'],
    KR: ['-- Select --', 'Yuja Hoesa (Stock Company)', 'Jusik Hoesa (Joint Stock Company)'],
    IN: ['-- Select --', 'Private Ltd (Private Limited)', 'LLP (Limited Liability Partnership)', 'OPC (One Person Company)'],
    AU: ['-- Select --', 'Pty Ltd (Proprietary Limited)', 'Ltd (Limited)', 'PLC (Public Limited Company)'],
    NZ: ['-- Select --', 'Ltd (Limited)', 'Limited Partnership'],
    MY: ['-- Select --', 'Sdn Bhd (Sendirian Berhad)', 'Bhd (Berhad)'],
    ID: ['-- Select --', 'PT (Perseroan Terbatas)', 'PMA (Penanaman Modal Asing)', 'CV (Commanditaire Vennootschap)'],
    PH: ['-- Select --', 'Corporation', 'Partnership'],
    TH: ['-- Select --', 'Co. Ltd (Company Limited)', 'Public Co. Ltd (Public Company Limited)'],
    VN: ['-- Select --', 'LLC (Limited Liability Company)', 'JSC (Joint Stock Company)'],
    TW: ['-- Select --', 'Ltd (Limited)', 'Inc. (Incorporated)'],
    ZA: ['-- Select --', 'Pty Ltd (Proprietary Limited)', 'Ltd (Limited)', 'NPC (Non-Profit Company)'],
    NG: ['-- Select --', 'Ltd (Limited)', 'PLC (Public Limited Company)', 'LLC (Limited Liability Company)'],
    KE: ['-- Select --', 'Ltd (Limited)', 'PLC (Public Limited Company)', 'LLP (Limited Liability Partnership)'],
    EG: ['-- Select --', 'LLC (Limited Liability Company)', 'Joint Stock Co.'],
    MA: ['-- Select --', 'SARL (Société à Responsabilité Limitée)', 'SA (Société Anonyme)'],
    TN: ['-- Select --', 'SARL (Société à Responsabilité Limitée)', 'SA (Société Anonyme)'],
    KY: ['-- Select --', 'Exempted Ltd (Exempted Limited)', 'LLC (Limited Liability Company)'],
    VG: ['-- Select --', 'BC (Business Company)', 'IBC (International Business Company)', 'LLC (Limited Liability Company)'],
    BM: ['-- Select --', 'Exempted Co. (Exempted Company)', 'Ltd (Limited)'],
    BS: ['-- Select --', 'IBC (International Business Company)', 'Ltd (Limited)'],
    BB: ['-- Select --', 'IBC (International Business Company)', 'LLC (Limited Liability Company)', 'Ltd (Limited)'],
    JE: ['-- Select --', 'Private Ltd (Private Limited)', 'LLC (Limited Liability Company)'],
    GG: ['-- Select --', 'Private Ltd (Private Limited)', 'LLC (Limited Liability Company)'],
    IM: ['-- Select --', 'Private Ltd (Private Limited)', 'LLC (Limited Liability Company)'],
    GI: ['-- Select --', 'Private Ltd (Private Limited)', 'PLC (Public Limited Company)'],
    LI: ['-- Select --', 'AG (Aktiengesellschaft)', 'Anstalt', 'Stiftung (Foundation)'],
    MC: ['-- Select --', 'SAM (Société Anonyme Monégasque)', 'SARL (Société à Responsabilité Limitée)'],
    PA: ['-- Select --', 'Corp (Corporation)', 'LLC (Limited Liability Company)', 'Foundation'],
    BZ: ['-- Select --', 'IBC (International Business Company)', 'LLC (Limited Liability Company)'],
    SC: ['-- Select --', 'IBC (International Business Company)', 'CSL (Company Special License)'],
    MU: ['-- Select --', 'GBC (Global Business Company)', 'Ltd (Limited)', 'LLC (Limited Liability Company)'],
};
const defaultEntityOptions = ['-- Select --', 'LLC (Limited Liability Company)', 'Corporation'];
export default function EntityDetailScreen({ selectedJurisdiction, onBackPress, onContinue }) {
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const dispatch = useAppDispatch();
    const reg = useAppSelector(state => state.companyRegistration);
    const entityOptions = selectedJurisdiction
        ? entityOptionsByCountry[selectedJurisdiction] ?? defaultEntityOptions
        : defaultEntityOptions;
    const [selected, setSelected] = useState(reg.entityType && reg.entityType !== '-- Select --' ? reg.entityType : '-- Select --');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedState, setSelectedState] = useState(reg.stateOfIncorporation && reg.stateOfIncorporation !== '-- Select --' ? reg.stateOfIncorporation : '-- Select --');
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [companyName, setCompanyName] = useState(reg.companyName);
    const [alternateName, setAlternateName] = useState(reg.alternateName);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;
    const handleContinue = () => {
        setAttemptedSubmit(true);
        if (companyName && selected !== '-- Select --') {
            dispatch(setEntityDetails({ stateOfIncorporation: selectedState, entityType: selected, companyName, alternateName }));
            onContinue();
        }
    };
    return (<View style={styles.screen}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress}/>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Entity details</Text>
      </View>

      <View style={styles.body}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* <Text style={[styles.title, { color: colors.text }]}>
          Let's set up your <Text style={styles.titleAccent}>company</Text>, step by step.
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          This guided form adapts to the country you're registering in — you'll only see the questions that apply to you.
        </Text> */}

          

          {/* <Text style={[styles.sectionTitle, { color: colors.text }]}>Entity details</Text> */}
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
            {selectedJurisdiction
            ? `These options are specific to ${selectedJurisdiction}.`
            : 'Select a country in the previous step.'}
          </Text>

          <View style={[styles.fieldGroup, { marginTop: 0 }]}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>
                STATE OF INCORPORATION <Text style={styles.required}>*</Text>
              </Text>
            </View>
            <TouchableOpacity style={[styles.dropdown, { backgroundColor: inputBg, borderColor: colors.inputBorder }]} onPress={() => setShowStateDropdown(!showStateDropdown)} activeOpacity={0.8}>
              <Text style={[styles.dropdownText, { color: colors.text }]}>{selectedState}</Text>
              <Ionicons name={showStateDropdown ? 'chevron-up' : 'chevron-down'} size={16} color={colors.subtle}/>
            </TouchableOpacity>
            {showStateDropdown && (<View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {usStates.map((state) => (<TouchableOpacity key={state} style={[
                    styles.dropdownItem,
                    selectedState === state && { backgroundColor: colors.surfaceAlt },
                ]} onPress={() => {
                    setSelectedState(state);
                    setShowStateDropdown(false);
                }} activeOpacity={0.7}>
                    <Text style={[
                    styles.dropdownItemText,
                    { color: colors.text },
                    selectedState === state && { color: '#e6a82a' },
                ]}>
                      {state}
                    </Text>
                  </TouchableOpacity>))}
              </View>)}
          </View>

          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              ENTITY / COMPANY TYPE <Text style={styles.required}>*</Text>
            </Text>
          </View>

          <TouchableOpacity style={[styles.dropdown, { backgroundColor: inputBg, borderColor: colors.inputBorder }]} onPress={() => setShowDropdown(!showDropdown)} activeOpacity={0.8}>
            <Text style={[styles.dropdownText, { color: colors.text }]}>{selected}</Text>
            <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={16} color={colors.subtle}/>
          </TouchableOpacity>

          {showDropdown && (<View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {entityOptions.map((option) => (<TouchableOpacity key={option} style={[
                    styles.dropdownItem,
                    selected === option && { backgroundColor: colors.surfaceAlt },
                ]} onPress={() => {
                    setSelected(option);
                    setShowDropdown(false);
                }} activeOpacity={0.7}>
                  <Text style={[
                    styles.dropdownItemText,
                    { color: colors.text },
                    selected === option && { color: '#e6a82a' },
                ]}>
                    {option}
                  </Text>
                </TouchableOpacity>))}
            </View>)}

          {selected !== '-- Select --' && (<View style={[styles.banner, { backgroundColor: 'rgba(230,168,42,0.08)', borderColor: '#6b5320' }]}>
              <Text style={styles.bannerIcon}>{'\u2139'}</Text>
              <Text style={[styles.bannerText, { color: colors.text }]}>
                Selected: <Text style={styles.bannerHighlight}>{selected}</Text>
              </Text>
            </View>)}

          <View style={[styles.divider, { backgroundColor: colors.border }]}/>

          {/* Desired Company Name */}

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 4 }]}>
            What would you like to name your <Text style={styles.titleAccent}>company</Text>
          </Text>

          <View style={[styles.fieldGroup, { marginTop: 14 }]}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>
                Desired company name <Text style={styles.required}>*</Text>
              </Text>
              <Ionicons name="information-circle-outline" size={16} color={colors.subtle}/>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
              <TextInput placeholder="e.g. Atlas Trading" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.text }]} value={companyName} onChangeText={(v) => { setCompanyName(v); setAttemptedSubmit(false); }}/>
            </View>
            {attemptedSubmit && !companyName && (<Text style={[styles.errorText, { color: colors.danger }]}>
                Please enter your desired company name.
              </Text>)}
          </View>

          {/* Alternate Company Name */}

          <View style={[styles.fieldGroup, { marginTop: 20 }]}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>
                Alternate company name
              </Text>
              <Ionicons name="information-circle-outline" size={16} color={colors.subtle}/>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
              <TextInput placeholder="e.g. Atlas Global Trading" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.text }]} value={alternateName} onChangeText={(v) => { setAlternateName(v); setAttemptedSubmit(false); }}/>
            </View>
            <Text style={[styles.helperText, { color: colors.subtle }]}>
              In case the first is unavailable
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footerColumn, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <ContinueButton onPress={handleContinue} disabled={selected === '-- Select --'}/>
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
        paddingHorizontal: 14,
        paddingBottom: 12,
        gap: 12,
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
        fontSize: font.large,
        fontWeight: '500',
        lineHeight: 24,
        marginBottom: 8,
    },
    titleAccent: {
        color: '#e6a82a',
        fontStyle: 'italic',
    },
    subtitle: {
        fontSize: font.base,
        marginBottom: 12,
    },
    stepLabel: {
        fontSize: font.base,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: font.hero,
        fontWeight: '500',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: font.xxl,
        marginBottom: 19,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 14,
    },
    label: {
        fontSize: font.sm,
    },
    required: {
        color: '#e6a82a',
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
        fontSize: font.base,
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
        fontSize: font.base,
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 0.5,
        borderRadius: 8,
        padding: 10,
        marginBottom: 14,
    },
    bannerIcon: {
        fontSize: font.lg,
    },
    bannerText: {
        flex: 1,
        fontSize: font.sm,
    },
    bannerHighlight: {
        color: '#e6a82a',
        fontWeight: '500',
    },
    fieldGroup: {
        marginBottom: 12,
    },
    inputWrapper: {
        borderWidth: 0.3,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    input: {
        fontSize: font.base,
        paddingVertical: 14,
    },
    helperText: {
        fontSize: font.xs,
        marginTop: 4,
    },
    errorText: {
        fontSize: font.sm,
        marginTop: 4,
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
    footerColumn: {
        gap: 8,
    },
    continueButtonFull: {
        backgroundColor: '#e6a82a',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        fontSize: font.base,
        fontWeight: '500',
        color: '#1a1204',
    },
});
