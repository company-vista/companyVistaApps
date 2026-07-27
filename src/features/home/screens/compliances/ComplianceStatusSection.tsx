import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { fetchCompanyComplianceHistory } from '../../api/clientProfileApi';
import { useAppSelector } from '../../../../store/hooks';
import { useThemeColors } from '../../../../theme/colors';
import { useResponsive } from '../../../../hooks/useResponsive';

type ComplianceStatusSectionProps = {
  companyId?: string | null;
  onViewAllPress: () => void;
};

const complianceItems = [
  {
    title: 'Registered Address',
    dueDate: 'Jun 1',
    tag: 'Overdue',
    icon: 'file-text-o',
    matchTerms: ['registered address', 'address'],
    tone: 'red',
  },
  {
    title: 'Registered Agent',
    dueDate: 'Jul 15',
    tag: 'Due Jul 15',
    icon: 'file-text',
    matchTerms: ['registered agent', 'agent', 'resident'],
    tone: 'amber',
  },
  {
    title: 'State Filing',
    dueDate: 'Jul 31',
    tag: 'Due Jul 31',
    icon: 'university',
    matchTerms: ['state filing', 'state', 'annual report', 'annual filing'],
    tone: 'amber',
  },
  {
    title: 'Federal Filing',
    dueDate: 'Jan 31',
    tag: 'Active',
    icon: 'user',
    matchTerms: ['federal filing', 'federal', 'irs', 'tax', 'federal tax filing'],
    tone: 'green',
  },
] as const;

type Tone = (typeof complianceItems)[number]['tone'];

function getToneStyles(tone: Tone, colors: ReturnType<typeof useThemeColors>) {
  const isDark = colors.mode === 'dark';

  const toneStyles = {
    amber: {
      icon: {
        backgroundColor: isDark ? '#2F2411' : '#FEF3C7',
      },
      iconText: {
        color: isDark ? '#F9C56A' : '#B45309',
      },
      tag: {
        backgroundColor: isDark ? '#3A2A15' : '#FEF3C7',
      },
      tagText: {
        color: isDark ? '#F7DCA7' : '#B45309',
      },
    },
    green: {
      icon: {
        backgroundColor: isDark ? '#15352A' : '#D1FAE5',
      },
      iconText: {
        color: isDark ? '#7DD3A8' : '#047857',
      },
      tag: {
        backgroundColor: isDark ? '#1C4334' : '#D1FAE5',
      },
      tagText: {
        color: isDark ? '#A7F3D0' : '#047857',
      },
    },
    red: {
      icon: {
        backgroundColor: isDark ? '#3D1717' : '#FEE2E2',
      },
      iconText: {
        color: isDark ? '#F8A5A5' : '#DC2626',
      },
      tag: {
        backgroundColor: isDark ? '#4C1D1D' : '#FEE2E2',
      },
      tagText: {
        color: isDark ? '#F6C1C1' : '#DC2626',
      },
    },
  };

  return toneStyles[tone];
}

