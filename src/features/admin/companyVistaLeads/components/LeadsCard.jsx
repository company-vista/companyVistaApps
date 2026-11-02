import { font } from '../../../../theme/typography';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { s } from '../../../../theme/responsive';

const formatDate = value => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleString();
};

const LeadDetail = ({ label, value }) => (
  <View style={styles.detail}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || '—'}</Text>
  </View>
);

const LeadsCard = ({ lead }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.leadName}>{lead.name || lead.fullName || 'Unnamed lead'}</Text>
      <Text style={styles.sourceBadge}>{lead.source || 'Website'}</Text>
    </View>

    {lead.company_name || lead.entity_type ? (
      <Text style={styles.companyDetails}>
        {[lead.company_name, lead.entity_type].filter(Boolean).join(' · ')}
      </Text>
    ) : null}

    <View style={styles.details}>
      <View style={styles.detailColumn}>
        <LeadDetail label="Email" value={lead.email} />
        <LeadDetail label="Phone" value={lead.phone} />
      </View>
      <View style={styles.detailColumn}>
        <LeadDetail label="Country" value={lead.country} />
        {lead.nextReminder?.remindAt ? (
          <LeadDetail
            label="Next follow-up"
            value={formatDate(lead.nextReminder.remindAt)}
          />
        ) : null}
      </View>
      {lead.message ? <LeadDetail label="Message" value={lead.message} /> : null}
    </View>

    <View style={styles.created}>
      <Text style={styles.createdLabel}>Created</Text>
      <Text style={styles.createdValue}>{formatDate(lead.createdAt)}</Text>
    </View>
  </View>
);

export default LeadsCard;

const styles = StyleSheet.create({
  card: {
    padding: s(16),
    borderRadius: s(16),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: s(8),
  },
  leadName: {
    flex: 1,
    fontSize: font.lg,
    fontWeight: '700',
    color: '#0F172A',
  },
  sourceBadge: {
    overflow: 'hidden',
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: s(16),
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    fontSize: font.xs,
    fontWeight: '600',
  },
  companyDetails: {
    fontSize: font.xs,
    color: '#64748B',
    marginTop: s(6),
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(14),
    marginTop: s(16),
  },
  detailColumn: {
    flex: 1,
    minWidth: '45%',
    gap: s(12),
  },
  detail: {
    flexBasis: '100%',
    gap: s(3),
  },
  detailLabel: {
    fontSize: font.xs,
    color: '#94A3B8',
  },
  detailValue: {
    fontSize: font.sm,
    color: '#1E293B',
    lineHeight: font.sm + s(5),
  },
  created: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: s(16),
    paddingTop: s(12),
    gap: s(3),
  },
  createdLabel: {
    fontSize: font.xs,
    color: '#64748B',
  },
  createdValue: {
    fontSize: font.xs,
    color: '#64748B',
  },
});
