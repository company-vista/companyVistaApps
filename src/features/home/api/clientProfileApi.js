import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../../config/api';
import { getNetworkErrorMessage } from '../../../utils/errorMessages';
const CLIENT_PROFILE_PATH = '/api/client/auth/profile';
const CLIENT_PROFILE_ROUTE = `${API_BASE_URL}${CLIENT_PROFILE_PATH}`;
const COMPANY_DETAILS_PATH = '/api/companies';
const COMPANY_COMPLIANCE_HISTORY_PATH = '/api/company-compliance-history';
const API_REQUEST_TIMEOUT_MS = 8000;
function asCompanyArray(value) {
    return Array.isArray(value) ? value : [];
}
function isClientCompanyArray(value) {
    return Array.isArray(value) && value.every(item => {
        if (!item || typeof item !== 'object') {
            return false;
        }
        const record = item;
        return Boolean(record.companyName ??
            record.businessName ??
            record.legalName ??
            record.companyEmail);
    });
}
function findCompanies(value, depth = 0) {
    if (isClientCompanyArray(value)) {
        return value;
    }
    if (!value || typeof value !== 'object' || depth > 4) {
        return [];
    }
    if (Array.isArray(value)) {
        return [];
    }
    const record = value;
    const directCompanies = record.companies ??
        record.companyList ??
        record.allCompanies;
    if (Array.isArray(directCompanies)) {
        return directCompanies;
    }
    for (const nestedValue of Object.values(record)) {
        const nestedCompanies = findCompanies(nestedValue, depth + 1);
        if (nestedCompanies.length > 0) {
            return nestedCompanies;
        }
    }
    return [];
}
function getResponseCompanies(data) {
    const companyCandidates = [
        asCompanyArray(data.companies),
        asCompanyArray(data.data?.companies),
        asCompanyArray(data.user?.companies),
        asCompanyArray(data.client?.companies),
        asCompanyArray(data.data?.user?.companies),
        asCompanyArray(data.data?.client?.companies),
        findCompanies(data),
    ];
    const nonEmptyCompanies = companyCandidates.find(companies => companies.length > 0);
    return nonEmptyCompanies ?? companyCandidates[0] ?? [];
}
function isClientCompany(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const record = value;
    return Boolean(record._id ??
        record.id ??
        record.companyName ??
        record.businessName ??
        record.legalName ??
        record.companyEmail ??
        record.EIN ??
        record.Ein ??
        record.ein ??
        record.einNumber);
}
function findCompany(value, depth = 0) {
    if (isClientCompany(value)) {
        return value;
    }
    if (!value || typeof value !== 'object' || depth > 4 || Array.isArray(value)) {
        return null;
    }
    for (const nestedValue of Object.values(value)) {
        const nestedCompany = findCompany(nestedValue, depth + 1);
        if (nestedCompany) {
            return nestedCompany;
        }
    }
    return null;
}
function getResponseCompany(data) {
    if (isClientCompany(data.company)) {
        return data.company;
    }
    if (isClientCompany(data.data)) {
        return data.data;
    }
    if (data.data &&
        typeof data.data === 'object' &&
        !Array.isArray(data.data) &&
        isClientCompany(data.data.company)) {
        return data.data.company;
    }
    return findCompany(data);
}
function mapCurrentComplianceHistory(current) {
    if (!current) {
        return [];
    }
    const metadataKeys = new Set([
        '_id',
        'company',
        'companyId',
        'createdAt',
        'id',
        'updatedAt',
        'version',
        '__v',
    ]);
    return Object.entries(current).flatMap(([key, value]) => {
        if (metadataKeys.has(key)) {
            return [];
        }
        if (value === null || value === undefined || value === '') {
            return [];
        }
        if (typeof value !== 'object' || Array.isArray(value)) {
            return [{
                    complianceName: key,
                    dueDate: value,
                    title: key,
                }];
        }
        return [{
                ...value,
                complianceName: key,
                title: key,
            }];
    });
}
function findCurrentCompliance(value, depth = 0) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 3) {
        return undefined;
    }
    const record = value;
    if (record.current &&
        typeof record.current === 'object' &&
        !Array.isArray(record.current)) {
        return record.current;
    }
    return findCurrentCompliance(record.data, depth + 1);
}
const complianceKeyPattern = /(filing|address|resident|agent|annual|compliance|due)/i;
function hasComplianceKeys(record) {
    return Object.keys(record).some(key => complianceKeyPattern.test(key));
}
function findCurrentComplianceMap(value, depth = 0) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 3) {
        return undefined;
    }
    const record = value;
    if (hasComplianceKeys(record) && !('current' in record)) {
        return record;
    }
    return findCurrentComplianceMap(record.data, depth + 1);
}
function getResponseComplianceHistory(data) {
    const fromCurrent = mapCurrentComplianceHistory(findCurrentCompliance(data));
    if (fromCurrent.length > 0) {
        return fromCurrent;
    }
    const dataObj = data.data && typeof data.data === 'object' && !Array.isArray(data.data)
        ? data.data
        : undefined;
    const historyCandidates = [
        data.history,
        data.complianceHistory,
        data.records,
        dataObj?.history,
        dataObj?.complianceHistory,
        dataObj?.records,
    ];
    for (const candidate of historyCandidates) {
        if (Array.isArray(candidate) && candidate.length > 0) {
            return candidate;
        }
    }
    const directMap = findCurrentComplianceMap(data) ?? findCurrentComplianceMap(dataObj);
    if (directMap) {
        const mapped = mapCurrentComplianceHistory(directMap);
        if (mapped.length > 0) {
            return mapped;
        }
    }
    return [];
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
        'Unable to load companies. Please try again.');
}
export async function fetchClientCompanies({ token, userId, }) {
    if (!token) {
        Toast.show({ type: 'info', text1: 'Auth token missing. Please login again.' });
        return {
            companies: [],
            error: 'Auth token missing. Please login again.',
            isSuccess: false,
            totalCompanies: 0,
        };
    }
    try {
        let lastError = '';
        try {
            const params = userId ? { userId, clientId: userId } : undefined;
            const response = await axios.get(CLIENT_PROFILE_ROUTE, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-auth-token': token,
                },
                timeout: API_REQUEST_TIMEOUT_MS,
                params,
            });
            const companies = getResponseCompanies(response.data);
            return {
                companies,
                error: '',
                isSuccess: response.data.success ?? true,
                totalCompanies: response.data.totalCompanies ?? companies.length,
            };
        }
        catch (routeError) {
            lastError = getErrorMessage(routeError);
            Toast.show({ type: 'error', text1: 'Profile fetch failed', text2: lastError });
        }
        return {
            companies: [],
            error: lastError || 'Unable to load companies. Please try again.',
            isSuccess: false,
            totalCompanies: 0,
        };
    }
    catch (error) {
        Toast.show({ type: 'error', text1: 'Profile API error', text2: getErrorMessage(error) });
        return {
            companies: [],
            error: getErrorMessage(error),
            isSuccess: false,
            totalCompanies: 0,
        };
    }
}
export async function fetchClientCompanyDetails({ companyId, token, }) {
    if (!token) {
        Toast.show({ type: 'info', text1: 'Auth token missing. Please login again.' });
        return {
            company: null,
            error: 'Auth token missing. Please login again.',
            isSuccess: false,
        };
    }
    if (!companyId) {
        Toast.show({ type: 'info', text1: 'Company ID missing.' });
        return {
            company: null,
            error: 'Company id missing.',
            isSuccess: false,
        };
    }
    const companyDetailsRoute = `${API_BASE_URL}${COMPANY_DETAILS_PATH}/${companyId}`;
    try {
        const response = await axios.get(companyDetailsRoute, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-auth-token': token,
            },
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        const company = getResponseCompany(response.data);
        return {
            company,
            error: company ? '' : 'Company details not found.',
            isSuccess: response.data.success ?? Boolean(company),
        };
    }
    catch (error) {
        Toast.show({ type: 'error', text1: 'Company details error', text2: getErrorMessage(error) });
        return {
            company: null,
            error: getErrorMessage(error),
            isSuccess: false,
        };
    }
}
// fetch company compliance
export async function fetchCompanyComplianceHistory({ companyId, token, }) {
    if (!token) {
        Toast.show({ type: 'info', text1: 'Auth token missing. Please login again.' });
        return {
            error: 'Auth token missing. Please login again.',
            history: [],
            isSuccess: false,
        };
    }
    if (!companyId) {
        Toast.show({ type: 'info', text1: 'Company ID missing.' });
        return {
            error: 'Company id missing.',
            history: [],
            isSuccess: false,
        };
    }
    const complianceHistoryRoute = `${API_BASE_URL}${COMPANY_COMPLIANCE_HISTORY_PATH}/${companyId}/compliance-history`;
    try {
        const response = await axios.get(complianceHistoryRoute, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-auth-token': token,
            },
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        const history = getResponseComplianceHistory(response.data);
        return {
            error: '',
            history,
            isSuccess: response.data.success ?? true,
        };
    }
    catch (error) {
        return {
            error: getErrorMessage(error),
            history: [],
            isSuccess: false,
        };
    }
}
