import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HelpCircle,
  Building2,
  Landmark,
  ArrowRight,
  Clock,
  Check,
} from 'lucide-react-native';
import BackButton from '../../../../../components/buttons/BackButton';
import logoR from '../../../../../assets/images/logoR.png';
import { font } from '../../../../../theme/typography';
import { useThemeColors } from '../../../../../theme/colors';
import RequestChangesScreen from './RequestChangesScreen';
import { s } from '../../../../../theme/responsive';

const QuoteBreakdownScreen = ({ onBackPress, onAccept, onDecline }) => {
  const insets = useSafeAreaInsets();
  const colors  = useThemeColors();
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [showRequestChanges, setShowRequestChanges] = useState(false);
  const EUR_TO_INR = 90.16;
  const EUR_TO_USD = 1.08;
  const fmt = (eur, curr) => {
    if (curr === 'INR') return `₹${Math.round(eur * EUR_TO_INR).toLocaleString('en-IN')}`;
    if (curr === 'USD') return `$${Math.round(eur * EUR_TO_USD).toLocaleString('en-US')}`;
    return `€${eur.toLocaleString('de-DE')}`;
  };
  const price = (eur) => fmt(eur, selectedCurrency);

  const isLight = colors.mode === 'light';
  if (showRequestChanges) {
    return <RequestChangesScreen onBackPress={() => setShowRequestChanges(false)} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      {/* Header Navigation */}
      <View style={[styles.header, { marginTop: s(8) }]}>
        <BackButton onPress={onBackPress} />
        <Image source={logoR} style={styles.logoImage} resizeMode="contain" />
        <TouchableOpacity style={[styles.iconButton]}>
          <HelpCircle color="#9CA3AF" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Quote <Text style={styles.italicTitle}>breakdown</Text>
          </Text>
          <Text style={[styles.subTitle, { color: colors.muted }]}>
            #Q-2026-0412 · Meridian Global Ventures GmbH
          </Text>
        </View>

        {/* Currency Switcher */}
        <View style={[styles.currencyContainer, { backgroundColor: isLight ? '#F1F5F9' : '#0F172A', borderColor: colors.border }]}>
          {['EUR €', 'USD $', 'INR ₹'].map((curr) => {
            const currencyKey = curr.split(' ')[0];
            const isSelected = selectedCurrency === currencyKey;
            return (
              <TouchableOpacity
                key={curr}
                style={[
                  styles.currencyButton,
                  isSelected && [styles.currencyButtonActive, { backgroundColor: isLight ? '#FFFFFF' : '#1E293B', shadowColor: isLight ? '#000' : 'transparent', shadowOpacity: isLight ? 0.06 : 0, elevation: isLight ? 1 : 0 }],
                ]}
                onPress={() => setSelectedCurrency(currencyKey)}>
                <Text
                  style={[
                    styles.currencyText,
                    { color: isSelected ? '#EAB308' : colors.muted },
                  ]}>
                  {curr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 1: CompanyVista Service */}
        <View style={[styles.sectionCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(30, 41, 59, 0.5)', borderBottomColor: colors.border }]}>
            <View style={styles.sectionHeaderLeft}>
              <Building2 color="#EAB308" size={16} style={{ marginRight: s(8) }} />
              <Text style={styles.sectionHeaderText}>COMPANYVISTA SERVICE</Text>
            </View>
            <Text style={styles.sectionHeaderAmount}>{price(1850)}</Text>
          </View>

          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={styles.itemMain}>
              <Text style={styles.itemTitle}>Formation management</Text>
              <Text style={styles.itemDescription}>
                End-to-end coordination with notary and register
              </Text>
            </View>
            <Text style={styles.itemPrice}>{price(950)}</Text>
          </View>

          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={styles.itemMain}>
              <Text style={styles.itemTitle}>Registered address · 1 year</Text>
              <Text style={styles.itemDescription}>
                Berlin business address with mail forwarding
              </Text>
            </View>
            <Text style={styles.itemPrice}>{price(480)}</Text>
          </View>

          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={styles.itemMain}>
              <Text style={styles.itemTitle}>Tax & VAT registration</Text>
              <Text style={styles.itemDescription}>
                Finanzamt registration and VAT ID application
              </Text>
            </View>
            <Text style={styles.itemPrice}>{price(320)}</Text>
          </View>

          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={styles.itemMain}>
              <Text style={styles.itemTitle}>Bank account introduction</Text>
              <Text style={styles.itemDescription}>
                Introduction to 2 partner banks
              </Text>
            </View>
            <Text style={styles.includedText}>Included</Text>
          </View>

          <View style={[styles.itemRow, { borderBottomWidth: 0 }]}>
            <View style={styles.itemMain}>
              <Text style={styles.itemTitle}>Name availability check</Text>
              <Text style={styles.itemDescription}>IHK pre-clearance</Text>
            </View>
            <Text style={styles.includedText}>Included</Text>
          </View>
        </View>

        {/* Section 2: Third-Party & Government */}
        <View style={[styles.sectionCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(30, 41, 59, 0.5)', borderBottomColor: colors.border }]}>
            <View style={styles.sectionHeaderLeft}>
              <Landmark color="#60A5FA" size={16} style={{ marginRight: s(8) }} />
              <Text style={[styles.sectionHeaderText, { color: colors.muted }]}>
                THIRD-PARTY & GOVERNMENT
              </Text>
            </View>
            <Text style={[styles.sectionHeaderAmount, { color: '#60A5FA' }]}>
              {price(1240)}
            </Text>
          </View>

          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={styles.itemMain}>
              <Text style={styles.itemTitle}>Notary fees</Text>
              <Text style={styles.itemDescription}>
                Statutory deed — set by German law
              </Text>
            </View>
            <Text style={styles.itemPrice}>{price(680)}</Text>
          </View>

          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={styles.itemMain}>
              <Text style={styles.itemTitle}>Commercial register (HRB)</Text>
              <Text style={styles.itemDescription}>
                Handelregister entry fee
              </Text>
            </View>
            <Text style={styles.itemPrice}>{price(150)}</Text>
          </View>

          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={styles.itemMain}>
              <Text style={styles.itemTitle}>Certified translations</Text>
              <Text style={styles.itemDescription}>3 passports - sworn translator</Text>
            </View>
            <Text style={styles.itemPrice}>{price(270)}</Text>
          </View>

          <View style={[styles.itemRow, { borderBottomWidth: 0 }]}>
            <View style={styles.itemMain}>
              <Text style={styles.itemTitle}>Apostille & courier</Text>
              <Text style={styles.itemDescription}>Document legalisation from India, UAE, Singapore</Text>
            </View>
            <Text style={styles.itemPrice}>{price(140)}</Text>
          </View>
        </View>

        {/* Total Summary Card */}
        <View style={[styles.sectionCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: isLight ? '#EAB308' : 'rgba(234,179,8,0.35)' }]}>
          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemTitle, { color: '#9CA3AF', fontWeight: '500' }]}>Service</Text>
            <Text style={styles.itemPrice}>{price(1850)}</Text>
          </View>
          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemTitle, { color: '#9CA3AF', fontWeight: '500' }]}>Third-party</Text>
            <Text style={styles.itemPrice}>{price(1240)}</Text>
          </View>
          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemTitle, { color: '#9CA3AF', fontWeight: '500' }]}>VAT</Text>
            <Text style={[styles.itemPrice, { color: '#10B981', fontSize: 13 }]}>{selectedCurrency === 'INR' ? '₹0 · reverse charge' : selectedCurrency === 'USD' ? '$0 · reverse charge' : '€0 · reverse charge'}</Text>
          </View>
          <View style={[styles.itemRow, { borderBottomWidth: 0, paddingTop: s(8) }]}>
            <Text style={[styles.itemTitle, { color: '#FFFFFF', fontSize: 13, letterSpacing: 0.5 }]}>TOTAL</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.itemPrice, { color: '#EAB308', fontSize: 22 }]}>{price(3090)}</Text>
              <Text style={styles.convertedInline}>{selectedCurrency === 'INR' ? `≈ ${fmt(3090, 'EUR')} · ${fmt(3090, 'USD')}` : selectedCurrency === 'USD' ? `≈ ${fmt(3090, 'EUR')} · ${fmt(3090, 'INR')}` : `≈ ${fmt(3090, 'USD')} · ${fmt(3090, 'INR')}`}</Text>
            </View>
          </View>
        </View>

        {/* Info Banners */}
        <View style={styles.infoBanner}>
          <Check color="#10B981" size={14} style={{ marginRight: s(8), marginTop: s(2) }} />
          <Text style={styles.infoBannerText}>
            <Text style={{ fontWeight: '700', color: '#10B981' }}>No hidden costs.</Text>
            <Text style={{ color: '#9CA3AF' }}> Third-party fees are charged at cost with receipts. Any surplus is refunded.</Text>
          </Text>
        </View>

        <View style={[styles.infoBanner, { backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.2)' }]}>
          <Clock color="#EAB308" size={14} style={{ marginRight: s(8) }} />
          <Text style={styles.infoBannerText}>
            <Text style={{ color: '#9CA3AF' }}>Valid until </Text>
            <Text style={{ fontWeight: '700', color: '#EAB308' }}>20 June 2028</Text>
            <Text style={{ color: '#9CA3AF' }}> · 13 days left</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={[styles.footerContainer, { paddingBottom: insets.bottom + s(12), backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.declineButton, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]} onPress={() => setShowRequestChanges(true)}>
            <Text style={[styles.declineButtonText, { color: colors.text }]}>Request Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.acceptButton, { backgroundColor: colors.buttonBackground }]} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>Accept & Pay {price(3090)}</Text>
            <ArrowRight color="#000000" size={18} style={{ marginLeft: s(6) }} />
          </TouchableOpacity>
        </View>
        <Text style={styles.footerSubText}>
          Accepting locks this price for 30 days
        </Text>
      </View>
    </View>
  );
};

