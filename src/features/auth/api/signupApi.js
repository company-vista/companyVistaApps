import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../../config/api';
// New company signup - POST /api/company-signup -> createCompanySignup
// Replaces old step1 (POST /api/signup/step1)
const SIGNUP_STEP1_ROUTE = `${API_BASE_URL}/api/company-signup`;
const RESEND_VERIFICATION_ROUTE = `${API_BASE_URL}/api/signup/resend-verification`;
const API_REQUEST_TIMEOUT_MS = 10000;
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
const TOKEN_KEYS = [
    'token',
    'accessToken',
    'access_token',
    'authToken',
    'auth_token',
    'bearerToken',
    'clientToken',
    'client_token',
    'idToken',
    'id_token',
    'jwt',
];
const CLIENT_ID_KEYS = [
    'clientId',
    'client_id',
    'userId',
    'user_id',
    'id',
    '_id',
];
function isApiRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function findDeepValue(value, keys, depth = 0) {
    if (!isApiRecord(value) || depth > 4) {
        return '';
    }
    for (const key of keys) {
        const candidate = value[key];
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate;
        }
    }
    for (const nestedValue of Object.values(value)) {
        const nested = findDeepValue(nestedValue, keys, depth + 1);
        if (nested) {
            return nested;
        }
    }
    return '';
}
function getHeaderToken(headers) {
    const authorizationHeader = headers?.Authorization ?? headers?.authorization ?? headers?.['x-auth-token'];
    const cookieHeader = headers?.['set-cookie'];
    if (typeof authorizationHeader !== 'string') {
        if (Array.isArray(cookieHeader)) {
            return getCookieToken(cookieHeader.join('; '));
        }
        if (typeof cookieHeader === 'string') {
            return getCookieToken(cookieHeader);
        }
        return '';
    }
    return authorizationHeader.replace(/^Bearer\s+/i, '').trim();
}
function getCookieToken(cookieHeader) {
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)clientToken=([^;]+)/);
    return tokenMatch?.[1] ? decodeURIComponent(tokenMatch[1]) : '';
}
export async function handleSignupApi({ firstName, lastName, fullName, email, phone, phoneNumber, countryCode, countryIso, countryOfResidence, residence, dateOfBirth, companyName, rawCompanyName, selectedEnding, selectedStructure, selectedState, selectedCountry, bestState, bestStatePrice, bestStatePriceNote, bestStateTimeframe, advisorFlow, selectedJurisdiction, purpose, customerLocation, priorities, dayOneNeeds, physicalPresence, usStatePriority, selectedStructurePrice, selectedAddOns, addOnsTotal, runningTotal, address, registrationCountry, expectedRevenue, businessDescription, residentialAddress, addressLine1, authToken, ...rest }) {
    const errors = {};
    const trimmedFirstName = (firstName || '').trim();
    const trimmedLastName = (lastName || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPhone = (phoneNumber || phone || '').trim();
    if (!trimmedFirstName) {
        errors.firstName = 'First name is required';
    }
    else if (trimmedFirstName.length < 2) {
        errors.firstName = 'First name is too short';
    }
    if (!trimmedLastName) {
        errors.lastName = 'Last name is required';
    }
    else if (trimmedLastName.length < 2) {
        errors.lastName = 'Last name is too short';
    }
    if (!trimmedEmail) {
        errors.email = 'Email is required';
    }
    else if (!isValidEmail(trimmedEmail)) {
        errors.email = 'Enter a valid email';
    }
    if (!trimmedPhone) {
        errors.phoneNumber = 'Phone number is required';
    }
    if (!companyName?.trim() && !rawCompanyName?.trim()) {
        errors.companyName = 'Company name is required';
    }
    if (Object.keys(errors).length > 0) {
        Toast.show({
            type: 'error',
            text1: 'Signup failed',
            text2: 'Please check your details.',
        });
        return {
            errors,
            isSuccess: false,
            email: trimmedEmail,
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            token: '',
            clientId: '',
        };
    }
    try {
        // Portal payload ke hisab se — address object ho sakta hai {addressLine1, country}
        const isAddressObject = address && typeof address === 'object' && !Array.isArray(address);
        const addrString = isAddressObject ? (address.addressLine1 || address.address || '').trim() : String(address || '').trim();
        const addrVal = isAddressObject ? address : (addrString || registrationCountry || countryOfResidence || residence || '').trim();
        const residenceVal = (countryOfResidence || residence || (isAddressObject ? address.country : '') || '').trim();
        const fullNameVal = (fullName || `${trimmedFirstName} ${trimmedLastName}`.trim()).trim();
        const phoneVal = (phone || phoneNumber || '').trim() || trimmedPhone;
        const countryCodeVal = (typeof countryCode === 'object' ? countryCode.code : countryCode || '').trim() || '+91';
        const countryIsoVal = (typeof countryCode === 'object' ? countryCode.iso : countryIso || '').trim();
        // Portal payload exact — backend createCompanySignup + computeOrderTotal ke liye raw data bhejo, waha calculate hoga
        const fullPayload = {
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            fullName: fullNameVal,
            email: trimmedEmail,
            phone: phoneVal,
            phoneNumber: phoneVal,
            countryCode: countryCodeVal,
            countryIso: countryIsoVal,
            countryOfResidence: residenceVal,
            residence: residenceVal,
            dateOfBirth: (dateOfBirth || rest.dateOfBirth || '').trim(),
            companyName: (companyName || '').trim(),
            rawCompanyName: (rawCompanyName || companyName || '').trim(),
            selectedEnding: selectedEnding || '',
            selectedStructure: selectedStructure || '',
            selectedState: selectedState || '',
            selectedCountry: selectedCountry || '',
            registrationCountry: selectedCountry || registrationCountry || (isAddressObject ? address.country : addrString) || residenceVal,
            bestState: bestState || '',
            bestStatePrice: bestStatePrice ?? 0,
            bestStatePriceNote: bestStatePriceNote || '',
            bestStateTimeframe: bestStateTimeframe || '',
            advisorFlow: !!advisorFlow,
            selectedJurisdiction: selectedJurisdiction || '',
            purpose: purpose || '',
            customerLocation: customerLocation || '',
            priorities: priorities || [],
            dayOneNeeds: dayOneNeeds || [],
            physicalPresence: physicalPresence || '',
            usStatePriority: usStatePriority || '',
            selectedStructurePrice: selectedStructurePrice ?? 0,
            selectedAddOns: selectedAddOns || {},
            addOnsTotal: addOnsTotal ?? 0,
            runningTotal: runningTotal ?? 0,
            address: isAddressObject ? address : { addressLine1: residentialAddress || addressLine1 || addrString || residenceVal, country: residenceVal },
            expectedRevenue: expectedRevenue || rest.expectedRevenue || '',
            businessDescription: (businessDescription || rest.businessDescription || '').trim(),
            ...rest,
        };
        // authToken sirf Authorization header ke liye hai, body me nahi bhejna.
        delete fullPayload.authToken;
        console.log('=== COMPANY SIGNUP API CALL (createCompanySignup) ===', JSON.stringify(fullPayload, null, 2));
        // ── Session token zaroori hai ────────────────────────────────────────
        // Add-Company flow me user pehle se login hai. Backend ka
        // protectClient Bearer token padhta hai; token na bhejne par
        // req.client undefined hota hai aur controller email se verify karke
        // 409 "account already exists" de deta hai — yani dusri company banane
        // ke bajaye user se dobara signup karwaya jata hai.
        const config = { timeout: API_REQUEST_TIMEOUT_MS };
        if (authToken) {
            config.headers = { Authorization: `Bearer ${authToken}` };
        }
        const response = await axios.post(SIGNUP_STEP1_ROUTE, fullPayload, config);
        const token = findDeepValue(response.data, TOKEN_KEYS) || getHeaderToken(response.headers);
        const clientId = findDeepValue(response.data, CLIENT_ID_KEYS);
        const companyId = findDeepValue(response.data, ['companyId', 'company_id', 'companyID']);
        const pricingType = response.data?.pricingType || response.data?.data?.pricingType || '';
        // backend computes totalAmount = pricingType==='fixed' ? computeOrderTotal(body) : 0 — response shape alag ho sakta hai isliye deep check
        const totalAmount = response.data?.totalAmount ?? response.data?.total_amount ?? response.data?.data?.totalAmount ?? response.data?.data?.total_amount ?? response.data?.company?.totalAmount ?? response.data?.company?.total_amount ?? response.data?.data?.company?.totalAmount ?? response.data?.data?.company?.total_amount ?? 0;
        console.log('=== SIGNUP RESPONSE totalAmount ===', totalAmount, 'pricingType', pricingType, 'full response', JSON.stringify(response.data, null, 2));
        // Logged-in user ko OTP nahi bheja jaata (backend verified client par
        // skip karta hai), to "code sent" message mislead karta hai.
        Toast.show({
            type: 'success',
            text1: authToken ? (response.data?.message || 'Company created.') : (response.data?.message || 'Verification code sent. Please check your inbox.'),
            text2: companyId ? `Company: ${companyId.slice(-6)}` : (authToken ? 'Continue to review.' : 'Please login.'),
        });
        return {
            errors: {},
            isSuccess: true,
            email: trimmedEmail,
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            token,
            clientId,
            companyId,
            pricingType,
            totalAmount,
            rawResponse: response.data,
        };
    }
    catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || 'Something went wrong.';
        // 409 ka matlab: is email ka account pehle se verified hai. Naye
        // client ke liye ye sahi error hai, par logged-in client ke liye ye
        // bug signal hai (token nahi gaya / backend nahi patch hua). Saaf
        // message do warna user ko lagta hai signup hi nahi ho raha.
        const isConflict = status === 409;
        Toast.show({
            type: 'error',
            text1: isConflict && authToken ? 'Could not create company' : 'Signup failed',
            text2: isConflict && authToken ? 'This account already has access. Please try again.' : message,
        });
        return {
            errors: { email: message },
            isSuccess: false,
            email: trimmedEmail,
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            token: '',
            clientId: '',
        };
    }
}
export async function handleResendVerificationApi(email) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
        return { isSuccess: false, message: 'Email is required.' };
    }
    try {
        const response = await axios.post(RESEND_VERIFICATION_ROUTE, {
            email: trimmedEmail,
        }, { timeout: API_REQUEST_TIMEOUT_MS });
        return {
            isSuccess: true,
            message: response.data?.message || 'Verification email sent successfully.',
        };
    }
    catch (error) {
        return {
            isSuccess: false,
            message: error.response?.data?.message || 'Network error. Unable to reach server.',
        };
    }
}
