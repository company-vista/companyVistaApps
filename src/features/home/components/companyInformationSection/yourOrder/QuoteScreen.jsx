import React from 'react';
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

const QuoteScreen = ({ onBackPress, onViewBreakdown }) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
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
            <Text style={[styles.quoteHeader, { color: colors.text }]}>Quote #Q-2026-0412</Text>
            <Text style={[styles.quoteSubText, { color: colors.muted }]}>
              Prepared by Anita Desai · German desk · 1 hour ago
            </Text>
          </View>
        </View>

        {/* Breakdown Card */}
        <View style={[styles.breakdownCard, { backgroundColor: isLight ? '#FFFFFF' : '#121A2C', borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.muted }]}>CompanyVista service</Text>
            <Text style={[styles.value, { color: colors.text }]}>€1,850</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.muted }]}>Third-party & government</Text>
            <Text style={[styles.value, { color: colors.text }]}>€1,240</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.muted }]}>TOTAL</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalAmount}>€3,090</Text>
              <Text style={[styles.convertedAmount, { color: colors.muted }]}>≈ $3,340 USD</Text>
            </View>
          </View>
        </View>

        {/* Validity Banner */}
        <View style={[styles.validityCard, { backgroundColor: isLight ? '#FFFFFF' : '#121A2C', borderColor: colors.border }]}>
          <Clock color="#EAB308" size={18} style={{ marginRight: s(8) }} />
          <Text style={[styles.validityText, { color: colors.muted }]}>
            Valid until <Text style={styles.boldText}>20 June 2026</Text> · 13
            days remaining
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

        {/* Note Box */}
        <View style={[styles.noteCard, { backgroundColor: isLight ? '#FFFFFF' : '#121A2C', borderColor: colors.border }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AD</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>Note from Anita</Text>
            <Text style={[styles.noteDescription, { color: colors.muted }]}>
              Your €25,000 capital can be deposited in two tranches — I've
              priced the standard single-deposit route. Ask if you'd prefer the
              split option.
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonBackground }]} activeOpacity={0.8} onPress={onViewBreakdown}>
          <Text style={styles.buttonText}>View Full Breakdown</Text>
          <ArrowRight color="#000000" size={18} style={{ marginLeft: s(8) }} />
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
