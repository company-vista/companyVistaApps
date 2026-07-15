import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors } from '../../../../theme/colors';
import { useAppSelector } from '../../../../store/hooks';
import { fetchCompanyComplianceHistory } from '../../api/clientProfileApi';
import { formatDate } from '../../../../constants/dateFormatter';

type ComplianceHistoryRecord = Record<string, unknown>;

type ComplianceHistoryScreenProps = {
  selectedAction: {
    id: 'address' | 'annual_filing' | 'resident' | 'federal_filing';
    title: string;
    subtitle: string;
    status: string;
    date: string;
    details: { label: string; value: string; icon?: string }[];
    companyId?: string | null;
    price?: number;
    years?: number;
    year?: string;
    dueDate?: string;
  };
  onBackPress: () => void;
};

const ComplianceHistoryScreen = ({ selectedAction, onBackPress }: ComplianceHistoryScreenProps) => {
  const colors = useThemeColors();
  const token = useAppSelector(state => state.auth.token);
  const [history, setHistory] = useState<ComplianceHistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const getStatusBadgeStyle = (status: string) => {
    const normalized = String(status ?? '').toLowerCase();
    if (normalized.includes('expired') || normalized.includes('overdue')) {
      return { backgroundColor: '#FEE2E2', color: '#B91C1C' };
    }
    if (normalized.includes('pending') || normalized.includes('due')) {
      return { backgroundColor: '#FEF3C7', color: '#92400E' };
    }
    return { backgroundColor: '#DCFCE7', color: '#166534' };
  };

  const badgeStyle = getStatusBadgeStyle(selectedAction.status);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setHistoryError('');
      setHistory([]);

      if (!selectedAction.companyId) {
        setHistoryError('Company ID unavailable. Unable to load compliance history.');
        return;
      }

      if (!token) {
        setHistoryError('Authentication token missing.');
        return;
      }

      setIsHistoryLoading(true);

      const result = await fetchCompanyComplianceHistory({
        companyId: selectedAction.companyId,
        token,
      });
      console.log(result)
      if (!isMounted) {
        return;
      }

      if (!result.isSuccess) {
        setHistoryError(result.error || 'Unable to load compliance history.');
        setHistory([]);
      } else {
        setHistory(result.history ?? []);
      }

      setIsHistoryLoading(false);
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [selectedAction.companyId, token]);

  const actionMatchTerms = React.useMemo(() => {
    switch (selectedAction.id) {
      case 'address':
        return ['address', 'registered address', 'address renewal'];
      case 'resident':
        return ['agent', 'registered agent', 'resident', 'resident agent'];
      case 'annual_filing':
        return ['annual filing', 'state filing', 'annual', 'state'];
      case 'federal_filing':
        return ['federal filing', 'federal', 'tax filing', 'tax'];
      default:
        return [selectedAction.title.toLowerCase()];
    }
  }, [selectedAction.id, selectedAction.title]);

  const getHistorySegment = (record: ComplianceHistoryRecord) => {
    const segmentKey =
      selectedAction.id === 'address'
        ? 'Address'
        : selectedAction.id === 'resident'
        ? 'resident'
        : selectedAction.id === 'annual_filing'
        ? 'annualFiling'
        : selectedAction.id === 'federal_filing'
        ? 'federalTaxFiling'
        : undefined;

    const segment = segmentKey && record[segmentKey];

    if (segment && typeof segment === 'object' && !Array.isArray(segment)) {
      return segment as Record<string, unknown>;
    }

    return record;
  };

  const matchesSelectedAction = (record: ComplianceHistoryRecord) => {
    const target = getHistorySegment(record);
    const candidate = [
      target.title,
      target.name,
      target.complianceName,
      target.status,
      target.subtitle,
      record.title,
      record.complianceName,
      record.name,
      record.subtitle,
    ]
      .filter(Boolean)
      .map(value => String(value).toLowerCase())
      .join(' ');

    return actionMatchTerms.some(term => candidate.includes(term));
  };

  const getHistoryDueDate = (record: ComplianceHistoryRecord) => {
    const segment = getHistorySegment(record);

    return (
      segment.dueDate ??
      segment.due_date ??
      segment.duedate ??
      segment.due ??
      segment.deadline ??
      segment.dueDateString ??
      segment.due_date_string ??
      segment.effectiveFrom ??
      record.dueDate ??
      record.date ??
      ''
    );
  };

  const getHistoryLastDate = (record: ComplianceHistoryRecord) => {
    const segment = getHistorySegment(record);

    return (
      segment.lastDate ??
      segment.last_date ??
      segment.lastFiled ??
      segment.last_filed ??
      segment.completedAt ??
      segment.lastDateString ??
      record.lastDate ??
      record.date ??
      ''
    );
  };

  const getHistoryStatus = (record: ComplianceHistoryRecord) => {
    const segment = getHistorySegment(record);

    return String(segment.status ?? record.status ?? selectedAction.status ?? '');
  };

  const getHistoryTitle = (record: ComplianceHistoryRecord) => {
    const segment = getHistorySegment(record);

    return String(
      segment.title ??
        segment.complianceName ??
        segment.name ??
        record.title ??
        record.complianceName ??
        selectedAction.title ??
        `Record ${record._id ?? ''}`,
    );
  };

  const filteredHistory = history.filter(matchesSelectedAction);
  const pendingHistory = filteredHistory.some(record =>
    getHistoryStatus(record).toLowerCase().includes('pending'),
  );
  const showRenewButton =
    String(selectedAction.status ?? '').toLowerCase().includes('pending') || pendingHistory;

  const formatRecordValue = (value: unknown, isDate = false) => {
    if (value == null || String(value).trim() === '') {
      return '--';
    }

    if (isDate) {
      return formatDate(String(value));
    }

    return String(value);
  };

  const getHistoryYear = (record: ComplianceHistoryRecord) => {
    if (record.year) {
      return String(record.year);
    }

    const dueDate = String(record.dueDate ?? record.date ?? selectedAction.date ?? '');
    const parsed = new Date(dueDate);

    if (!Number.isNaN(parsed.getTime())) {
      return String(parsed.getFullYear());
    }

    return '--';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <BackButton onPress={onBackPress} />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Compliance History</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Review action details and history for this compliance item.</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{selectedAction.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badgeStyle.backgroundColor }]}> 
              <Text style={[styles.statusBadgeText, { color: badgeStyle.color }]}>{selectedAction.status}</Text>
            </View>
          </View>
          <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{selectedAction.subtitle}</Text>
          <View style={styles.metaRow}>
            <FontAwesome name="calendar" size={12} color={colors.muted} />
            <Text style={[styles.metaText, { color: colors.muted }]}>{selectedAction.date}</Text>
          </View>
          {selectedAction.companyId ? (
            <View style={styles.metaRow}>
              <FontAwesome name="building" size={12} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>Company ID: {selectedAction.companyId}</Text>
            </View>
          ) : null}
          {selectedAction.price != null || selectedAction.years != null ? (
            <View style={styles.metaRow}>
              <FontAwesome name="tag" size={12} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}> 
                {selectedAction.price != null ? `Price ${selectedAction.price}` : ''}
                {selectedAction.price != null && selectedAction.years != null ? ' · ' : ''}
                {selectedAction.years != null ? `${selectedAction.years} year(s)` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Action details</Text>
          <View style={styles.detailGrid}>
            {selectedAction.details.map((detail, index) => (
              <View key={`${detail.label}-${index}`} style={[styles.detailCard, { backgroundColor: colors.background, borderColor: colors.border }]}> 
                <View style={[styles.detailIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                  <FontAwesome name={detail.icon ?? 'circle'} size={12} color={colors.muted} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>{detail.label}</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{detail.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.historyHeading, { color: colors.text }]}>History</Text>
            <Text style={[styles.historySubtext, { color: colors.muted }]}>Recent status and renewal options</Text>
          </View>
          <View style={[styles.historyCard, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <View style={styles.historyFields}>
              <View style={styles.historyFieldItem}>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>Year</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedAction.year ?? getHistoryYear(selectedAction)}</Text>
              </View>
              <View style={styles.historyFieldItem}>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>Due Date</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedAction.dueDate ?? selectedAction.date ?? '--'}</Text>
              </View>
              <View style={styles.historyFieldItem}>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>Status</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedAction.status}</Text>
              </View>
            </View>
            {showRenewButton ? (
              <Pressable style={[styles.renewButton, { backgroundColor: colors.accent }]}> 
                <Text style={[styles.renewButtonText, { color: colors.surface }]}>Renew</Text>
              </Pressable>
            ) : null}
          </View>
          {historyError ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>{historyError}</Text>
          ) : null}
          {isHistoryLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loadingIndicator} />
          ) : (
            <View style={styles.historyList}>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record, index) => (
                  <View
                    key={`${String(record.title ?? record.complianceName ?? 'history')}-${index}`}
                    style={[styles.historyItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.historyItemHeader}>
                      <Text style={[styles.historyItemTitle, { color: colors.text }]}> 
                        {getHistoryTitle(record)}
                      </Text>
                      <Text style={[styles.historyItemStatus, { color: colors.muted }]}> 
                        {getHistoryStatus(record) || 'Unknown'}
                      </Text>
                    </View>
                    <View style={styles.historyItemRow}>
                      <View style={styles.historyItemField}>
                        <Text style={[styles.summaryLabel, { color: colors.muted }]}>Year</Text>
                        <Text style={[styles.historyItemValue, { color: colors.text }]}>{getHistoryYear(record)}</Text>
                      </View>
                      <View style={styles.historyItemField}>
                        <Text style={[styles.summaryLabel, { color: colors.muted }]}>Due Date</Text>
                        <Text style={[styles.historyItemValue, { color: colors.text }]}>{formatRecordValue(getHistoryDueDate(record), true)}</Text>
                      </View>
                      <View style={styles.historyItemField}>
                        <Text style={[styles.summaryLabel, { color: colors.muted }]}>Status</Text>
                        <Text style={[styles.historyItemValue, { color: colors.text }]}>{formatRecordValue(getHistoryStatus(record))}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.historyEmptyText, { color: colors.muted }]}>No compliance history records found.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 18,
    paddingBottom: 40,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 8,
    marginTop: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  detailCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  historySubtext: {
    fontSize: 12,
  },
  historyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  historyFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  historyFieldItem: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 8,
  },
  historyList: {
    marginTop: 16,
    gap: 12,
  },
  historyItemCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyItemStatus: {
    fontSize: 12,
  },
  historyItemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  historyItemField: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 4,
  },
  historyItemValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyEmptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
  loadingIndicator: {
    marginTop: 18,
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '30%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  renewButton: {
    marginTop: 16,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  renewButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ComplianceHistoryScreen;