function normalizeText(value: unknown) {
  return String(value ?? '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
}

function getRecordLabel(record: Record<string, unknown>) {
  return [
    record.title,
    record.name,
    record.complianceName,
    record.complianceType,
    record.type,
    record.category,
    record.serviceName,
    record.service,
    record.key,
    record.slug,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(' ');
}

function getComplianceCardTitle(record: Record<string, unknown>) {
  const label = normalizeText(record.complianceName ?? record.title);

  const titleByApiKey: Record<string, string> = {
    address: 'Registered Address',
    resident: 'Registered Agent',
    'annual filing': 'State Filing',
    'federal tax filing': 'Federal Filing',
  };

  return titleByApiKey[label];
}

function getRecordDueDate(record: Record<string, unknown>) {
  const details =
    record.details && typeof record.details === 'object' && !Array.isArray(record.details)
      ? record.details as Record<string, unknown>
      : {};
  const compliance =
    record.compliance &&
    typeof record.compliance === 'object' &&
    !Array.isArray(record.compliance)
      ? record.compliance as Record<string, unknown>
      : {};
  const dueDate =
    record.dueDate ??
    record.duedate ??
    record.due_date ??
    record.due ??
    record.deadline ??
    record.nextDueDate ??
    record.expiryDate ??
    record.filingDate ??
    details.dueDate ??
    details.deadline ??
    compliance.dueDate ??
    compliance.deadline;

  if (typeof dueDate === 'string' && dueDate.trim()) {
    return dueDate.trim();
  }

  if (typeof dueDate === 'number') {
    return String(dueDate);
  }

  return '';
}

function getRecordLastDate(record: Record<string, unknown>) {
  const value = record.lastDate ?? record.last_date ?? record.completedAt;

  return typeof value === 'string' ? value : '';
}

function formatDueDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatStatus(value: unknown) {
  const status = normalizeText(value);

  if (!status) {
    return 'Not available';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusTone(value: unknown): Tone {
  const status = normalizeText(value);

  if (status === 'active' || status === 'completed') {
    return 'green';
  }

  if (status.includes('overdue') || status === 'expired') {
    return 'red';
  }

  return 'amber';
}

function isExpiringWithinOneMonth(value: string) {
  const dueDate = new Date(value);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const today = new Date();
  const oneMonthFromToday = new Date(today);

  oneMonthFromToday.setMonth(oneMonthFromToday.getMonth() + 1);

  return dueDate.getTime() >= today.getTime() &&
    dueDate.getTime() <= oneMonthFromToday.getTime();
}

function getYearlyFilingStatus(record: Record<string, unknown>) {
  const backendStatus = normalizeText(record.status);
  const lastDate = new Date(getRecordLastDate(record));
  const isCompletedThisYear =
    !Number.isNaN(lastDate.getTime()) &&
    lastDate.getFullYear() === new Date().getFullYear() &&
    backendStatus === 'active';

  return isCompletedThisYear ? 'completed' : 'pending';
}

function ComplianceStatusSection({
  companyId,
  // onViewAllPress,
}: ComplianceStatusSectionProps) {
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
  const token = useAppSelector(state => state.auth.token);
  const { rs } = useResponsive();
  const [dueDatesByTitle, setDueDatesByTitle] = useState<Record<string, string>>({});
  const [statusesByTitle, setStatusesByTitle] = useState<Record<string, string>>({});
  const [isLoadingDueDates, setIsLoadingDueDates] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setDueDatesByTitle({});
      setStatusesByTitle({});
      return;
    }

    let isMounted = true;

    setIsLoadingDueDates(true);

    fetchCompanyComplianceHistory({ companyId, token }).then(result => {
      if (!isMounted) {
        return;
      }

      const nextDueDates = result.history.reduce<Record<string, string>>(
        (acc, record) => {
          const directTitle = getComplianceCardTitle(record);
          const fallbackItem = complianceItems.find(item => {
            const label = getRecordLabel(record);

            return item.matchTerms.some(term => label.includes(term));
          });
          const cardTitle = directTitle ?? fallbackItem?.title;
          const dueDate = getRecordDueDate(record);

          if (cardTitle && dueDate) {
            acc[cardTitle] = formatDueDate(dueDate);
          }

          return acc;
        },
        {},
      );
      const nextStatuses = result.history.reduce<Record<string, string>>(
        (acc, record) => {
          const directTitle = getComplianceCardTitle(record);
          const fallbackItem = complianceItems.find(item => {
            const label = getRecordLabel(record);

            return item.matchTerms.some(term => label.includes(term));
          });
          const cardTitle = directTitle ?? fallbackItem?.title;
          const dueDate = getRecordDueDate(record);
          const usesRenewalWarning =
            cardTitle === 'Registered Address' ||
            cardTitle === 'Registered Agent';
          const usesYearlyFilingStatus =
            cardTitle === 'State Filing' ||
            cardTitle === 'Federal Filing';

          if (cardTitle) {
            if (usesYearlyFilingStatus) {
              acc[cardTitle] = getYearlyFilingStatus(record);
            } else {
              acc[cardTitle] = usesRenewalWarning && isExpiringWithinOneMonth(dueDate)
                ? 'expiring_soon'
                : String(record.status ?? '');
            }
          }

          return acc;
        },
        {},
      );

      setDueDatesByTitle(nextDueDates);
      setStatusesByTitle(nextStatuses);
    }).finally(() => {
      if (isMounted) {
        setIsLoadingDueDates(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [companyId, token]);

  const complianceCards = useMemo(() => complianceItems.map(item => ({
    ...item,
    dueDate: dueDatesByTitle[item.title] ?? (
      isLoadingDueDates ? 'Loading...' : 'Not available'
    ),
    tag: isLoadingDueDates
      ? 'Loading...'
      : formatStatus(statusesByTitle[item.title]),
    tone: getStatusTone(statusesByTitle[item.title]),
  })), [dueDatesByTitle, isLoadingDueDates, statusesByTitle]);

  const tileWidth = useMemo(() => {
    const GAP = rs(8);
    const PADDING = rs(48);
    return Math.floor((rs(375) - PADDING - GAP) / 2);
  }, [rs]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Compliance status
        </Text>
      </View>
      <View style={styles.complianceGrid}>
        {complianceCards.map(item => {
          const tone = getToneStyles(item.tone, colors);

          return (
              <View key={item.title} style={[styles.tileWrapper, { width: tileWidth }]}>
              <View style={[styles.complianceTile, { backgroundColor: isLight ? 'rgba(229,231,235,0.5)' : 'rgba(255,255,255,0.07)' }]}>
                <View style={styles.complianceTileHeader}>
                  <View style={[styles.statusIcon, tone.icon]}>
                    <FontAwesome
                      name={item.icon}
                      size={14}
                      style={tone.iconText}
                    />
                  </View>
                  <View style={[styles.tag, tone.tag]}>
                    <Text style={[styles.tagText, tone.tagText]}>{item.tag}</Text>
                  </View>
                </View>
                <Text style={[styles.tileName, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.tileDueDateText, { color: colors.muted }]}>
                  Due date: <Text style={[styles.tileDueDateValue, { color: colors.muted }]}>{item.dueDate}</Text>
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  sectionTitle: {
    color: '#2C2C2A',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionLink: {
    color: '#D85A30',
    fontSize: 12,
    fontWeight: '500',
  },
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tileWrapper: {
    position: 'relative',
  },
  complianceTile: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  complianceTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  iconAmber: {
    backgroundColor: '#FEF3C7',
  },
  iconGreen: {
    backgroundColor: '#D1FAE5',
  },
  iconRed: {
    backgroundColor: '#FEE2E2',
  },
  iconTextAmber: {
    color: '#B45309',
  },
  iconTextGreen: {
    color: '#047857',
  },
  iconTextRed: {
    color: '#DC2626',
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600',
  },
  tagAmber: {
    backgroundColor: '#FEF3C7',
  },
  tagGreen: {
    backgroundColor: '#D1FAE5',
  },
  tagRed: {
    backgroundColor: '#FEE2E2',
  },
  tagTextAmber: {
    color: '#B45309',
  },
  tagTextGreen: {
    color: '#047857',
  },
  tagTextRed: {
    color: '#DC2626',
  },
  tileName: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
  },
  tileDueDateText: {
    fontSize: 12,
    marginTop: 5,
  },
  tileDueDateValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ComplianceStatusSection;
