import { font } from '../../../theme/typography';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';
import { getStateData, getEntityTypes, getEntityMeta } from '../../../utils/jurisdictionData';
import { getCountryData, getCountryEntities } from '../../../constants/countries';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../theme/colors';

const CompanyNamingScreen = ({ navigation, route }) => {
  const p = route.params || {};
  // bestCountry/bestState (advisor flow) + selectedCountry/selectedState (direct) dono handle
  const selectedCountry = p.selectedCountry || p.bestCountry || 'US';
  const isUS = selectedCountry === 'US';
  const selectedState = p.selectedState || p.bestState || (isUS ? 'Delaware' : '');
  const stateData = getStateData(selectedState);
  const entityTypes = getEntityTypes(stateData);
  const countryData = getCountryData(selectedCountry);
  const countryName = countryData?.name || selectedCountry;

  // Entity options: US = state ke entityTypes, non-US = country registry entities
  const entityOptions = isUS
    ? entityTypes.map((type) => {
      const meta = getEntityMeta(type);
      return {
        key: type,
        chip: meta?.chip || type,
        subtitle: meta?.subtitle || '',
        ending: meta?.ending || '',
      };
    })
    : getCountryEntities(selectedCountry).map((entity) => ({
      key: entity.code,
      chip: entity.code,
      subtitle: entity.name,
      ending: (entity.suffixes && entity.suffixes[0]) || '',
    }));

  const [companyName, setCompanyName] = useState('');
  // Non-US me pehla entity default selected rakho taaki legal suffix dikhe
  const [selectedEntity, setSelectedEntity] = useState(
    () => (isUS ? '' : getCountryEntities(selectedCountry)[0]?.code || ''),
  );
  const [alternateName, setAlternateName] = useState('');
  const [showAvailable, setShowAvailable] = useState(false);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';
  const selectedEntityOption = entityOptions.find((o) => o.key === selectedEntity) || null;
  const selectedEnding = selectedEntityOption?.ending || '';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // 5 sec delay after user types company name before showing tick + availability text
  useEffect(() => {
    if (companyName.trim().length > 0) {
      setShowAvailable(false);
      const timer = setTimeout(() => setShowAvailable(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowAvailable(false);
    }
  }, [companyName]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} transparent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <Text style={[styles.mainTitle, { color: colors.text, marginTop: s(8) }]}>
            What will you <Text style={styles.italicTitle}>call it?</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {isUS ? `We'll check name availability with the ${selectedState} Division of Corporations.` : `We'll check name availability in ${countryName}.`}
          </Text>

          {/* Jurisdiction Card */}
          <View style={[styles.jurisdictionCard, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_03 : themePalette.hex_ffffff, borderColor: isDark ? themePalette.rgba_255_255_255_0_08 : colors.border }]}>
            <Text style={[styles.countryCodeBadge, { color: colors.muted }]}>{selectedCountry}</Text>
            <Text style={[styles.jurisdictionLabel, { color: colors.muted }]}>Jurisdiction</Text>
            <Text style={styles.jurisdictionValue}>{isUS ? `${selectedState}, ${countryName}` : countryName}</Text>
          </View>

          {/* Company Name Input */}
          <Text style={[styles.inputLabel, { color: colors.muted }]}>
            COMPANY NAME <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={[showAvailable ? styles.successInputContainer : styles.defaultInputContainer, { backgroundColor: isDark ? (showAvailable ? themePalette.rgba_16_185_129_0_03 : themePalette.rgba_255_255_255_0_02) : (showAvailable ? themePalette.rgba_16_185_129_0_05 : colors.inputBackground), borderColor: showAvailable ? themePalette.hex_10b981 : (isDark ? themePalette.rgba_255_255_255_0_1 : colors.inputBorder) }]}>
            <Ionicons name="business" size={16} color={colors.subtle} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Enter company name"
              placeholderTextColor={colors.inputPlaceholder}
            />
          </View>

          {/* Entity types */}
          {entityOptions.length > 0 && (
            <>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>ENTITY TYPE <Text style={styles.requiredAsterisk}>*</Text></Text>
              <View style={styles.endingsRow}>
                {entityOptions.map((option) => {
                  const isSelected = selectedEntity === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.endingChip, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_03 : colors.surfaceAlt, borderColor: isDark ? themePalette.rgba_255_255_255_0_1 : colors.border }, isSelected && styles.endingChipSelected]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedEntity(option.key)}
                    >
                      <Text style={[styles.endingChipText, { color: colors.muted }, isSelected && styles.endingChipTextSelected]}>
                        {option.chip}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.fullLegalPreview, { color: colors.muted }]}>
                Full legal name:{' '}
                <Text style={styles.fullLegalHighlight}>
                  {companyName || 'Ex: company vista'} {selectedEnding || '—'}
                </Text>
              </Text>
              <Text style={[styles.helperText, { color: colors.muted, marginTop: 4 }]}>
                {selectedEntityOption?.subtitle || 'Choose the entity type to register'}
              </Text>
            </>
          )}
          {entityOptions.length === 0 && companyName.trim().length > 0 && (
            <Text style={[styles.fullLegalPreview, { color: colors.muted }]}>
              Full legal name: <Text style={styles.fullLegalHighlight}>{companyName}</Text>
            </Text>
          )}

          {/* Alternate Name */}
          <Text style={[styles.inputLabel, { color: colors.muted }]}>ALTERNATE NAME (OPTIONAL)</Text>
          <View style={[styles.defaultInputContainer, { backgroundColor: isDark ? themePalette.rgba_255_255_255_0_02 : colors.inputBackground, borderColor: isDark ? themePalette.rgba_255_255_255_0_1 : colors.inputBorder }]}>
            <Ionicons name="add" size={18} color={colors.subtle} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={alternateName}
              onChangeText={setAlternateName}
              placeholder="Backup if first choice is taken"
              placeholderTextColor={colors.inputPlaceholder}
            />
          </View>
          <Text style={[styles.helperText, { color: colors.muted }]}>
            Recommended — avoids delays if your first name is rejected
          </Text>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: isDark ? themePalette.rgba_59_130_246_0_04 : themePalette.rgba_59_130_246_0_06, borderColor: isDark ? themePalette.rgba_59_130_246_0_15 : themePalette.rgba_59_130_246_0_25 }]}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="information" size={12} color={themePalette.hex_60a5fa} />
            </View>
            <Text style={[styles.infoBoxText, { color: colors.muted }]}>
              Words like <Text style={[styles.boldText, { color: colors.text }]}>Bank, Trust, Insurance, University</Text> need special state approval.
            </Text>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Bottom Fixed Button */}
      <View style={[styles.bottomBar, { paddingBottom: s(12) + insets.bottom, backgroundColor: colors.background, borderTopColor: isDark ? themePalette.rgba_255_255_255_0_05 : colors.border }]}>
        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: colors.buttonBackground }, (!companyName.trim() || (entityOptions.length > 0 && !selectedEntity)) && styles.continueBtnDisabled]}
          activeOpacity={0.85}
          onPress={() => {
            if (!companyName.trim() || (entityOptions.length > 0 && !selectedEntity)) return;
            const baseParams = { ...(route.params || {}), companyName: companyName.trim(), selectedEntity, selectedEnding, selectedState, selectedCountry };
            navigation.navigate('StructureSelection', baseParams);
          }}
          disabled={!companyName.trim() || (entityOptions.length > 0 && !selectedEntity)}
        >
          <Text style={[styles.continueBtnText, { color: colors.buttonText }]}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CompanyNamingScreen;

