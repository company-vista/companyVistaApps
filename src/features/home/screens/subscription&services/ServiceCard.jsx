import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { font } from '../../../../theme/typography';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../theme/colors';
import { s } from '../../../../theme/responsive';

const STATUS_META = {
  pending: { label: 'Pending Review', icon: 'time-outline', color: themePalette.hex_f59f0bb6, bg: themePalette.rgba_245_158_11_0_12, border: themePalette.hex_b45309 },
  quoted: { label: 'Quote Ready', icon: 'document-text-outline', color: themePalette.hex_3b82f6, bg: themePalette.rgba_59_130_246_0_12, border: themePalette.hex_2563eb },
  paid: { label: 'Paid', icon: 'checkmark-circle', color: themePalette.hex_10b981, bg: themePalette.rgba_16_185_129_0_12, border: themePalette.hex_059669 },
  'in-progress': { label: 'In Progress', icon: 'refresh', color: themePalette.hex_3b82f6, bg: themePalette.rgba_59_130_246_0_12, border: themePalette.hex_2563eb },
  completed: { label: 'Completed', icon: 'checkmark-circle', color: themePalette.hex_10b981, bg: themePalette.rgba_16_185_129_0_12, border: themePalette.hex_059669 },
  rejected: { label: 'Rejected', icon: 'close-circle', color: themePalette.hex_f43f5e, bg: themePalette.rgba_244_63_94_0_12, border: themePalette.hex_be123c },
};

function ServiceCard({
  title,
  status = 'pending',
  paymentType = 'Direct Payment',
  companyName,
  requestedDate,
  amount,
  icon = 'briefcase-outline',
  onPress,
  isLight,
}) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, isLight ? styles.cardLight : styles.cardDark]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, isLight ? styles.iconBoxLight : styles.iconBoxDark]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>

        <View style={styles.titleWrap}>
          <Text style={[styles.cardTitle, isLight ? styles.textLight : styles.textDark]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.subInfo, isLight ? styles.subLight : styles.subDark]} numberOfLines={1}>
            <Ionicons name="business-outline" size={14} color={colors.muted} /> {companyName}
          </Text>
        </View>

        <View style={styles.topRight}>
        <View style={[styles.statusBadge, { backgroundColor: colors.surface, borderColor: meta.border }]}>
          <Ionicons name={meta.icon} size={12} color={meta.color} />
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
          <Text style={styles.amount}>{amount}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={[styles.typeBadge, isLight ? styles.typeBadgeLight : styles.typeBadgeDark]}>
          <Ionicons name="card-outline" size={18} color={isLight ? themePalette.hex_475569 : themePalette.hex_94a3b8} />
          <Text style={[styles.typeBadgeText, isLight ? styles.typeBadgeTextLight : styles.typeBadgeTextDark]}>
            {paymentType}
          </Text>
        </View>

        <Text style={[styles.dateText, isLight ? styles.subLight : styles.subDark]}>Requested {requestedDate}</Text>
      </View>
    </Pressable>
  );
}

const styles = makeThemeStyles(() => StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: s(12),
    paddingVertical: 14,
    marginHorizontal: s(12),
    marginVertical: 6,
    shadowColor: themePalette.hex_000,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardDark: {
    backgroundColor: themePalette.hex_0b0e17,
    borderColor: themePalette.hex_1f2937,
  },
  cardLight: {
    backgroundColor: themePalette.hex_ffffff,
    borderColor: themePalette.hex_e5e7eb,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDark: {
    backgroundColor: themePalette.rgba_245_158_11_0_14,
  },
  iconBoxLight: {
    backgroundColor: themePalette.rgba_245_158_11_0_12,
  },
  titleWrap: {
    flex: 1,
  },
  topRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  cardTitle: {
    fontSize: font.base,
    fontWeight: '700',
    marginBottom: 3,
  },
  textDark: {
    color: themePalette.hex_ffffff,
  },
  textLight: {
    color: themePalette.hex_111827,
  },
  subInfo: {
    fontSize: font.sm,
  },
  subDark: {
    color: themePalette.hex_6b7280,
  },
  subLight: {
    color: themePalette.hex_64748b,
  },
  dateText: {
    fontSize: font.sm,
    fontWeight: '500',
  },
  amount: {
    color: themePalette.hex_f59e0b,
    fontSize: font.xl,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: s(8),
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: font.xs,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: themePalette.rgba_148_163_184_0_2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: s(10),
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeBadgeDark: {
    backgroundColor: themePalette.hex_1e293b,
    borderColor: themePalette.hex_334155,
  },
  typeBadgeLight: {
    backgroundColor: themePalette.hex_f1f5f9,
    borderColor: themePalette.hex_cbd5e1,
  },
  typeBadgeText: {
    fontSize: font.xs,
    fontWeight: '500',
  },
  typeBadgeTextDark: {
    color: themePalette.hex_94a3b8,
  },
  typeBadgeTextLight: {
    color: themePalette.hex_475569,
  },
}));
export default ServiceCard;
