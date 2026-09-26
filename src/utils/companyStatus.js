// Company registration ke paid/unpaid status ke liye ek hi source of truth.
// Pehle ye logic HomeScreen, TransactionsScreen aur RegistrationTrackingScreen me
// alag-alag tha - jiski wajah se "unpaid" company "Success"/"Submitted" dikha rahi thi.

// Backend 'payment_pending' / 'Payment Pending' / 'payment-pending' kuch bhi bhej sakta hai
export function normalizeRegistrationStatus(value) {
    return String(value ?? '')
        .toLowerCase()
        .trim()
        .replace(/[\s\-]+/g, '_');
}

export const PAID_REGISTRATION_STATUSES = [
    'active',
    'approved',
    'completed',
    'confirmed',
    'payment_confirmed',
    'paid',
    'registered',
    'in_progress',
    'formation_in_progress',
    'kyc_pending',
    'under_review',
    'submitted',
    'processing',
    'active_registration',
    'approved_pending_formation',
];

export const UNPAID_REGISTRATION_STATUSES = [
    'payment_pending',
    'payment_failed',
    'pending_payment',
    'awaiting_payment',
    'unpaid',
    'not_paid',
    'payment_due',
    'checkout_pending',
    'initiated',
    'processing_payment',
];

// registrationStatus kabhi registrationRequestData ya paymentStatus ke andar bhi hota hai
function findStatusDeep(value, depth = 0) {
    if (!value || typeof value !== 'object' || depth > 3 || Array.isArray(value)) {
        return '';
    }
    const record = value;
    for (const key of ['registrationStatus', 'registration_status', 'paymentStatus', 'payment_status']) {
        if (typeof record[key] === 'string' && record[key].trim()) {
            return record[key];
        }
    }
    for (const nested of Object.values(record)) {
        const found = findStatusDeep(nested, depth + 1);
        if (found) return found;
    }
    return '';
}

// Mapped list item ya raw company object - dono se status nikaalta hai
export function getRegistrationStatus(company) {
    if (!company) return '';
    const raw = company.raw ?? company;
    return normalizeRegistrationStatus(
        company.registrationStatus || findStatusDeep(raw) || raw?.status || company.status || '',
    );
}

export function isRegistrationUnpaid(company) {
    const status = getRegistrationStatus(company);
    if (!status) return false;
    if (PAID_REGISTRATION_STATUSES.includes(status)) return false;
    return UNPAID_REGISTRATION_STATUSES.includes(status);
}

export function isRegistrationPaid(company) {
    return PAID_REGISTRATION_STATUSES.includes(getRegistrationStatus(company));
}

// Company ka total payable amount
export function getCompanyTotalAmount(company) {
    const raw = company?.raw ?? company;
    return Number(
        raw?.totalAmount ??
        raw?.registrationRequestData?.totalAmount ??
        company?.totalAmount ??
        0,
    ) || 0;
}
