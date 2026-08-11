import { useEffect, useState } from 'react';
import { fetchCompanyComplianceHistory } from '../api/clientProfileApi';
import { useAppSelector } from '../../../store/hooks';
export const complianceItems = [
    {
        id: 'agent_address',
        title: 'Agent & Address',
        subtitle: 'Registered agent & address',
        dueDate: 'Jun 1',
        tag: 'Due',
        icon: 'building',
        matchTerms: ['registered address', 'address', 'registered agent', 'agent', 'resident'],
        tone: 'amber',
    },
    {
        id: 'itin',
        title: 'ITIN',
        subtitle: 'Tax identification',
        dueDate: 'Jul 15',
        tag: 'Due',
        icon: 'id-card',
        matchTerms: ['itin', 'tax id', 'taxpayer id', 'tax identification number'],
        tone: 'amber',
    },
    {
        id: 'annual_filing',
        title: 'State Filing',
        subtitle: 'State compliance',
        dueDate: 'Jul 31',
        tag: 'Due Jul 31',
        icon: 'university',
        matchTerms: ['state filing', 'state', 'annual report', 'annual filing'],
        tone: 'amber',
    },
    {
        id: 'federal_filing',
        title: 'Federal Filing',
        subtitle: 'Annual federal tax',
        dueDate: 'Jan 31',
        tag: 'Active',
        icon: 'user',
        matchTerms: ['federal filing', 'federal', 'irs', 'tax', 'federal tax filing'],
        tone: 'green',
    },
];
export function normalizeText(value) {
    return String(value ?? '')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .toLowerCase();
}
function getRecordLabel(record) {
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
function getComplianceCardTitle(record) {
    const label = normalizeText(record.complianceName ?? record.title);
    const titleByApiKey = {
        address: 'Agent & Address',
        resident: 'Agent & Address',
        'annual filing': 'State Filing',
        'federal tax filing': 'Federal Filing',
        itin: 'ITIN',
        'tax id': 'ITIN',
        'taxpayer id': 'ITIN',
    };
    return titleByApiKey[label];
}
function getRecordDueDate(record) {
    const details = record.details && typeof record.details === 'object' && !Array.isArray(record.details)
        ? record.details
        : {};
    const compliance = record.compliance &&
        typeof record.compliance === 'object' &&
        !Array.isArray(record.compliance)
        ? record.compliance
        : {};
    const dueDate = record.dueDate ??
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
function getRecordLastDate(record) {
    const value = record.lastDate ?? record.last_date ?? record.completedAt;
    return typeof value === 'string' ? value : '';
}
function formatDueDate(value) {
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
function isExpiringWithinOneMonth(value) {
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
function getYearlyFilingStatus(record) {
    const backendStatus = normalizeText(record.status);
    const lastDate = new Date(getRecordLastDate(record));
    const isCompletedThisYear = !Number.isNaN(lastDate.getTime()) &&
        lastDate.getFullYear() === new Date().getFullYear() &&
        backendStatus === 'active';
    return isCompletedThisYear ? 'completed' : 'pending';
}
function getMatchedTitle(record) {
    const directTitle = getComplianceCardTitle(record);
    const fallbackItem = complianceItems.find(item => {
        const label = getRecordLabel(record);
        return item.matchTerms.some(term => label.includes(term));
    });
    return directTitle ?? fallbackItem?.title;
}
export function useCompanyCompliance(companyId) {
    const token = useAppSelector(state => state.auth.token);
    const [dueDatesByTitle, setDueDatesByTitle] = useState({});
    const [rawDueDatesByTitle, setRawDueDatesByTitle] = useState({});
    const [statusesByTitle, setStatusesByTitle] = useState({});
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
            const nextDueDates = result.history.reduce((acc, record) => {
                const cardTitle = getMatchedTitle(record);
                const dueDate = getRecordDueDate(record);
                if (cardTitle && dueDate) {
                    acc.formatted[cardTitle] = formatDueDate(dueDate);
                    acc.raw[cardTitle] = dueDate;
                }
                return acc;
            }, { formatted: {}, raw: {} });
            const nextStatuses = result.history.reduce((acc, record) => {
                const cardTitle = getMatchedTitle(record);
                const dueDate = getRecordDueDate(record);
                const usesRenewalWarning = cardTitle === 'Agent & Address';
                const usesYearlyFilingStatus = cardTitle === 'State Filing' ||
                    cardTitle === 'Federal Filing';
                if (cardTitle) {
                    if (usesYearlyFilingStatus) {
                        acc[cardTitle] = getYearlyFilingStatus(record);
                    }
                    else {
                        acc[cardTitle] = usesRenewalWarning && isExpiringWithinOneMonth(dueDate)
                            ? 'expiring_soon'
                            : String(record.status ?? '');
                    }
                }
                return acc;
            }, {});
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
