import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { capitalizeCompanyName } from '../../../constants/convertFirstChar';
const CLIENT_PROFILE_ROUTE = `${API_BASE_URL}/api/client/auth/profile`;
function getErrorMessage(error) {
    const axiosError = error;
    const requestError = axiosError.request;
    return (axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        requestError?._response ??
        axiosError.message ??
        'Unable to update profile. Please try again.');
}
function splitName(name) {
    const [firstName = '', ...lastNameParts] = name.trim().split(/\s+/);
    return {
        firstName,
        lastName: lastNameParts.join(' '),
    };
}
function getResponseUser(data) {
    const user = data.user ?? data.client ?? data.data?.user ?? data.data?.client;
    const companies = user?.companies ?? data.companies ?? data.data?.companies;
    if (!user) return undefined;
    const rawName = user.name ?? ([user.firstName, user.lastName].filter(Boolean).join(' ') || undefined);
    const capitalizedName = rawName ? capitalizeCompanyName(rawName) : rawName;
    return {
        ...user,
        name: capitalizedName,
        firstName: user.firstName ? capitalizeCompanyName(user.firstName) : user.firstName,
        lastName: user.lastName ? capitalizeCompanyName(user.lastName) : user.lastName,
        companies,
    };
}
export async function fetchClientProfile(token) {
    if (!token) {
        return {
            error: 'Auth token missing. Please login again.',
            isSuccess: false,
            user: undefined,
        };
    }
    try {
        const response = await axios.get(CLIENT_PROFILE_ROUTE, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-auth-token': token,
            },
        });
        return {
            error: '',
            isSuccess: response.data.success ?? true,
            user: getResponseUser(response.data),
        };
    }
    catch (error) {
        return {
            error: getErrorMessage(error),
            isSuccess: false,
            user: undefined,
        };
    }
}
export async function updateClientProfile({ payload, token, }) {
    if (!token) {
        return {
            error: 'Auth token missing. Please login again.',
            isSuccess: false,
            user: undefined,
        };
    }
    try {
        const nameParts = splitName(payload.name);
        const requestPayload = {
            ...nameParts,
            address: payload.address,
            addressLine1: payload.addressLine1 ?? payload.address?.addressLine1 ?? payload.address?.street,
            city: payload.city ?? payload.address?.city,
            company: payload.company,
            country: payload.country ?? payload.address?.country,
            countryCode: payload.countryCode,
            dateOfBirth: payload.dateOfBirth?.trim(),
            dob: payload.dateOfBirth?.trim(),
            email: payload.email.trim(),
            fullName: payload.name.trim(),
            mobile: payload.phone.trim(),
            name: payload.name.trim(),
            passportNo: payload.passportNumber?.trim(),
            passportNumber: payload.passportNumber?.trim(),
            phone: payload.phone.trim(),
            phoneNumber: payload.phone.trim(),
            postalCode: payload.postalCode ?? payload.address?.postalCode,
            state: payload.address?.state,
            street: payload.addressLine1 ?? payload.address?.street ?? payload.address?.addressLine1,
        };
        const response = await axios.put(CLIENT_PROFILE_ROUTE, requestPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-auth-token': token,
            },
        });
        return {
            error: '',
            isSuccess: response.data.success ?? true,
            user: getResponseUser(response.data),
        };
    }
    catch (error) {
        return {
            error: getErrorMessage(error),
            isSuccess: false,
            user: undefined,
        };
    }
}
