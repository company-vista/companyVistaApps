// Company registration ke paid/unpaid status ke liye ek hi source of truth.
// Pehle ye logic HomeScreen, TransactionsScreen aur RegistrationTrackingScreen me
// alag-alag tha - jiski wajah se "unpaid" company "Success"/"Submitted" dikha rahi thi.
import { hasRealPrice } from './priceCalculator';

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

// Payment records se un company ids ka Set banata hai jinki payment success ho chuki hai.
// DB me ek hi company ke pending + success DONO Payment records ho sakte hain
// (payment success hone par purana pending record update nahi hota) - isliye
// sirf success wale hi company ko "paid" treat karwate hain. Bina is cross-check
// ke Home/AddCompany guard stale registrationStatus par atka rehta hai.
export function getSuccessfulPaymentCompanyIds(payments = []) {
    const paidIds = new Set();
    (Array.isArray(payments) ? payments : []).forEach(payment => {
        if (!payment) return;
        const status = String(payment.status ?? payment.paymentStatus ?? payment.payment_status ?? '')
            .toLowerCase()
            .trim()
            .replace(/[\s\-_]+/g, ' ');
        const isSuccess =
            status === 'success' ||
            status === 'succeeded' ||
            status === 'successful' ||
            status === 'paid' ||
            status === 'completed' ||
            status === 'confirmed' ||
            status === 'active' ||
            status.includes('active');
        if (!isSuccess) return;
        const companyId = typeof payment.company === 'object' && payment.company !== null
            ? String(payment.company._id ?? payment.company.id ?? payment.company.companyId ?? '')
            : String(payment.company ?? '');
        if (companyId.trim()) paidIds.add(companyId.trim());
    });
    return paidIds;
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

// Company record me pricing fields kahan-kahan rehti hain - flat record,
// registrationRequestData aur pricing object. Har source alag check karo
// (merge karne se ek source ka 0 doosre ka asli price mita deta hai).
function getPricingSources(company) {
    const raw = company?.raw ?? company ?? {};
    return [raw, raw.registrationRequestData, raw.pricing].filter(
        source => source && typeof source === 'object',
    );
}

// Quoted jurisdiction ka price define hi nahi hota - admin quote banata hai.
// Is liye "quoted" company par payment CTA / "Payment pending" banner kahin
// dikhana galat hai, kyunki paisa maanga hi nahi gaya hai.
//
// pricingType har jagah same jagah nahi hota (list item, raw, registrationRequestData,
// pricing object), is liye sab sources check karte hain. Backend field kabhi
// bhejta hi nahi, tab amount === 0 + status 'pending' se infer karte hain -
// tabhi company ka matlab hi "abhi price tay nahi hua" hai.
export function isCompanyQuoted(company) {
    if (!company) return false;
    const raw = company.raw ?? company;
    const pricingType = String(
        company.pricingType ??
        raw.pricingType ??
        raw.pricing_type ??
        raw.registrationRequestData?.pricingType ??
        raw.registrationRequestData?.pricing_type ??
        raw.pricing?.pricingType ??
        '',
    )
        .toLowerCase()
        .trim();
    if (pricingType) {
        if (pricingType !== 'quoted') return false;
        // Backend non-US priced jurisdiction (GB/HK/CA) ko 'quoted' bhej deta
        // hai, par company record me asli price (registrationRequestData /
        // pricing) maujood hota hai. Price hai to company fixed hai.
        return !getPricingSources(company).some(source => hasRealPrice(source));
    }
    // pricingType missing - amount aur status se infer karo
    const totalAmount = getCompanyTotalAmount(company);
    const status = getRegistrationStatus(company);
    return totalAmount === 0 && status === 'pending';
}
