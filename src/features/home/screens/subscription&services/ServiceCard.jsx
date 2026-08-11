import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { font } from '../../../../theme/typography';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STATUS_META = {
  pending: { label: 'Pending Review', icon: 'time-outline', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: '#B45309' },
  quoted: { label: 'Quote Ready', icon: 'document-text-outline', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', border: '#2563EB' },
  paid: { label: 'Paid', icon: 'checkmark-circle', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: '#059669' },
  'in-progress': { label: 'In Progress', icon: 'refresh', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', border: '#2563EB' },
  completed: { label: 'Completed', icon: 'checkmark-circle', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: '#059669' },
  rejected: { label: 'Rejected', icon: 'close-circle', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.12)', border: '#BE123C' },
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
            <Ionicons name="business-outline" size={14} color="#6B7280" /> {companyName}
          </Text>
        </View>

        <View style={styles.topRight}>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg, borderColor: meta.border }]}>
          <Ionicons name={meta.icon} size={12} color={meta.color} />
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
          <Text style={styles.amount}>{amount}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={[styles.typeBadge, isLight ? styles.typeBadgeLight : styles.typeBadgeDark]}>
          <Ionicons name="card-outline" size={18} color={isLight ? '#475569' : '#94A3B8'} />
          <Text style={[styles.typeBadgeText, isLight ? styles.typeBadgeTextLight : styles.typeBadgeTextDark]}>
            {paymentType}
          </Text>
        </View>

        <Text style={[styles.dateText, isLight ? styles.subLight : styles.subDark]}>Requested {requestedDate}</Text>
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
  dateText: {
    fontSize: font.sm,
    fontWeight: '500',
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
    paddingHorizontal: 8,
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
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
});
export default ServiceCard;
