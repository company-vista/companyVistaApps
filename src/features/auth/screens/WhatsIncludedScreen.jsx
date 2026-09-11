import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';

export default function WhatsIncludedScreen({ navigation, route }) {
  const { selectedStructure = 'LLC', companyName = '', selectedEnding = '', selectedState = 'Delaware', selectedCountry = 'US' } = route.params || {};

  const handleContinue = () => {
    navigation.navigate('OptionalAddOns', { ...(route.params || {}), selectedStructure, companyName, selectedEnding, selectedState, selectedCountry });
  };

  const handleBack = () => {
    if (navigation?.canGoBack?.()) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080e18" />
      
      {/* Header - same style as StructureSelectionScreen to avoid overlap */}
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Image source={logoR} style={styles.topLogo} />
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            What's <Text style={styles.italicTitle}>included</Text>
          </Text>
          <Text style={styles.subtitle}>
            Everything needed to trade legally — nothing held back for an upsell.
          </Text>
        </View>

        {/* Package Card */}
        <View style={styles.card}>
          {/* Main Package Header */}
          <View style={styles.packageHeader}>
            <View style={styles.iconContainerGreen}>
              <Feather name="shield" size={22} color="#00E676" />
            </View>
            <View style={styles.packageTextContainer}>
              <Text style={styles.packageTitle}>Complete formation package</Text>
              <Text style={styles.packageSubtitle}>All 5 services · no add-ons required</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.valueAmount}>$740</Text>
              <Text style={styles.valueLabel}>VALUE</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Item 1 */}
          <View style={styles.itemRow}>
            <View style={styles.iconContainer}>
              <Feather name="search" size={18} color="#00E676" />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Name availability check</Text>
              <Text style={styles.itemDescription}>
                Cleared with Delaware before filing — no rejected applications
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.strikethroughPrice}>$75</Text>
              <Text style={styles.freeBadge}>FREE</Text>
            </View>
          </View>

          {/* Item 2 */}
          <View style={styles.itemRow}>
            <View style={styles.iconContainer}>
              <Feather name="home" size={18} color="#00E676" />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Registered address - 1 year</Text>
              <Text style={styles.itemDescription}>
                Real US street address, not a PO box. Mail scanned to your dashboard
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.strikethroughPrice}>$180</Text>
              <Text style={styles.freeBadge}>FREE</Text>
            </View>
          </View>

          {/* Item 3 */}
          <View style={styles.itemRow}>
            <View style={styles.iconContainer}>
              <Feather name="user" size={18} color="#00E676" />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Registered agent - 1 year</Text>
              <Text style={styles.itemDescription}>
                Legally required in every state. We accept service of process on your behalf
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.strikethroughPrice}>$199</Text>
              <Text style={styles.freeBadge}>FREE</Text>
            </View>
          </View>

          {/* Item 4 */}
          <View style={styles.itemRow}>
            <View style={styles.iconContainer}>
              <Feather name="file-text" size={18} color="#00E676" />
            </View>
            <View style={styles.itemTextContainer}>
              <View style={styles.titleBadgeRow}>
                <Text style={styles.itemTitle}>EIN application</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>NO SSN NEEDED</Text>
                </View>
              </View>
              <Text style={styles.itemDescription}>
                Federal Tax ID filed via Form SS-4. Required for banking and Stripe
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.strikethroughPrice}>$149</Text>
              <Text style={styles.freeBadge}>FREE</Text>
            </View>
          </View>

          {/* Item 5 */}
          <View style={styles.itemRow}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="university" size={16} color="#00E676" />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Bank account assistance</Text>
              <Text style={styles.itemDescription}>
                Introductions to Mercury, Relay and Wise — all accept non-residents
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.strikethroughPrice}>$137</Text>
              <Text style={styles.freeBadge}>FREE</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Guarantee Footer inside card */}
          <View style={styles.guaranteeRow}>
            <View style={styles.checkIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#00E676" />
            </View>
            <Text style={styles.guaranteeText}>
              <Text style={styles.guaranteeBold}>100% refund guarantee</Text> — if we cannot form your company, you pay nothing.
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>2,400+</Text>
            <Text style={styles.statLabel}>COMPANIES FORMED</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>FIRST-TIME APPROVAL</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Button Area */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.continueButton} activeOpacity={0.8} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#0A111D" />
        </TouchableOpacity>

        <Text style={styles.footerSubtext}>
          $299 package + $180 Delaware state fee
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080E18',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: s(34),
    marginBottom: s(16),
    paddingHorizontal: s(16),
  },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoHighlight: {
    color: '#D4AF37',
  },
  scrollContent: {
    paddingHorizontal: s(16),
    paddingBottom: s(20),
  },
  titleContainer: {
    marginVertical: s(15),
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: s(8),
  },
  italicTitle: {
    fontStyle: 'italic',
    fontWeight: '400',
    color: '#D4AF37',
  },
  subtitle: {
    color: '#8E9BAE',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#0C1622',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    padding: s(16),
    marginTop: s(10),
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainerGreen: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageTextContainer: {
    flex: 1,
    marginLeft: s(12),
  },
  packageTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  packageSubtitle: {
    color: '#8E9BAE',
    fontSize: 12,
    marginTop: s(2),
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueAmount: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: '700',
  },
  valueLabel: {
    color: '#00E676',
    fontSize: 10,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: s(14),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: s(16),
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: s(2),
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: s(12),
    marginRight: s(8),
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(21, 101, 192, 0.3)',
    borderColor: '#1E88E5',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: s(6),
    paddingVertical: s(2),
    marginLeft: s(6),
  },
  badgeText: {
    color: '#64B5F6',
    fontSize: 9,
    fontWeight: '700',
  },
  itemDescription: {
    color: '#7C8BA1',
    fontSize: 12,
    marginTop: s(3),
    lineHeight: 16,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  strikethroughPrice: {
    color: '#5B6B7C',
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  freeBadge: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '700',
    marginTop: s(1),
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIconContainer: {
    marginRight: s(10),
  },
  guaranteeText: {
    color: '#8E9BAE',
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  guaranteeBold: {
    color: '#00E676',
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: s(16),
  },
  statBox: {
    flex: 0.48,
    backgroundColor: '#0C1622',
    borderRadius: 12,
    paddingVertical: s(14),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statNumber: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: '#6C7A8E',
    fontSize: 9,
    fontWeight: '700',
    marginTop: s(4),
    letterSpacing: 0.5,
  },
  footerContainer: {
    paddingHorizontal: s(16),
    paddingTop: s(10),
    paddingBottom: s(16),
    backgroundColor: '#080E18',
  },
  continueButton: {
    backgroundColor: '#D4AF37',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#0A111D',
    fontSize: 16,
    fontWeight: '700',
    marginRight: s(8),
  },
  footerSubtext: {
    color: '#5B6B7C',
    fontSize: 12,
    textAlign: 'center',
    marginTop: s(10),
  },
});
