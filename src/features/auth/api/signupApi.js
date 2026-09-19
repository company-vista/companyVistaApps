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
export async function handleSignupApi({ firstName, lastName, fullName, email, phone, phoneNumber, countryCode, countryIso, countryOfResidence, residence, companyName, rawCompanyName, selectedEnding, selectedStructure, selectedState, selectedCountry, bestState, bestStatePrice, bestStatePriceNote, bestStateTimeframe, advisorFlow, selectedJurisdiction, purpose, customerLocation, priorities, dayOneNeeds, physicalPresence, usStatePriority, selectedStructurePrice, selectedAddOns, addOnsTotal, runningTotal, address, registrationCountry, ...rest }) {
    const errors = {};
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();
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
        const addr = (address || registrationCountry || countryOfResidence || residence || '').trim();
        const fullNameVal = (fullName || `${trimmedFirstName} ${trimmedLastName}`.trim()).trim();
        const phoneVal = (phone || phoneNumber || '').trim() || trimmedPhone;
        const countryCodeVal = countryCode || '';
        const countryIsoVal = countryIso || '';
        const residenceVal = (countryOfResidence || residence || addr).trim();
        // signup tak ka complete data
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
            companyName,
            rawCompanyName: rawCompanyName || companyName,
            selectedEnding: selectedEnding || '',
            selectedStructure: selectedStructure || '',
            selectedState: selectedState || '',
            selectedCountry: selectedCountry || '',
            bestState: bestState || '',
            bestStatePrice: bestStatePrice || 0,
            bestStatePriceNote: bestStatePriceNote || '',
            bestStateTimeframe: bestStateTimeframe || '',
            advisorFlow: advisorFlow || false,
            selectedJurisdiction: selectedJurisdiction || '',
            purpose: purpose || '',
            customerLocation: customerLocation || '',
            priorities: priorities || [],
            dayOneNeeds: dayOneNeeds || [],
            physicalPresence: physicalPresence || '',
            usStatePriority: usStatePriority || '',
            selectedStructurePrice: selectedStructurePrice || 0,
            selectedAddOns: selectedAddOns || {},
            addOnsTotal: addOnsTotal || 0,
            runningTotal: runningTotal || 0,
            address: addr,
            registrationCountry: addr,
            ...rest,
        };
        console.log('=== COMPANY SIGNUP API CALL (createCompanySignup) ===', JSON.stringify(fullPayload, null, 2));
        const response = await axios.post(SIGNUP_STEP1_ROUTE, fullPayload, { timeout: API_REQUEST_TIMEOUT_MS });
        const token = findDeepValue(response.data, TOKEN_KEYS) || getHeaderToken(response.headers);
        const clientId = findDeepValue(response.data, CLIENT_ID_KEYS);
        const companyId = findDeepValue(response.data, ['companyId', 'company_id', 'companyID']);
        const pricingType = response.data?.pricingType || response.data?.data?.pricingType || '';
        Toast.show({
            type: 'success',
            text1: response.data?.message || 'Verification code sent. Please check your inbox.',
            text2: companyId ? `Company: ${companyId.slice(-6)}` : 'Please login.',
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
            rawResponse: response.data,
        };
    }
    catch (error) {
        const message = error.response?.data?.message || 'Something went wrong.';
        Toast.show({
            type: 'error',
            text1: 'Signup failed',
            text2: message,
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