export default QuoteBreakdownScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C16',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: s(8),
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  logoImage: {
    width: 130,
    height: 32,
  },
  scrollContainer: {
    paddingHorizontal: s(16),
    paddingBottom: s(110),
  },
  titleContainer: {
    marginVertical: s(16),
  },
  mainTitle: {
    fontSize: font.display,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: '#EAB308',
    fontWeight: 'normal',
  },
  subTitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: s(4),
  },
  currencyContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: s(4),
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: s(20),
  },
  currencyButton: {
    flex: 1,
    paddingVertical: s(8),
    alignItems: 'center',
    borderRadius: 8,
  },
  currencyButtonActive: {
    backgroundColor: '#1E293B',
  },
  currencyText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 13,
  },
  currencyTextActive: {
    color: '#EAB308',
  },
  sectionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: s(16),
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(14),
    paddingVertical: s(12),
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionHeaderAmount: {
    color: '#EAB308',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: s(14),
    paddingVertical: s(12),
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  itemMain: {
    flex: 1,
    marginRight: s(12),
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  itemDescription: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: s(2),
  },
  itemPrice: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  includedText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 13,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#070C16',
    paddingHorizontal: s(16),
    paddingTop: s(12),
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  declineButton: {
    width: '38%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  acceptButton: {
    width: '60%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EAB308',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footerSubText: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: s(8),
  },
  convertedInline: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: s(2),
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    borderRadius: 10,
    paddingHorizontal: s(12),
    paddingVertical: s(10),
    marginBottom: s(12),
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});
