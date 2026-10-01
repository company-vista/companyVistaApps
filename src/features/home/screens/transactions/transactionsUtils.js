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
function toTimestamp(value) {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
}

// Ek hi company ka ek hi payment type ek time par "in-flight" ho sakta hai. User
// checkout 3 baar open karke cancel karta hai to backend 3 pending records bana
// deta hai — list me 3 rows aur summary me 3 guna amount. Is liye same
// company + type + currency ke pending records me se sirf latest (newest date)
// rakhte hain. Success/Failed records untouched rehte hain — unki history asli hai.
export function collapseDuplicatePendingTransactions(items) {
    const list = Array.isArray(items) ? items : [];
    const pendingKey = item => {
        const company = normalizeCompanyValue(item?.details?.company ??
            item?.companyId ??
            item?.company ??
            '').toLowerCase();
        const type = String(item?.category ?? item?.details?.type ?? '').toLowerCase().trim();
        const currency = String(item?.details?.currency ?? '').toLowerCase().trim();
        return `${company}|${type}|${currency}`;
    };
    const newestIndexByKey = {};
    list.forEach((item, index) => {
        if (item?.status !== 'Pending') return;
        const key = pendingKey(item);
        const current = newestIndexByKey[key];
        if (current === undefined) {
            newestIndexByKey[key] = index;
            return;
        }
        const currentTime = toTimestamp(list[current]?.details?.createdAt ?? list[current]?.details?.date ?? list[current]?.date);
        const candidateTime = toTimestamp(item?.details?.createdAt ?? item?.details?.date ?? item?.date);
        // Date parse na ho to list order trust karo — naya record aksar end me hota hai
        if (candidateTime === 0 || currentTime === 0 || candidateTime >= currentTime) {
            newestIndexByKey[key] = index;
        }
    });
    const dropped = new Set();
    list.forEach((item, index) => {
        if (item?.status !== 'Pending') return;
        const keepIndex = newestIndexByKey[pendingKey(item)];
        if (keepIndex !== index) dropped.add(index);
    });
    return list.filter((_, index) => !dropped.has(index));
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
