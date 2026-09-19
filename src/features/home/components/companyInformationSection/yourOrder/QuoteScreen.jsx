import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HelpCircle,
  FileText,
  Clock,
  Check,
  ArrowRight,
} from 'lucide-react-native';
import BackButton from '../../../../../components/buttons/BackButton';
import logoR from '../../../../../assets/images/logoR.png';
import { font } from '../../../../../theme/typography';
import { useThemeColors } from '../../../../../theme/colors';
import { s } from '../../../../../theme/responsive';
import { useAppSelector } from '../../../../../store/hooks';
import { fetchQuote, isQuoteReady, formatCurrency, formatConverted } from './api/quoteApi';

const QuoteScreen = ({ onBackPress, onViewBreakdown, amount = 0, selectedCompany = null, quote: quoteProp = null }) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
  const token = useAppSelector((state) => state.auth.token);
  const pendingOrder = useAppSelector((state) => state.auth.pendingOrderData);
  const authUser = useAppSelector((state) => state.auth.user);
  const signupFullName = pendingOrder?.fullName || authUser?.name || [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') || selectedCompany?.name || 'User';
  const signupInitials = signupFullName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'U';
  const signupFirstName = signupFullName.trim().split(/\s+/)[0] || 'User';

  const [quote, setQuote] = useState(quoteProp || null);
  const [loadingQuote, setLoadingQuote] = useState(!quoteProp);
  useEffect(() => {
    if (quoteProp) { setQuote(quoteProp); setLoadingQuote(false); return; }
    let mounted = true;
    setLoadingQuote(true);
    const cid = selectedCompany?.id || selectedCompany?._id || pendingOrder?.companyId;
    fetchQuote({ companyId: cid, token, invoiceId: pendingOrder?.orderId })
      .then(res => { if (mounted) setQuote(res.quote); })
      .finally(() => { if (mounted) setLoadingQuote(false); });
    return () => { mounted = false; };
  }, [selectedCompany?.id, selectedCompany?._id, pendingOrder?.companyId, pendingOrder?.orderId, token, quoteProp]);

  const effectiveQuote = quote;
  const rawAmount = (amount && Number(amount) > 0 ? amount : [effectiveQuote?.total, effectiveQuote?.totalAmount, effectiveQuote?.raw?.total, effectiveQuote?.raw?.totalAmount].find(v => Number(v) > 0) ?? 0);
  const numericAmount = Number(rawAmount) || 0;
  const hasAmount = isQuoteReady(effectiveQuote) && numericAmount > 0;
  const companyVistaTotal = Number(effectiveQuote?.companyVista?.total ?? 0);
  const thirdPartyTotal = Number(effectiveQuote?.thirdParty?.total ?? 0);
  const quoteCurrency = String(effectiveQuote?.currency || 'EUR').toUpperCase();
  // displayTotal ab admin ki currency me, convert bhi dikhayega
  const displayTotal = hasAmount ? formatCurrency(numericAmount, quoteCurrency) : formatCurrency(0, quoteCurrency);
  const otherCurr = quoteCurrency === 'EUR' ? 'USD' : quoteCurrency === 'USD' ? 'EUR' : 'EUR';
  const displayConverted = hasAmount ? `≈ ${formatConverted(numericAmount, quoteCurrency, otherCurr)} ${otherCurr}` : `≈ ${formatCurrency(0, otherCurr)} ${otherCurr}`;

  // Format validUntil: "2028-06-20T00:00:00.000Z" / "20 June 2028" / "2028-06-20" -> "20 June 2028"
  const formatValidUntil = (val) => {
    if (!val) return '—';
    const str = String(val).trim();
    // already formatted like "20 June 2028" (contains month name) -> return as is
    if (/[A-Za-z]{3,}\s+\d{1,2}|\d{1,2}\s+[A-Za-z]{3,}/.test(str) && str.length < 30) {
      // normalize to Title case
      return str;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return str;
  };
  const formattedValidUntil = formatValidUntil(effectiveQuote?.validUntil);
  // Days left: API ka daysRemaining use karo, nahi to validUntil se calculate karo
  const getDaysRemaining = (validUntil, apiDays) => {
    if (apiDays != null && !isNaN(Number(apiDays))) return Number(apiDays);
    if (!validUntil) return null;
    const target = new Date(String(validUntil).trim());
    // Try parsing formatted "20 June 2028" as well
    let t = target;
    if (isNaN(t.getTime())) {
      // try Date parse with en-GB format already handled
      return null;
    }
    const now = new Date();
    // strip time for day diff
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const diffMs = end - start;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };
  const daysRemaining = getDaysRemaining(effectiveQuote?.validUntil, effectiveQuote?.daysRemaining);
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Navigation */}
        <View style={[styles.header, { marginTop: s(8) }]}>
          <BackButton onPress={onBackPress} />
          <Image source={logoR} style={styles.logoImage} resizeMode="contain" />
          <TouchableOpacity style={styles.iconButton}>
            <HelpCircle color="#9CA3AF" size={20} />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Your quote is <Text style={styles.italicTitle}>ready</Text>
          </Text>
        </View>

        {/* Quote Info Card */}
        <View style={[styles.quoteCard, { backgroundColor: isLight ? '#FFFFFF' : '#121A2C', borderColor: colors.border }]}>
          <View style={styles.fileIconContainer}>
            <FileText color="#EAB308" size={24} />
          </View>
          <View style={styles.quoteDetails}>
            <Text style={[styles.quoteHeader, { color: colors.text }]}>Quote #{effectiveQuote?.quoteId || '—'}</Text>
            <Text style={[styles.quoteSubText, { color: colors.muted }]}>
              Prepared by {effectiveQuote?.preparedBy || '—'} · {effectiveQuote?.preparedByRole || ''} · {effectiveQuote?.preparedAt || ''}
            </Text>
          </View>
          {loadingQuote && <ActivityIndicator size="small" color={colors.muted} style={{ marginLeft: s(8) }} />}
        </View>

        {/* Breakdown Card - amounts admin API se - currency auto */}
        <View style={[styles.breakdownCard, { backgroundColor: isLight ? '#FFFFFF' : '#121A2C', borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.muted }]}>CompanyVista service</Text>
            <Text style={[styles.value, { color: colors.text }]}>{hasAmount ? formatCurrency(companyVistaTotal, quoteCurrency) : formatCurrency(0, quoteCurrency)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.muted }]}>Third-party & government</Text>
            <Text style={[styles.value, { color: colors.text }]}>{hasAmount ? formatCurrency(thirdPartyTotal, quoteCurrency) : formatCurrency(0, quoteCurrency)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.muted }]}>TOTAL</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalAmount}>{displayTotal}</Text>
              <Text style={[styles.convertedAmount, { color: colors.muted }]}>{displayConverted}</Text>
            </View>
          </View>
          {!hasAmount && (
            <Text style={[styles.convertedAmount, { color: colors.muted, textAlign: 'center', marginTop: 8 }]}>
              Awaiting admin to add quote amount
            </Text>
          )}
        </View>

        {/* Validity Banner - formatted validUntil + days left */}
        <View style={[styles.validityCard, { backgroundColor: isLight ? '#FFFFFF' : '#121A2C', borderColor: colors.border }]}>
          <Clock color="#EAB308" size={18} style={{ marginRight: s(8) }} />
          <Text style={[styles.validityText, { color: colors.muted }]}>
            Valid until <Text style={styles.boldText}>{formattedValidUntil}</Text> · {daysRemaining != null ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining` : '— days remaining'}
          </Text>
        </View>

        {/* Included Items Section */}
        <View style={styles.sectionHeaderContainer}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.sectionHeader, { color: colors.muted }]}>WHAT'S INCLUDED</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.grid}>
          <View style={styles.gridColumn}>
            <View style={styles.checkItem}>
              <Check color="#22C55E" size={16} />
              <Text style={[styles.checkText, { color: colors.text }]}>Name reservation</Text>
            </View>
            <View style={styles.checkItem}>
              <Check color="#22C55E" size={16} />
              <Text style={[styles.checkText, { color: colors.text }]}>Registered address</Text>
            </View>
            <View style={styles.checkItem}>
              <Check color="#22C55E" size={16} />
              <Text style={[styles.checkText, { color: colors.text }]}>Tax registration</Text>
            </View>
          </View>

          <View style={styles.gridColumn}>
            <View style={styles.checkItem}>
              <Check color="#22C55E" size={16} />
              <Text style={[styles.checkText, { color: colors.text }]}>Notary coordination</Text>
            </View>
            <View style={styles.checkItem}>
              <Check color="#22C55E" size={16} />
              <Text style={[styles.checkText, { color: colors.text }]}>Commercial register</Text>
            </View>
            <View style={styles.checkItem}>
              <Check color="#22C55E" size={16} />
              <Text style={[styles.checkText, { color: colors.text }]}>Bank introduction</Text>
            </View>
          </View>
        </View>

        {/* Note Box - signup user */}
        <View style={[styles.noteCard, { backgroundColor: isLight ? '#FFFFFF' : '#121A2C', borderColor: colors.border }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{signupInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>Note for {signupFirstName}</Text>
            <Text style={[styles.noteDescription, { color: colors.muted }]}>
              {effectiveQuote?.noteForCustomer ? effectiveQuote.noteForCustomer.replace('{firstName}', signupFirstName) : `Hi ${signupFirstName}, awaiting admin quote details.`}
            </Text>
          </View>
        </View>

        {/* CTA Button - disabled till admin adds amount */}
        <TouchableOpacity
          disabled={!hasAmount || loadingQuote}
          style={[styles.button, { backgroundColor: hasAmount ? colors.buttonBackground : colors.border, opacity: hasAmount && !loadingQuote ? 1 : 0.6 }]}
          activeOpacity={0.8}
          onPress={hasAmount ? () => onViewBreakdown?.(effectiveQuote) : undefined}
        >
          {loadingQuote ? <ActivityIndicator size="small" color={colors.muted} /> : null}
          <Text style={[styles.buttonText, (!hasAmount || loadingQuote) && { color: colors.muted }]}>{loadingQuote ? 'Loading quote...' : hasAmount ? 'View Full Breakdown' : 'Awaiting Quote Amount'}</Text>
          {!loadingQuote && <ArrowRight color={hasAmount ? '#000000' : colors.muted} size={18} style={{ marginLeft: s(8) }} />}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default QuoteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B101D',
  },
  scrollContainer: {
    paddingHorizontal: s(20),
    paddingVertical: s(10),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: s(24),
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161F33',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26334D',
  },
  logoImage: {
    width: 130,
    height: 32,
  },
  titleContainer: {
    marginBottom: s(20),
  },
  mainTitle: {
    fontSize: font.display,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: '#EAB308',
    fontWeight: 'normal',
  },
  subTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: s(4),
  },
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: '#121A2C',
    borderRadius: 12,
    padding: s(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26334D',
    marginBottom: s(16),
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    marginRight: s(12),
  },
  quoteDetails: {
    flex: 1,
  },
  quoteHeader: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quoteSubText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: s(2),
  },
  breakdownCard: {
    backgroundColor: '#121A2C',
    borderRadius: 12,
    padding: s(16),
    borderWidth: 1,
    borderColor: '#26334D',
    marginBottom: s(16),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: s(12),
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  value: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#26334D',
    marginVertical: s(12),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  totalLabel: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: s(6),
  },
  totalAmount: {
    color: '#EAB308',
    fontSize: 28,
    fontWeight: '500',
  },
  convertedAmount: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: s(2),
  },
  validityCard: {
    flexDirection: 'row',
    backgroundColor: '#121A2C',
    borderRadius: 20,
    paddingVertical: s(12),
    paddingHorizontal: s(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26334D',
    marginBottom: s(24),
  },
  validityText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  boldText: {
    color: '#EAB308',
    fontWeight: 'bold',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(16),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#26334D',
  },
  sectionHeader: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: s(10),
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: s(24),
  },
  gridColumn: {
    flex: 1,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(12),
  },
  checkText: {
    color: '#D1D5DB',
    fontSize: 13,
    marginLeft: s(8),
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#121A2C',
    borderRadius: 12,
    padding: s(16),
    borderWidth: 1,
    borderColor: '#26334D',
    marginBottom: s(24),
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noteTitle: {
    color: '#60A5FA',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: s(4),
  },
  noteDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#EAB308',
    borderRadius: 24,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: s(20),
  },
  buttonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
