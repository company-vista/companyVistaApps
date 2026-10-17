import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';
import { STRUCTURE_PRICE_MAP } from '../../../utils/priceCalculator';
import { getStateData, getEntityTypes, getEntityMeta, getEntityByStructureId } from '../../../utils/jurisdictionData';
import { getCountryData, getCountryEntities } from '../../../constants/countries';
import { useThemeColors } from '../../../theme/colors';

const StructureSelectionScreen = ({ navigation, route }) => {
  const p = route.params || {};
  const advisorFlow = !!p.advisorFlow;
  const effectiveState = p.bestState || p.selectedState || 'Delaware';
  const effectiveCountry = p.bestCountry || p.selectedCountry || 'US';
  const { companyName = '', selectedEntity = '', selectedEnding = '' } = p;
  const selectedState = effectiveState;
  const selectedCountry = effectiveCountry;
  const isUS = selectedCountry === 'US';
  const [selectedStructure, setSelectedStructure] = useState(null);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  // US: state ke usStates.entityTypes se; non-US: country registry ke entities se
  const stateData = getStateData(selectedState);
  const entityTypes = getEntityTypes(stateData);
  const countryData = getCountryData(selectedCountry);
  const countryName = countryData?.name || selectedCountry;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const allStructures = isUS
    ? entityTypes.map((type) => {
        const m = getEntityMeta(type);
        return {
          id: m.id,
          entityKey: m.key,
          ending: m.ending,
          title: m.title,
          subtitle: m.subtitle,
          icon: m.icon,
          description: m.description,
          tags: m.tags,
          price: `$${m.price}`,
          priceNum: m.price,
          badge: m.badge,
          badgeType: m.badgeType,
        };
      })
    : getCountryEntities(selectedCountry).map((entity) => ({
        id: entity.code,
        entityKey: entity.code,
        ending: (entity.suffixes && entity.suffixes[0]) || '',
        title: entity.name,
        subtitle: entity.code,
        icon: 'business',
        description: entity.snippet,
        tags: Array.isArray(entity.features) ? entity.features : [],
        price: entity.serviceFee ? `$${entity.serviceFee}` : 'Custom quote',
        priceNum: entity.serviceFee || 0,
        badge: entity.badge,
        badgeType: 'green',
      }));

  // CompanyNaming me chuna gaya entity type -> structure page filter karega.
  // Purane params me sirf selectedEnding ho to usse entity type nikal lo.
  const selectedEntityKey = allStructures.some((struct) => struct.entityKey === selectedEntity)
    ? selectedEntity
    : (() => {
        const ending = String(selectedEnding || '').trim().toLowerCase();
        if (!ending) return '';
        return (
          allStructures.find((struct) => String(struct.ending).toLowerCase() === ending)
            ?.entityKey || ''
        );
      })();

  const structures = selectedEntityKey
    ? allStructures.filter((struct) => struct.entityKey === selectedEntityKey)
    : allStructures;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // CompanyNaming me chuna gaya entity auto-select ho jaye
  useEffect(() => {
    if (!selectedEntityKey) return;
    const meta = getEntityMeta(selectedEntityKey);
    // US: meta.id (e.g. 'C-Corp'); non-US: structure id === entity code (e.g. 'LTD')
    setSelectedStructure(meta ? meta.id : selectedEntityKey);
  }, [selectedEntityKey]);

  const getStructurePrice = (id) => STRUCTURE_PRICE_MAP[id] ?? 299;
  // country price: direct flow selectedCountryPrice, advisor flow BestMatches se aata hai
  const countryPrice = Number(p.selectedCountryPrice ?? p.bestCountryPrice ?? 0);
  // state ka govt fee: direct flow me selectedStatePrice, advisor flow me bestStateGovFee
  // (bestStatePrice = 299 package + state fee hota hai, isliye use nahi karte - double count ho jata hai)
  const advisorStateTotal = Number(p.bestStatePrice ?? 0);
  const stateFee = Number(
    p.selectedStatePrice
    ?? p.bestStateGovFee
    ?? (advisorStateTotal > 0 ? advisorStateTotal - (countryPrice || 299) : 0)
  );
  // USA: country/structure package + state fee; non-USA: sirf country price (structure add nahi)
  const getTotalForStructure = (id) => {
    const sp = getStructurePrice(id);
    if (isUS) return sp + stateFee;
    return countryPrice;
  };
  const getBreakdownForStructure = (id) => {
    const sp = getStructurePrice(id);
    if (!isUS) return countryPrice > 0 ? `$${countryPrice} package` : 'Custom quote';
    return stateFee > 0 ? `$${sp} structure + $${stateFee} state fee` : `$${sp} package`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} transparent backgroundColor="transparent" />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Choose your <Text style={styles.italicTitle}>structure</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Entity types available in {isUS ? selectedState : countryName}.
          </Text>

          <View style={styles.listContainer}>
            {structures.map((item) => {
              const isSelected = selectedStructure === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }, isSelected && { borderColor: '#C9A84C', backgroundColor: isDark ? 'rgba(201, 168, 76, 0.02)' : 'rgba(201, 168, 76, 0.06)' }]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedStructure(item.id)}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.surfaceAlt, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }, isSelected && { borderColor: 'rgba(201, 168, 76, 0.3)', backgroundColor: 'rgba(201, 168, 76, 0.08)' }]}>
                      <Ionicons name={item.icon} size={18} color={isSelected ? '#C9A84C' : (isDark ? '#94A3B8' : colors.muted)} />
                    </View>
                    <View style={styles.titleContainer}>
                      <Text style={[styles.cardTitle, { color: colors.text }, isSelected && styles.goldText]}>{item.title}</Text>
                      <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={11} color="#060913" />}
                    </View>
                  </View>

                  <Text style={[styles.cardDescription, { color: colors.muted }]}>{item.description}</Text>

                  <View style={styles.tagsRow}>
                    {item.tags.map((tag, idx) => (
                      <View key={idx} style={[styles.tagChip, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.surfaceAlt, borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }, tag.startsWith('⚠') && styles.tagWarn]}>
                        <Text style={[styles.tagText, { color: colors.muted }, tag.startsWith('⚠') && styles.tagWarnText]}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.cardDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]} />

                  <View style={styles.cardFooterRow}>
                    {(() => {
                      const total = getTotalForStructure(item.id);
                      return (
                        <View>
                          <Text style={styles.priceText}>
                            {total > 0 ? `$${total}` : 'Custom quote'} <Text style={[styles.stateFeeText, { color: colors.muted }]}>total</Text>
                          </Text>
                          <Text style={[styles.stateFeeText, { color: colors.muted }]}>
                            {getBreakdownForStructure(item.id)}
                          </Text>
                        </View>
                      );
                    })()}
                    {item.badge && (
                      <View style={[styles.badge, item.badgeType === 'green' ? styles.badgeGreen : styles.badgeBlue]}>
                        <Text style={[styles.badgeText, item.badgeType === 'green' ? styles.badgeTextGreen : styles.badgeTextBlue]}>
                          {item.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: s(12) + insets.bottom, backgroundColor: colors.background, borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]}>
        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: colors.buttonBackground }, !selectedStructure && styles.continueBtnDisabled]}
          activeOpacity={0.85}
          disabled={!selectedStructure}
          onPress={() => {
            const { selectedEnding: _omit, selectedEntity: _omitEntity, ...restParams } = route.params || {};
            const structPrice = getStructurePrice(selectedStructure);
            const combinedTotal = getTotalForStructure(selectedStructure);
            const structureMeta = getEntityByStructureId(selectedStructure);
            const matchedStructure = structures.find((item) => item.id === selectedStructure);
            const isQuotedCountry = !isUS && !(countryPrice > 0);
            navigation.navigate('WhatsIncluded', {
              ...restParams,
              selectedStructure,
              selectedEntity: structureMeta?.key || matchedStructure?.entityKey || '',
              selectedStructurePrice: isQuotedCountry ? 0 : structPrice,
              selectedCountryPrice: countryPrice || restParams.selectedCountryPrice,
              selectedStatePrice: isUS && stateFee > 0 ? stateFee : restParams.selectedStatePrice,
              combinedTotal,
              runningTotal: combinedTotal,
              totalAmount: combinedTotal,
              companyName,
              selectedEnding: structureMeta?.ending || matchedStructure?.ending || '',
              selectedState,
              selectedCountry,
              bestState: restParams.bestState || selectedState,
              advisorFlow: restParams.advisorFlow || advisorFlow,
            });
          }}
        >
          <Text style={[styles.continueBtnText, { color: colors.buttonText }, !selectedStructure && styles.continueBtnTextDisabled]}>
            {selectedStructure ? 'Continue  →' : 'Select a structure to continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StructureSelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(24) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(16), marginTop: s(34) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  mainTitle: { fontSize: s(24), fontWeight: '500', lineHeight: s(38), marginBottom: s(8) },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  goldText: { color: '#C9A84C' },
  subtitle: { fontSize: s(14), lineHeight: s(21), marginBottom: s(20) },
  listContainer: { gap: 14 },
  card: {
    borderRadius: 16,
    borderWidth: 1, padding: s(16),
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: s(12) },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: s(12),
  },
  titleContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 11, marginTop: s(2) },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center',
  },
  radioCircleSelected: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  cardDescription: { fontSize: 12.5, lineHeight: 17, marginBottom: s(12) },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: s(14) },
  tagChip: {
    borderRadius: 12,
    paddingHorizontal: s(10), paddingVertical: s(5), borderWidth: 1,
  },
  tagWarn: { borderColor: 'rgba(234, 179, 8, 0.2)', backgroundColor: 'rgba(234, 179, 8, 0.05)' },
  tagText: { fontSize: 11.3, fontWeight: '500' },
  tagWarnText: { color: '#EAB308' },
  cardDivider: { height: 1, marginBottom: s(12) },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { color: '#C9A84C', fontSize: 18, fontWeight: 'bold' },
  stateFeeText: { fontSize: 10, fontWeight: 'normal' },
  badge: { paddingHorizontal: s(10), paddingVertical: s(4), borderRadius: 12 },
  badgeGreen: { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  badgeTextGreen: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
  badgeBlue: { backgroundColor: 'rgba(59, 130, 246, 0.12)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  badgeTextBlue: { color: '#60A5FA', fontSize: 10, fontWeight: 'bold' },
  bottomBar: {
    paddingHorizontal: s(16), paddingTop: s(12),
    borderTopWidth: 1,
  },
  continueBtn: { borderRadius: 24, paddingVertical: s(14), alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { fontSize: 14, fontWeight: 'bold' },
  continueBtnTextDisabled: { opacity: 0.5 },
});
