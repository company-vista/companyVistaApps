import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { font } from '../../../../theme/typography';
import Ionicons from 'react-native-vector-icons/Ionicons';

function ServiceCard({
  title,
  isPaid = true,
  paymentType = 'Direct Payment',
  companyName,
  requestedDate,
  amount,
  icon = 'briefcase-outline',
  onPress,
  isLight,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, isLight ? styles.cardLight : styles.cardDark]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, isLight ? styles.iconBoxLight : styles.iconBoxDark]}>
          <Ionicons name={icon} size={20} color="#F59E0B" />
        </View>

        <View style={styles.titleWrap}>
          <Text style={[styles.cardTitle, isLight ? styles.textLight : styles.textDark]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.subInfo, isLight ? styles.subLight : styles.subDark]} numberOfLines={1}>
            <Ionicons name="business-outline" size={12} color="#6B7280" /> {companyName}
            <Text style={styles.dot}> • </Text>Requested {requestedDate}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.amount}>{amount}</Text>
          <View style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.pendingBadge]}>
            <Ionicons
              name={isPaid ? 'checkmark-circle' : 'time-outline'}
              size={12}
              color={isPaid ? '#10B981' : '#F59E0B'}
            />
            <Text style={[styles.statusText, { color: isPaid ? '#10B981' : '#F59E0B' }]}>
              {isPaid ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={[styles.typeBadge, isLight ? styles.typeBadgeLight : styles.typeBadgeDark]}>
          <Ionicons name="card-outline" size={12} color={isLight ? '#475569' : '#94A3B8'} />
          <Text style={[styles.typeBadgeText, isLight ? styles.typeBadgeTextLight : styles.typeBadgeTextDark]}>
            {paymentType}
          </Text>
        </View>

        <View style={styles.receiptRow}>
          <Text style={[styles.receiptLabel, isLight ? styles.subLight : styles.subDark]}>View receipt</Text>
          <Ionicons name="chevron-forward" size={14} color="#F59E0B" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#0B0E17',
    borderColor: '#1F2937',
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#E5E7EB',
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
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
  },
  iconBoxLight: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  titleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: font.base,
    fontWeight: '700',
    marginBottom: 3,
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLight: {
    color: '#111827',
  },
  subInfo: {
    fontSize: font.sm,
  },
  subDark: {
    color: '#6B7280',
  },
  subLight: {
    color: '#64748B',
  },
  dot: {
    color: '#4B5563',
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    color: '#F59E0B',
    fontSize: font.xl,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#059669',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: '#B45309',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeBadgeDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  typeBadgeLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  typeBadgeText: {
    fontSize: font.xs,
    fontWeight: '500',
  },
  typeBadgeTextDark: {
    color: '#94A3B8',
  },
  typeBadgeTextLight: {
    color: '#475569',
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  receiptLabel: {
    fontSize: font.sm,
    fontWeight: '500',
  },
});
export default ServiceCard;
