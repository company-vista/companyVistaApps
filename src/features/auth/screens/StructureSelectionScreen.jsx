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
  const selectedItem = structures.find((struct) => struct.id === selectedStructure);
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />

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

          <Text style={styles.mainTitle}>
            Choose your <Text style={styles.italicTitle}>structure</Text>
          </Text>
          <Text style={styles.subtitle}>
            Entity types available in {isUS ? selectedState : countryName}.
          </Text>

          <View style={styles.listContainer}>
            {structures.map((item) => {
              const isSelected = selectedStructure === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedStructure(item.id)}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                      <Ionicons name={item.icon} size={18} color={isSelected ? '#C9A84C' : '#94A3B8'} />
                    </View>
                    <View style={styles.titleContainer}>
                      <Text style={[styles.cardTitle, isSelected && styles.goldText]}>{item.title}</Text>
                      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={11} color="#060913" />}
                    </View>
                  </View>

                  <Text style={styles.cardDescription}>{item.description}</Text>

                  <View style={styles.tagsRow}>
                    {item.tags.map((tag, idx) => (
                      <View key={idx} style={[styles.tagChip, tag.startsWith('⚠') && styles.tagWarn]}>
                        <Text style={[styles.tagText, tag.startsWith('⚠') && styles.tagWarnText]}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardFooterRow}>
                    {(() => {
                      const total = getTotalForStructure(item.id);
                      return (
                        <View>
                          <Text style={styles.priceText}>
                            {total > 0 ? `$${total}` : 'Custom quote'} <Text style={styles.stateFeeText}>total</Text>
                          </Text>
                          <Text style={styles.stateFeeText}>
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

      <View style={[styles.bottomBar, { paddingBottom: s(12) + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedStructure && styles.continueBtnDisabled]}
          activeOpacity={0.85}
          disabled={!selectedStructure}
          onPress={() => {
            const { selectedEnding: _omit, selectedEntity: _omitEntity, ...restParams } = route.params || {};
            const structPrice = getStructurePrice(selectedStructure);
            const combinedTotal = getTotalForStructure(selectedStructure);
            const structureMeta = getEntityByStructureId(selectedStructure);
            const matchedStructure = structures.find((item) => item.id === selectedStructure);
            // Custom-quote wale country (non-USA, koi price define nahi) me LLC structure price add MAT karo:
            // $299 leke jaane par backend ki review me bhi total $299 ban jata tha quoted country ke liye.
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
          <Text style={[styles.continueBtnText, !selectedStructure && styles.continueBtnTextDisabled]}>
            {selectedStructure ? `Continue with ${selectedItem.title}  →` : 'Select a structure to continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StructureSelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060913' },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: s(16), paddingBottom: s(24) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: s(16), marginTop: s(34) },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  mainTitle: { color: '#FFFFFF', fontSize: s(24), fontWeight: '500', lineHeight: s(38), marginBottom: s(8) },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  goldText: { color: '#C9A84C' },
  subtitle: { color: '#94A3B8', fontSize: s(14), lineHeight: s(21), marginBottom: s(20) },
  listContainer: { gap: 14 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', padding: s(16),
  },
  cardSelected: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.02)' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: s(12) },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: s(12),
  },
  iconBoxSelected: { borderColor: 'rgba(201, 168, 76, 0.3)', backgroundColor: 'rgba(201, 168, 76, 0.08)' },
  titleContainer: { flex: 1 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#64748B', fontSize: 11, marginTop: s(2) },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center',
  },
  radioCircleSelected: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  cardDescription: { color: '#94A3B8', fontSize: 11.5, lineHeight: 17, marginBottom: s(12) },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: s(14) },
  tagChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 12,
    paddingHorizontal: s(10), paddingVertical: s(5), borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tagWarn: { borderColor: 'rgba(234, 179, 8, 0.2)', backgroundColor: 'rgba(234, 179, 8, 0.05)' },
  tagText: { color: '#94A3B8', fontSize: 10, fontWeight: '500' },
  tagWarnText: { color: '#EAB308' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)', marginBottom: s(12) },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { color: '#C9A84C', fontSize: 18, fontWeight: 'bold' },
  stateFeeText: { color: '#64748B', fontSize: 10, fontWeight: 'normal' },
  badge: { paddingHorizontal: s(10), paddingVertical: s(4), borderRadius: 12 },
  badgeGreen: { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  badgeTextGreen: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
  badgeBlue: { backgroundColor: 'rgba(59, 130, 246, 0.12)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  badgeTextBlue: { color: '#60A5FA', fontSize: 10, fontWeight: 'bold' },
  bottomBar: {
    backgroundColor: '#060913', paddingHorizontal: s(16), paddingTop: s(12),
    borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  continueBtn: { backgroundColor: '#D4AF37', borderRadius: 24, paddingVertical: s(14), alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: 'rgba(212,175,55,0.35)' },
  continueBtnText: { color: '#060913', fontSize: 14, fontWeight: 'bold' },
  continueBtnTextDisabled: { color: 'rgba(6,9,19,0.5)' },
});
