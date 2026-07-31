import { useEffect, useState } from 'react';

import { fetchCompanyComplianceHistory } from '../api/clientProfileApi';
import { useAppSelector } from '../../../store/hooks';

export const complianceItems = [
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

export function normalizeText(value: unknown) {
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

function getMatchedTitle(record: Record<string, unknown>) {
  const directTitle = getComplianceCardTitle(record);
  const fallbackItem = complianceItems.find(item => {
    const label = getRecordLabel(record);

    return item.matchTerms.some(term => label.includes(term));
  });

  return directTitle ?? fallbackItem?.title;
}

export function useCompanyCompliance(companyId?: string | null) {
  const token = useAppSelector(state => state.auth.token);
  const [dueDatesByTitle, setDueDatesByTitle] = useState<Record<string, string>>({});
  const [rawDueDatesByTitle, setRawDueDatesByTitle] = useState<Record<string, string>>({});
  const [statusesByTitle, setStatusesByTitle] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setDueDatesByTitle({});
      setRawDueDatesByTitle({});
      setStatusesByTitle({});
      return;
    }

    let isMounted = true;

    setIsLoading(true);

    fetchCompanyComplianceHistory({ companyId, token }).then(result => {
      if (!isMounted) {
        return;
      }

      const nextDueDates = result.history.reduce<{
        formatted: Record<string, string>;
        raw: Record<string, string>;
      }>(
        (acc, record) => {
          const cardTitle = getMatchedTitle(record);
          const dueDate = getRecordDueDate(record);

          if (cardTitle && dueDate) {
            acc.formatted[cardTitle] = formatDueDate(dueDate);
            acc.raw[cardTitle] = dueDate;
          }

          return acc;
        },
        { formatted: {}, raw: {} },
      );
      const nextStatuses = result.history.reduce<Record<string, string>>(
        (acc, record) => {
          const cardTitle = getMatchedTitle(record);
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

      setDueDatesByTitle(nextDueDates.formatted);
      setRawDueDatesByTitle(nextDueDates.raw);
      setStatusesByTitle(nextStatuses);
    }).finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [companyId, token]);

  return { dueDatesByTitle, rawDueDatesByTitle, statusesByTitle, isLoading };
}
