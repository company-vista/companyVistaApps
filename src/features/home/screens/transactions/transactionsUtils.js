function normalizeCompanyValue(value) {
    if (typeof value === 'string') {
        return value.trim();
    }
    if (typeof value === 'number') {
        return String(value);
    }
    if (value && typeof value === 'object') {
        const record = value;
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
export function matchesSelectedCompany(transaction, selectedCompany) {
    if (!selectedCompany?.id) {
        return true;
    }
    const companyId = normalizeCompanyValue(transaction.companyId ??
        transaction.company ??
        transaction.details?.companyId ??
        transaction.details?.company ??
        '').toLowerCase();
    const selectedCompanyId = normalizeCompanyValue(selectedCompany.id).toLowerCase();
    const selectedCompanyName = normalizeCompanyValue(selectedCompany.name).toLowerCase();
    const transactionCompanyName = normalizeCompanyValue(transaction.details?.company && typeof transaction.details.company === 'object'
        ? transaction.details.company.name
        : transaction.company && typeof transaction.company === 'object'
            ? transaction.company.name
            : '').toLowerCase();
    return companyId === selectedCompanyId || transactionCompanyName === selectedCompanyName;
}
function normalizeSearchValue(value) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}
function normalizeAmountValue(value) {
    return String(value).replace(/[^0-9.]/g, '');
}
export function matchesTransactionSearch(transaction, search) {
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
    const textMatches = [title, method, category, detailType, paymentMethod].some(value => value.includes(simplifiedSearch));
    const amountMatches = Boolean(amountSearch && amount.includes(amountSearch));
    return textMatches || amountMatches;
}
