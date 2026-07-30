import type { CompanyCardItem } from '../quickAccess/CompanyCard';

type TransactionCompanyLike = {
  companyId?: string | null;
  company?: unknown;
  details?: {
    company?: unknown;
    companyId?: unknown;
  };
};

function normalizeCompanyValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nestedCandidates = [
      record.id,
      record._id,
      record.companyId,
      record.company_id,
      record.company,
      record.companyID,
      record.companyid,
      record._id,
    ];

    for (const candidate of nestedCandidates) {
      const normalized = normalizeCompanyValue(candidate);
      if (normalized) {
        return normalized;
      }
    }
  }

  return '';
}

export function matchesSelectedCompany(
  transaction: TransactionCompanyLike,
  selectedCompany?: CompanyCardItem | null,
): boolean {
  if (!selectedCompany?.id) {
    return true;
  }

  const companyId = normalizeCompanyValue(
    transaction.companyId ??
      transaction.company ??
      transaction.details?.companyId ??
      transaction.details?.company ??
      ''
  ).toLowerCase();
  const selectedCompanyId = normalizeCompanyValue(selectedCompany.id).toLowerCase();
  const selectedCompanyName = normalizeCompanyValue(selectedCompany.name).toLowerCase();
  const transactionCompanyName = normalizeCompanyValue(
    transaction.details?.company && typeof transaction.details.company === 'object'
      ? (transaction.details.company as Record<string, unknown>).name
      : transaction.company && typeof transaction.company === 'object'
        ? (transaction.company as Record<string, unknown>).name
        : ''
  ).toLowerCase();

  return companyId === selectedCompanyId || transactionCompanyName === selectedCompanyName;
}

function normalizeSearchValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeAmountValue(value: string): string {
  return String(value).replace(/[^0-9.]/g, '');
}

export function matchesTransactionSearch(
  transaction: {
    title: string;
    amount: string;
    method: string;
    category: string;
    details?: {
      type?: string;
      paymentMethod?: string;
    };
  },
  search?: string,
): boolean {
  const normalizedSearch = (search ?? '').trim();
  if (!normalizedSearch) {
    return true;
  }

  const simplifiedSearch = normalizeSearchValue(normalizedSearch);
  const title = normalizeSearchValue(transaction.title);
  const method = normalizeSearchValue(transaction.method);
  const category = normalizeSearchValue(transaction.category);
  const detailType = normalizeSearchValue(transaction.details?.type ?? '');
  const paymentMethod = normalizeSearchValue(transaction.details?.paymentMethod ?? '');
  const amount = normalizeAmountValue(transaction.amount);
  const amountSearch = normalizeAmountValue(normalizedSearch);

  const textMatches = [title, method, category, detailType, paymentMethod].some(value =>
    value.includes(simplifiedSearch),
  );
  const amountMatches = Boolean(amountSearch && amount.includes(amountSearch));

  return textMatches || amountMatches;
}
