import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../../config/api';
const CLIENT_LOGIN_ROUTE = `${API_BASE_URL}/api/client/auth/login`;
const GOOGLE_LOGIN_ROUTE = `${API_BASE_URL}/api/client/auth/google/login`;
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
    return user?.name ?? (fullName || undefined);
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
        return 'Unable to reach server. Check that the backend is running on port 5000.';
    }
    return (axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        requestError?._response ??
        axiosError.message ??
        'Unable to login. Please try again.');
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
        const response = await axios.post(CLIENT_LOGIN_ROUTE, {
            email: trimmedEmail,
            password,
        }, {
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        const user = getResponseUser(response.data);
        const token = getResponseToken(response.data) || getHeaderToken(response.headers);
        if (!token) {
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
            email: user?.email ?? trimmedEmail,
            id: user?.id,
            firstName: user?.firstName,
            image: getImageUrl(user?.image),
            lastName: user?.lastName,
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
        };
        return {
            errors,
            isSuccess: true,
            email: loginUser.email,
            token,
            user: loginUser,
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
            firstName: user?.firstName,
            image: getImageUrl(user?.image),
            lastName: user?.lastName,
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
        };
        return {
            errors: {},
            isSuccess: true,
            email: loginUser.email,
            token,
            user: loginUser,
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
