import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../../config/api';
import { getNetworkErrorMessage } from '../../../utils/errorMessages';
import { capitalizeCompanyName } from '../../../constants/convertFirstChar';
const CLIENT_LOGIN_ROUTE = `${API_BASE_URL}/api/client/auth/login`;
const ADMIN_LOGIN_ROUTE = `${API_BASE_URL}/api/auth/login`;
const GOOGLE_LOGIN_ROUTE = `${API_BASE_URL}/api/client/auth/google/login`;
const LOGIN_SEND_OTP_ROUTE = `${API_BASE_URL}/api/company-signup/login-send-otp`;
const LOGIN_VERIFY_OTP_ROUTE = `${API_BASE_URL}/api/company-signup/login-verify-otp`;
const API_REQUEST_TIMEOUT_MS = 8000;
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
function isApiRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function getResponseUser(data) {
    const nestedData = data.data && !('email' in data.data) ? data.data : undefined;
    const directDataUser = data.data && 'email' in data.data ? data.data : undefined;
    return data.user ?? data.profile ?? data.client ?? directDataUser ?? nestedData?.user ?? nestedData?.profile ?? nestedData?.client;
}
function findToken(value, depth = 0) {
    if (!isApiRecord(value) || depth > 4) {
        return '';
    }
    for (const key of TOKEN_KEYS) {
        const token = value[key];
        if (typeof token === 'string' && token.trim()) {
            return token;
        }
    }
    for (const nestedValue of Object.values(value)) {
        const nestedToken = findToken(nestedValue, depth + 1);
        if (nestedToken) {
            return nestedToken;
        }
    }
    return '';
}
function getResponseToken(data) {
    return findToken(data);
}
function getHeaderToken(headers) {
    const authorizationHeader = headers.Authorization ?? headers.authorization ?? headers['x-auth-token'];
    const cookieHeader = headers['set-cookie'];
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
function getImageUrl(value, baseUrl = API_BASE_URL) {
    if (!value) {
        return undefined;
    }
    if (/^https?:\/\//i.test(value)) {
        return value;
    }
    return `${baseUrl}/${value.replace(/^\/+/, '')}`;
}
function getUserName(user) {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    const rawName = user?.name ?? (fullName || undefined);
    return rawName ? capitalizeCompanyName(rawName) : rawName;
}
function getUserCompany(user) {
    const firstCompany = user?.companies?.[0];
    return (user?.company ??
        user?.companyName ??
        user?.businessName ??
        user?.legalName ??
        firstCompany?.companyName ??
        firstCompany?.businessName ??
        firstCompany?.legalName ??
        firstCompany?.name);
}
function getUserPhone(user) {
    return user?.phone ?? user?.phoneNumber ?? user?.mobile;
}
function getErrorMessage(error) {
    const axiosError = error;
    const requestError = axiosError.request;
    if (axiosError.message === 'Network Error') {
        return getNetworkErrorMessage();
    }
    return (axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        requestError?._response ??
        axiosError.message ??
        'Unable to login. Please try again.');
}
const ADMIN_ROLES = ['owner', 'admin', 'superadmin', 'super-admin'];
function isAdminRole(role) {
    return ADMIN_ROLES.includes(String(role ?? '').toLowerCase());
}
function buildSessionUser(user, fallbackEmail) {
    const role = user?.role;
    const isAdmin = isAdminRole(role);
    const phone = user?.phone ?? user?.phoneNumber ?? user?.mobile ?? user?.contactNumber ?? user?.mobileNumber;
    return {
        _id: user?._id,
        address: user?.address,
        addressLine1: user?.addressLine1,
        avatar: getImageUrl(user?.avatar),
        businessName: user?.businessName,
        companies: user?.companies,
        company: getUserCompany(user),
        companyName: user?.companyName,
        countryCode: user?.countryCode,
        country: user?.country,
        dateOfBirth: user?.dateOfBirth,
        dob: user?.dob,
        email: user?.email ?? fallbackEmail,
        id: user?.id,
        firstName: user?.firstName ? capitalizeCompanyName(user.firstName) : user?.firstName,
        image: getImageUrl(user?.image),
        lastName: user?.lastName ? capitalizeCompanyName(user.lastName) : user?.lastName,
        legalName: user?.legalName,
        mobile: user?.mobile,
        name: getUserName(user) || user?.name,
        passportNo: user?.passportNo,
        passportNumber: user?.passportNumber,
        phone,
        phoneNumber: phone,
        contactNumber: phone,
        photo: getImageUrl(user?.photo),
        postalCode: user?.postalCode,
        profileImage: getImageUrl(user?.profileImage),
        profilePicture: getImageUrl(user?.profilePicture),
        role,
        accountType: isAdmin ? 'admin' : 'client',
        isAdmin,
        state: user?.state,
        street: user?.street,
        isCompleteRegistration: user?.isCompleteRegistration,
    };
}
function buildLoginResult(session, email) {
    const loginUser = buildSessionUser(session.user, email);
    return {
        errors: {},
        isSuccess: true,
        email: loginUser.email,
        token: session.token,
        user: loginUser,
        isAdmin: loginUser.isAdmin,
        isRegistrationIncomplete: loginUser.isCompleteRegistration === false,
    };
}
async function requestLogin(route, email, password) {
    const response = await axios.post(route, { email, password }, {
        timeout: API_REQUEST_TIMEOUT_MS,
    });
    const user = getResponseUser(response.data);
    const token = getResponseToken(response.data) || getHeaderToken(response.headers);
    if (!token) {
        const tokenError = new Error('Login response did not include an auth token.');
        tokenError.code = 'NO_TOKEN';
        throw tokenError;
    }
    return { user, token };
}
export async function handleLoginApi({ email, password, }) {
    const errors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
        errors.email = 'Email is required';
    }
    else if (!isValidEmail(trimmedEmail)) {
        errors.email = 'Enter a valid email';
    }
    if (!password) {
        errors.password = 'Password is required';
    }
    else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }
    if (Object.keys(errors).length > 0) {
        Toast.show({
            type: 'error',
            text1: 'Login failed',
            text2: 'Please check your email and password.',
        });
        return {
            errors,
            isSuccess: false,
            email: trimmedEmail,
        };
    }
    let lastError;
    try {
        const session = await requestLogin(CLIENT_LOGIN_ROUTE, trimmedEmail, password);
        return buildLoginResult(session, trimmedEmail);
    }
    catch (error) {
        lastError = error;
    }
    // Client route 401/404 deta hai jab email client collection me nahi hota.
    // Usi case me admin route try karo - is tarah user ko account type choose nahi karna padta.
    const status = lastError?.response?.status;
    if (status === 401 || status === 404) {
        try {
            const session = await requestLogin(ADMIN_LOGIN_ROUTE, trimmedEmail, password);
            return buildLoginResult(session, trimmedEmail);
        }
        catch (adminError) {
            lastError = adminError;
        }
    }
    if (lastError?.code === 'NO_TOKEN') {
        Toast.show({
            type: 'error',
            text1: 'Login failed',
            text2: 'Login response did not include an auth token.',
        });
        return {
            errors: {
                email: 'Check your email',
                password: 'Check your password',
            },
            isSuccess: false,
            email: trimmedEmail,
        };
    }
    const message = getErrorMessage(lastError);
    Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: message,
    });
    return {
        errors: {
            email: 'Check your email',
            password: 'Check your password',
        },
        isSuccess: false,
        email: trimmedEmail,
    };
}
export async function handleGoogleLoginApi({ idToken, }) {
    if (!idToken) {
        Toast.show({
            type: 'error',
            text1: 'Google login failed',
            text2: 'No ID token received from Google.',
        });
        return {
            errors: { general: 'No ID token received from Google.' },
            isSuccess: false,
            email: '',
        };
    }
    let lastError;
    try {
        const response = await axios.post(GOOGLE_LOGIN_ROUTE, { idToken }, {
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        const user = getResponseUser(response.data);
        const token = getResponseToken(response.data) || getHeaderToken(response.headers);
        if (!token) {
            Toast.show({
                type: 'error',
                text1: 'Google login failed',
                text2: 'Login response did not include an auth token.',
            });
            return {
                errors: { general: 'Login response did not include an auth token.' },
                isSuccess: false,
                email: user?.email ?? '',
            };
        }
        const loginUser = {
            _id: user?._id,
            address: user?.address,
            addressLine1: user?.addressLine1,
            avatar: getImageUrl(user?.avatar),
            businessName: user?.businessName,
            companies: user?.companies,
            company: getUserCompany(user),
            companyName: user?.companyName,
            countryCode: user?.countryCode,
            country: user?.country,
            dateOfBirth: user?.dateOfBirth,
            dob: user?.dob,
            email: user?.email ?? '',
            id: user?.id,
            firstName: user?.firstName ? capitalizeCompanyName(user.firstName) : user?.firstName,
            image: getImageUrl(user?.image),
            lastName: user?.lastName ? capitalizeCompanyName(user.lastName) : user?.lastName,
            legalName: user?.legalName,
            mobile: user?.mobile,
            name: getUserName(user),
            passportNo: user?.passportNo,
            passportNumber: user?.passportNumber,
            phone: getUserPhone(user),
            phoneNumber: user?.phoneNumber,
            photo: getImageUrl(user?.photo),
            postalCode: user?.postalCode,
            profileImage: getImageUrl(user?.profileImage),
            profilePicture: getImageUrl(user?.profilePicture),
            role: user?.role,
            state: user?.state,
            street: user?.street,
            isCompleteRegistration: user?.isCompleteRegistration,
        };
        return {
            errors: {},
            isSuccess: true,
            email: loginUser.email,
            token,
            user: loginUser,
            isRegistrationIncomplete: loginUser.isCompleteRegistration === false,
        };
    }
    catch (error) {
        lastError = error;
    }
    const message = getErrorMessage(lastError);
    Toast.show({
        type: 'error',
        text1: 'Google login failed',
        text2: message,
    });
    return {
        errors: { general: message },
        isSuccess: false,
        email: '',
    };
}
export async function handleLoginSendOtpApi({ countryCode, phone, password, }) {
    const errors = {};
    const trimmedPhone = String(phone ?? '').trim();
    if (!trimmedPhone) {
        errors.phone = 'Phone number is required';
    }
    if (!password) {
        errors.password = 'Password is required';
    }
    else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }
    if (Object.keys(errors).length > 0) {
        Toast.show({
            type: 'error',
            text1: 'Login failed',
            text2: 'Please check your phone number and password.',
        });
        return {
            errors,
            isSuccess: false,
            phone: trimmedPhone,
        };
    }
    let lastError;
    let phoneToSend = trimmedPhone.replace(/\D/g, '');
    const cc = String(countryCode ?? '').replace(/\D/g, '');
    if (cc && phoneToSend.startsWith(cc) && phoneToSend.length > cc.length) {
        phoneToSend = phoneToSend.slice(cc.length);
    }
    try {
        const response = await axios.post(LOGIN_SEND_OTP_ROUTE, {
            countryCode,
            phone: phoneToSend,
            password,
        }, {
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        return {
            errors: {},
            isSuccess: true,
            phone: trimmedPhone,
            message: response.data?.message ?? 'Verification code sent',
            rawResponse: response.data,
        };
    }
    catch (error) {
        lastError = error;
    }
    const message = getErrorMessage(lastError);
    Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: message,
    });
    return {
        errors: { general: message },
        isSuccess: false,
        phone: trimmedPhone,
    };
}
export async function handleLoginVerifyOtpApi({ countryCode, phone, otp }) {
    const errors = {};
    const trimmedPhone = String(phone ?? '').trim();
    const trimmedOtp = String(otp ?? '').trim();
    if (!trimmedPhone) {
        errors.phone = 'Phone number is required';
    }
    if (!trimmedOtp) {
        errors.otp = 'OTP is required';
    }
    else if (trimmedOtp.length < 6) {
        errors.otp = 'Enter the 6-digit code';
    }
    if (Object.keys(errors).length > 0) {
        return {
            errors,
            isSuccess: false,
            phone: trimmedPhone,
        };
    }
    let lastError;
    try {
        const response = await axios.post(LOGIN_VERIFY_OTP_ROUTE, {
            countryCode,
            phone: trimmedPhone,
            otp: trimmedOtp,
        }, {
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        const user = getResponseUser(response.data);
        const token = getResponseToken(response.data) || getHeaderToken(response.headers);
        const loginUser = {
            _id: user?._id,
            address: user?.address,
            addressLine1: user?.addressLine1,
            avatar: getImageUrl(user?.avatar),
            businessName: user?.businessName,
            companies: user?.companies,
            company: getUserCompany(user),
            companyName: user?.companyName,
            countryCode: user?.countryCode,
            country: user?.country,
            dateOfBirth: user?.dateOfBirth,
            dob: user?.dob,
            email: user?.email ?? '',
            id: user?.id,
            firstName: user?.firstName ? capitalizeCompanyName(user.firstName) : user?.firstName,
            image: getImageUrl(user?.image),
            lastName: user?.lastName ? capitalizeCompanyName(user.lastName) : user?.lastName,
            legalName: user?.legalName,
            mobile: user?.mobile,
            name: getUserName(user),
            passportNo: user?.passportNo,
            passportNumber: user?.passportNumber,
            phone: getUserPhone(user) ?? trimmedPhone,
            phoneNumber: user?.phoneNumber,
            photo: getImageUrl(user?.photo),
            postalCode: user?.postalCode,
            profileImage: getImageUrl(user?.profileImage),
            profilePicture: getImageUrl(user?.profilePicture),
            role: user?.role,
            state: user?.state,
            street: user?.street,
            isCompleteRegistration: user?.isCompleteRegistration,
        };
        return {
            errors: {},
            isSuccess: true,
            phone: trimmedPhone,
            token,
            user: loginUser,
            message: response.data?.message ?? 'Verified successfully',
            rawResponse: response.data,
        };
    }
    catch (error) {
        lastError = error;
    }
    const message = getErrorMessage(lastError);
    return {
        errors: { otp: message },
        isSuccess: false,
        phone: trimmedPhone,
        message,
    };
}
