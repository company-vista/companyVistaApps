import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../../../config/api';
const COMPANY_REGISTRATION_ROUTE = `${API_BASE_URL}/api/company/public-register`;
const API_REQUEST_TIMEOUT_MS = 30000;
export function getCompanyRegistrationUpdateRoute(companyId) {
    return `${API_BASE_URL}/api/companies/${companyId}/registration`;
}
export async function submitCompanyRegistration(payload, token) {
    if (!token) {
        return { error: 'Auth token missing. Please login again.', isSuccess: false };
    }
    try {
        const formData = new FormData();
        const FILE_FIELD_MAP = {
            holdingFiles: 'companyRegistrationDocuments',
            otherFiles: 'otherDocuments',
        };
        const MIME_MAP = {
            pdf: 'application/pdf',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        Object.entries(payload).forEach(([key, value]) => {
            if (value === null || value === undefined)
                return;
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0]?.name && value[0]?.uri) {
                const fieldName = FILE_FIELD_MAP[key] || key;
                value.forEach((file) => {
                    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
                    formData.append(fieldName, {
                        uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                        name: file.name,
                        type: MIME_MAP[fileExt] || 'application/octet-stream',
                    });
                });
            }
            else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                formData.append(key, JSON.stringify(value));
            }
            else {
                formData.append(key, String(value));
            }
        });
        const response = await axios.post(COMPANY_REGISTRATION_ROUTE, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-auth-token': token,
                // Let axios set Content-Type with boundary automatically for FormData
            },
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        const body = response.data;
        const ok = body?.isSuccess ?? body?.success ?? false;
        if (!ok) {
            return {
                error: body?.message ?? body?.error ?? 'Server rejected the registration.',
                isSuccess: false,
            };
        }
        return {
            error: '',
            isSuccess: true,
            data: body?.data ?? body?.company ?? body,
        };
    }
    catch (error) {
        const axiosError = error;
        console.log('[submitCompanyRegistration] error:', {
            message: axiosError.message,
            code: axiosError.code,
            status: axiosError.response?.status,
            data: axiosError.response?.data,
            url: COMPANY_REGISTRATION_ROUTE,
        });
        const isNetworkError = !axiosError.response && axiosError.message === 'Network Error';
        return {
            error: axiosError.response?.data?.message ??
                axiosError.response?.data?.error ??
                (isNetworkError ? 'Network error. Please check your internet and try again.' : axiosError.message) ??
                'Registration failed. Please try again.',
            isSuccess: false,
        };
    }
}
export async function updateCompanyRegistration(companyId, payload, token) {
    if (!token) {
        return { error: 'Auth token missing. Please login again.', isSuccess: false };
    }
    try {
        const bodyPayload = {
            registrationRequestData: payload,
            companyName: payload.companyName,
            alternateCompanyName: payload.alternateCompanyName,
            countryOfIncorporation: payload.countryOfIncorporation,
            stateOfRegistration: payload.stateOfRegistration,
            companyType: payload.companyType,
            ownershipType: payload.ownershipType,
            companyWebsite: payload.companyWebsite,
            principalActivity: payload.principalActivity,
            companyIntroduction: payload.companyIntroduction,
            hasLocalAddress: payload.hasLocalAddress,
            hasLocalRepresentative: payload.hasLocalRepresentative,
        };
        const updateRoute = getCompanyRegistrationUpdateRoute(companyId);
        const response = await axios.put(updateRoute, bodyPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-auth-token': token,
                'Content-Type': 'application/json',
            },
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        const body = response.data;
        const ok = body?.success ?? false;
        if (!ok) {
            return {
                error: body?.message ?? body?.error ?? 'Server rejected the update.',
                isSuccess: false,
            };
        }
        return {
            error: '',
            isSuccess: true,
            data: body?.data ?? body,
        };
    }
    catch (error) {
        const axiosError = error;
        console.log('[updateCompanyRegistration] error:', {
            message: axiosError.message,
            code: axiosError.code,
            status: axiosError.response?.status,
            data: axiosError.response?.data,
        });
        const isNetworkError = !axiosError.response && axiosError.message === 'Network Error';
        return {
            error: axiosError.response?.data?.message ??
                axiosError.response?.data?.error ??
                (isNetworkError ? 'Network error. Please check your internet and try again.' : axiosError.message) ??
                'Update failed. Please try again.',
            isSuccess: false,
        };
    }
}