const styles = makeThemeStyles(() => StyleSheet.create({
  container: { flex: 1 },
  progressContainer: { flexDirection: 'row', paddingHorizontal: s(16), paddingTop: s(12), paddingBottom: s(16), gap: 8 },
  progressStep: { flex: 1, height: 3, borderRadius: 2 },
  progressActive: { backgroundColor: themePalette.hex_c9a84c },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(90), gap: s(2) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(12), marginTop: s(34) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  mainTitle: { fontSize: s(24), fontWeight: '500', lineHeight: s(38), marginBottom: s(10) },
  italicTitle: { color: themePalette.hex_c9a84c, fontStyle: 'italic', fontFamily: 'serif' },
  subtitle: { fontSize: s(14), lineHeight: s(21), marginBottom: s(24) },
  jurisdictionCard: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center',
    borderRadius: s(14),
    borderWidth: 1,
    paddingHorizontal: s(14), paddingVertical: s(12), marginBottom: s(14),
  },
  countryCodeBadge: { fontSize: s(13), fontWeight: 'bold', marginRight: s(8) },
  jurisdictionLabel: { fontSize: s(14), flex: 1 },
  jurisdictionValue: { color: themePalette.hex_c9a84c, fontSize: s(15), fontWeight: 'bold' },
  inputLabel: { fontSize: s(11), fontWeight: 'bold', letterSpacing: 1.2, marginBottom: s(8), marginTop: s(12) },
  requiredAsterisk: { color: themePalette.hex_ef4444 },
  successInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1, borderColor: themePalette.hex_10b981, paddingHorizontal: s(14), height: 48,
  },
  defaultInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: s(14), height: 48,
  },
  textInput: { flex: 1, fontSize: font.bodySmall, fontWeight: '500', marginLeft: s(10) },
  greenCheckBadge: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: themePalette.hex_10b981,
    alignItems: 'center', justifyContent: 'center',
  },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', marginTop: s(8), marginBottom: s(20), gap: s(6) },
  availabilityText: { color: themePalette.hex_10b981, fontSize: font.small },
  endingsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8), marginBottom: s(20), marginTop: s(4) },
  endingChip: {
    paddingHorizontal: s(14), paddingVertical: s(8), borderRadius: 16,
    borderWidth: 1,
  },
  endingChipSelected: { borderColor: themePalette.hex_c9a84c, backgroundColor: themePalette.rgba_201_168_76_0_08 },
  endingChipText: { fontSize: font.small, fontWeight: '600' },
  endingChipTextSelected: { color: themePalette.hex_c9a84c, fontWeight: 'bold' },
  fullLegalPreview: { fontSize: s(13), fontWeight: '500', marginBottom: s(12), marginTop: s(4) },
  fullLegalHighlight: { color: themePalette.hex_c9a84c, fontWeight: 400, fontSize: s(14) },
  helperText: { fontSize: font.xs, marginTop: s(6), marginBottom: s(10) },
  infoBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: s(12), marginTop: s(12), marginBottom: s(4),
  },
  infoIconCircle: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: themePalette.hex_60a5fa,
    alignItems: 'center', justifyContent: 'center', marginRight: s(10),
  },
  infoBoxText: { flex: 1, fontSize: font.small, lineHeight: 15 },
  boldText: { fontWeight: 'bold' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: s(16), paddingVertical: s(12),
    borderTopWidth: 1,
  },
  continueBtn: { borderRadius: 24, paddingVertical: s(14), alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { fontSize: font.base, fontWeight: 'bold' },
}));
