import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';

const StructureSelectionScreen = ({ navigation, route }) => {
  const { companyName = '', selectedEnding = '', selectedState = 'Delaware', selectedCountry = 'US' } = route.params || {};
  const [selectedStructure, setSelectedStructure] = useState('LLC');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const structures = [
    {
      id: 'LLC',
      title: 'LLC',
      subtitle: 'Limited Liability Company',
      icon: 'business',
      description:
        'Simplest structure with full liability protection. Pass-through taxation — no double tax. Best for consultants, e-commerce & agencies.',
      tags: ['✓ 100% foreign owned', '✓ Pass-through tax', '✓ Minimal paperwork'],
      price: '$299',
      badge: 'Most popular',
      badgeType: 'green',
    },
    {
      id: 'C-Corp',
      title: 'C-Corporation',
      subtitle: 'Standard Corporation',
      icon: 'landmark',
      description:
        'Required if you plan to raise venture capital or issue stock options. The structure every US investor expects.',
      tags: ['✓ VC-ready', '✓ Issue shares', '✓ Stock options'],
      price: '$399',
      badge: 'For startups',
      badgeType: 'blue',
    },
    {
      id: 'S-Corp',
      title: 'S-Corporation',
      subtitle: 'Small Business Corporation',
      icon: 'person',
      description:
        'Tax-efficient for US residents drawing a salary. Not available to non-resident owners.',
      tags: ['✓ Self-employment savings', '⚠️ US residents only'],
      price: null,
      badge: null,
      badgeType: null,
    },
  ];

  const selectedItem = structures.find((s) => s.id === selectedStructure);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <Text style={styles.mainTitle}>
            Choose your <Text style={styles.italicTitle}>structure</Text>
          </Text>
          <Text style={styles.subtitle}>Entity types available in Delaware.</Text>

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
                    {item.price ? (
                      <Text style={styles.priceText}>
                        {item.price} <Text style={styles.stateFeeText}>+ state fee</Text>
                      </Text>
                    ) : (
                      <View />
                    )}
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

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.continueBtn} activeOpacity={0.85} onPress={() => navigation.navigate('FounderDetails', { selectedStructure, companyName, selectedEnding, selectedState, selectedCountry })}>
          <Text style={styles.continueBtnText}>Continue with {selectedItem?.title || 'LLC'}  →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StructureSelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060913' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 90 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 34 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  mainTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '500', lineHeight: 34, marginBottom: 8 },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  goldText: { color: '#C9A84C' },
  subtitle: { color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  listContainer: { gap: 14 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', padding: 16,
  },
  cardSelected: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.02)' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  iconBoxSelected: { borderColor: 'rgba(201, 168, 76, 0.3)', backgroundColor: 'rgba(201, 168, 76, 0.08)' },
  titleContainer: { flex: 1 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#64748B', fontSize: 11, marginTop: 2 },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center',
  },
  radioCircleSelected: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  cardDescription: { color: '#94A3B8', fontSize: 11.5, lineHeight: 17, marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tagChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tagWarn: { borderColor: 'rgba(234, 179, 8, 0.2)', backgroundColor: 'rgba(234, 179, 8, 0.05)' },
  tagText: { color: '#94A3B8', fontSize: 10, fontWeight: '500' },
  tagWarnText: { color: '#EAB308' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)', marginBottom: 12 },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { color: '#C9A84C', fontSize: 18, fontWeight: 'bold' },
  stateFeeText: { color: '#64748B', fontSize: 10, fontWeight: 'normal' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeGreen: { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  badgeTextGreen: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
  badgeBlue: { backgroundColor: 'rgba(59, 130, 246, 0.12)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  badgeTextBlue: { color: '#60A5FA', fontSize: 10, fontWeight: 'bold' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#060913', paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  continueBtn: { backgroundColor: '#D4AF37', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  continueBtnText: { color: '#060913', fontSize: 14, fontWeight: 'bold' },
});
