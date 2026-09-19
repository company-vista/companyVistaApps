import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Modal,
  TextInput,
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
import { convertAmount, formatCurrency, acceptQuote, declineQuote, isQuoteReady } from './api/quoteApi';
import { useAppSelector } from '../../../../../store/hooks';
import Toast from 'react-native-toast-message';
import { ActivityIndicator } from 'react-native';

const QuoteBreakdownScreen = ({ onBackPress, onAccept, onDecline, quote }) => {
  const [localQuote, setLocalQuote] = useState(quote || null);
  React.useEffect(() => { setLocalQuote(quote || null); }, [quote]);
  const effectiveQuote = localQuote || quote || null;
  const qTotal = Number(effectiveQuote?.total ?? 3090);
  const qService = Number(effectiveQuote?.companyVista?.total ?? 1850);
  const qThird = Number(effectiveQuote?.thirdParty?.total ?? 1240);
  const qItemsService = effectiveQuote?.companyVista?.items || [];
  const qItemsThird = effectiveQuote?.thirdParty?.items || [];
  const quoteCurrency = String(effectiveQuote?.currency || 'EUR').toUpperCase();
  const insets = useSafeAreaInsets();
  const colors  = useThemeColors();
  const [selectedCurrency, setSelectedCurrency] = useState(quoteCurrency);
  const [showRequestChanges, setShowRequestChanges] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  React.useEffect(() => { setSelectedCurrency(quoteCurrency); }, [quoteCurrency]);

  const token = useAppSelector(s => s.auth.token);
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  const user = useAppSelector(s => s.auth.user);
  const companyId = effectiveQuote?.companyId || pendingOrder?.companyId || user?.companies?.[0]?._id || user?.companies?.[0]?.id || null;
  const clientId = pendingOrder?.clientId || user?._id || user?.id || user?.userId || user?.clientId || null;

  const isReady = isQuoteReady(effectiveQuote) || effectiveQuote?.isDummy;

  const handleAccept = async () => {
    // API tabhi call hogi jab quote ban jayega (isReady)
    if (!isReady) {
      Toast.show({ type: 'info', text1: 'Quote not ready yet', text2: 'Please wait until admin prepares the quote' });
      return;
    }
    // dummy quote -> skip API, go directly to payment
    if (effectiveQuote?.isDummy || !companyId) {
      onAccept?.(effectiveQuote);
      return;
    }
    setAccepting(true);
    try {
      const res = await acceptQuote({ companyId, token, clientId });
      if (res.isSuccess) {
        // if API returns updated quote with validUntil, refresh localQuote
        if (res.quote?.validUntil) {
          setLocalQuote(prev => ({ ...(prev || effectiveQuote), ...res.quote }));
        } else if (res.data?.quote?.validUntil) {
          const q = res.data.quote;
          setLocalQuote(prev => ({ ...(prev || effectiveQuote), validUntil: q.validUntil || q.validTill || q.expiryDate, daysRemaining: q.daysRemaining ?? q.daysLeft }));
        }
        Toast.show({ type: 'success', text1: res.message || 'Quote accepted, proceed to payment' });
        onAccept?.(effectiveQuote, res.data);
      } else {
        Toast.show({ type: 'error', text1: res.error || 'Failed to accept quote' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: err?.message || 'Network error' });
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!isReady) {
      Toast.show({ type: 'info', text1: 'Quote not ready yet' });
      return;
    }
    if (effectiveQuote?.isDummy || !companyId) {
      Toast.show({ type: 'info', text1: 'Quote declined (demo)' });
      onDecline?.(effectiveQuote);
      setShowDeclineModal(false);
      return;
    }
    setDeclining(true);
    try {
      const res = await declineQuote({ companyId, token, clientId, reason: declineReason });
      if (res.isSuccess) {
        if (res.quote?.validUntil) {
          setLocalQuote(prev => ({ ...(prev || effectiveQuote), ...res.quote }));
        }
        Toast.show({ type: 'success', text1: res.message || 'Quote declined' });
        setShowDeclineModal(false);
        setDeclineReason('');
        onDecline?.(effectiveQuote, res.data);
      } else {
        Toast.show({ type: 'error', text1: res.error || 'Failed to decline quote' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: err?.message || 'Network error' });
    } finally {
      setDeclining(false);
    }
  };
  // Admin jis currency me bhejega usi se convert hoga
  const fmt = (amount, curr) => {
    const target = String(curr || selectedCurrency).toUpperCase();
    const converted = convertAmount(amount, quoteCurrency, target);
    return formatCurrency(converted, target);
  };
  const price = (amount) => fmt(amount, selectedCurrency);

  const isLight = colors.mode === 'light';
  if (showRequestChanges) {
    return <RequestChangesScreen quote={effectiveQuote} companyId={effectiveQuote?.companyId} onBackPress={() => setShowRequestChanges(false)} />;
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
            #{effectiveQuote?.quoteId || 'Q-2026-0412'} · {effectiveQuote?.companyId ? `Company ${String(effectiveQuote.companyId).slice(-6)}` : 'Meridian Global Ventures GmbH'} {effectiveQuote?.isDummy ? '(Dummy)' : ''}
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
            <Text style={styles.sectionHeaderAmount}>{price(qService)}</Text>
          </View>

          {(qItemsService.length ? qItemsService : [
            { label: 'Formation management', desc: 'End-to-end coordination with notary and register', amount: 950 },
            { label: 'Registered address · 1 year', desc: 'Berlin business address with mail forwarding', amount: 480 },
            { label: 'Tax & VAT registration', desc: 'Finanzamt registration and VAT ID application', amount: 320 },
            { label: 'Bank account introduction', desc: 'Introduction to 2 partner banks', amount: 0, included: true },
            { label: 'Name availability check', desc: 'IHK pre-clearance', amount: 0, included: true },
          ]).map((it, idx, arr) => (
            <View key={`cv-${idx}`} style={[styles.itemRow, { borderBottomWidth: idx === arr.length - 1 ? 0 : 1, borderBottomColor: colors.border }]}>
              <View style={styles.itemMain}>
                <Text style={styles.itemTitle}>{it.label}</Text>
                {!!it.desc && <Text style={styles.itemDescription}>{it.desc}</Text>}
              </View>
              {it.included || Number(it.amount) === 0 ? <Text style={styles.includedText}>Included</Text> : <Text style={styles.itemPrice}>{price(it.amount)}</Text>}
            </View>
          ))}
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
              {price(qThird)}
            </Text>
          </View>

          {(qItemsThird.length ? qItemsThird : [
            { label: 'Notary fees', desc: 'Statutory deed — set by German law', amount: 680 },
            { label: 'Commercial register (HRB)', desc: 'Handelregister entry fee', amount: 150 },
            { label: 'Certified translations', desc: '3 passports - sworn translator', amount: 270 },
            { label: 'Apostille & courier', desc: 'Document legalisation from India, UAE, Singapore', amount: 140 },
          ]).map((it, idx, arr) => (
            <View key={`tp-${idx}`} style={[styles.itemRow, { borderBottomWidth: idx === arr.length - 1 ? 0 : 1, borderBottomColor: colors.border }]}>
              <View style={styles.itemMain}>
                <Text style={styles.itemTitle}>{it.label}</Text>
                {!!it.desc && <Text style={styles.itemDescription}>{it.desc}</Text>}
              </View>
              {it.included || Number(it.amount) === 0 ? <Text style={styles.includedText}>Included</Text> : <Text style={styles.itemPrice}>{price(it.amount)}</Text>}
            </View>
          ))}
        </View>

        {/* Total Summary Card */}
        <View style={[styles.sectionCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: isLight ? '#EAB308' : 'rgba(234,179,8,0.35)' }]}>
          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemTitle, { color: '#9CA3AF', fontWeight: '500' }]}>Service</Text>
            <Text style={styles.itemPrice}>{price(qService)}</Text>
          </View>
          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemTitle, { color: '#9CA3AF', fontWeight: '500' }]}>Third-party</Text>
            <Text style={styles.itemPrice}>{price(qThird)}</Text>
          </View>
          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemTitle, { color: '#9CA3AF', fontWeight: '500' }]}>VAT</Text>
            <Text style={[styles.itemPrice, { color: '#10B981', fontSize: 13 }]}>{selectedCurrency === 'INR' ? '₹0 · reverse charge' : selectedCurrency === 'USD' ? '$0 · reverse charge' : '€0 · reverse charge'}</Text>
          </View>
          <View style={[styles.itemRow, { borderBottomWidth: 0, paddingTop: s(8) }]}>
            <Text style={[styles.itemTitle, { color: '#FFFFFF', fontSize: 13, letterSpacing: 0.5 }]}>TOTAL</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.itemPrice, { color: '#EAB308', fontSize: 22 }]}>{price(qTotal)}</Text>
              <Text style={styles.convertedInline}>{selectedCurrency === 'INR' ? `≈ ${fmt(qTotal, 'EUR')} · ${fmt(qTotal, 'USD')}` : selectedCurrency === 'USD' ? `≈ ${fmt(qTotal, 'EUR')} · ${fmt(qTotal, 'INR')}` : `≈ ${fmt(qTotal, 'USD')} · ${fmt(qTotal, 'INR')}`}</Text>
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
            <Text style={{ fontWeight: '700', color: '#EAB308' }}>{effectiveQuote?.validUntil || '20 June 2028'}</Text>
            <Text style={{ color: '#9CA3AF' }}> · {effectiveQuote?.daysRemaining ?? 13} days left</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={[styles.footerContainer, { paddingBottom: insets.bottom + s(12), backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.declineButton, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]} onPress={() => setShowRequestChanges(true)}>
            <Text style={[styles.declineButtonText, { color: colors.text }]}>Request Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={accepting || !isReady}
            style={[styles.acceptButton, { backgroundColor: colors.buttonBackground, opacity: accepting || !isReady ? 0.6 : 1 }]}
            onPress={handleAccept}
          >
            {accepting ? (
              <ActivityIndicator size="small" color="#000000" style={{ marginRight: s(6) }} />
            ) : null}
            <Text style={styles.acceptButtonText}>{accepting ? 'Accepting...' : `Accept & Pay ${price(qTotal)}`}</Text>
            {!accepting && <ArrowRight color="#000000" size={18} style={{ marginLeft: s(6) }} />}
          </TouchableOpacity>
        </View>
        <Text style={styles.footerSubText}>
          Accepting locks this price for 30 days
        </Text>
        {/* Decline quote - API: POST /quote/:companyId/decline - only when quote ready */}
        <TouchableOpacity
          disabled={declining || !isReady}
          style={{ marginTop: s(8), alignSelf: 'center', opacity: declining || !isReady ? 0.6 : 1 }}
          onPress={() => setShowDeclineModal(true)}
        >
          <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>
            {declining ? 'Declining...' : 'Decline quote'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Decline Reason Modal */}
      <Modal visible={showDeclineModal} transparent animationType="fade" onRequestClose={() => setShowDeclineModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isLight ? '#FFFFFF' : '#0F172A', borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Decline quote?</Text>
            <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
              Valid until {effectiveQuote?.validUntil || '20 June 2028'} · {effectiveQuote?.daysRemaining ?? 13} days left
            </Text>
            <TextInput
              style={[styles.reasonInput, { backgroundColor: isLight ? '#F8FAFC' : '#070C16', borderColor: colors.border, color: colors.text }]}
              placeholder="Reason (optional)"
              placeholderTextColor={colors.muted}
              value={declineReason}
              onChangeText={setDeclineReason}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalCancel, { borderColor: colors.border, backgroundColor: isLight ? '#FFFFFF' : '#070C16' }]}
                onPress={() => { setShowDeclineModal(false); setDeclineReason(''); }}
                disabled={declining}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDecline, { opacity: declining ? 0.6 : 1 }]}
                onPress={handleDecline}
                disabled={declining}
              >
                {declining ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.modalDeclineText}>Decline</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(16),
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: s(16),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: s(4),
  },
  modalSubtitle: {
    fontSize: 12,
    marginBottom: s(12),
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: s(12),
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 13,
    marginBottom: s(16),
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancel: {
    paddingHorizontal: s(16),
    paddingVertical: s(10),
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancelText: {
    fontWeight: '600',
    fontSize: 13,
  },
  modalDecline: {
    backgroundColor: '#EF4444',
    paddingHorizontal: s(16),
    paddingVertical: s(10),
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDeclineText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
