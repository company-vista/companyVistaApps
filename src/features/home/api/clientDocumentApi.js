import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import Toast from 'react-native-toast-message';
const COMPANY_DOCUMENTS_PATH = '/api/documents/company';
const API_REQUEST_TIMEOUT_MS = 8000;
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
        'Unable to load documents. Please try again.');
}
function getResponseDocuments(data) {
    if (Array.isArray(data.documents)) {
        return data.documents;
    }
    if (Array.isArray(data.data)) {
        return data.data;
    }
    if (data.data && typeof data.data === 'object' && Array.isArray(data.data.documents)) {
        return data.data.documents;
    }
    return [];
}
function getDocumentContentType(mimeType, viewUrl) {
    if (mimeType) {
        return mimeType;
    }
    const path = viewUrl?.split('?')[0].toLowerCase() ?? '';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        return 'image/jpeg';
    }
    if (path.endsWith('.png')) {
        return 'image/png';
    }
    if (path.endsWith('.webp')) {
        return 'image/webp';
    }
    if (path.endsWith('.pdf')) {
        return 'application/pdf';
    }
    return 'application/octet-stream';
}
export async function fetchCompanyDocuments({ companyId, token, }) {
    if (!token) {
        Toast.show({ type: "Company documents API skipped: auth token missing" });
        return {
            documents: [],
            error: 'Auth token missing. Please login again.',
            isSuccess: false,
        };
    }
    if (!companyId) {
        Toast.show({ type: 'Company documents API skipped: company id missing' });
        return {
            documents: [],
            error: 'Company id missing.',
            isSuccess: false,
        };
    }
    const documentsRoute = `${API_BASE_URL}${COMPANY_DOCUMENTS_PATH}/${companyId}`;
    try {
        const response = await axios.get(documentsRoute, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-auth-token': token,
            },
            timeout: API_REQUEST_TIMEOUT_MS,
        });
        const documents = getResponseDocuments(response.data);
        return {
            documents,
            error: '',
            isSuccess: response.data.success ?? true,
        };
    }
    catch (error) {
        Toast.show({ type: 'error', text1: 'Company documents API error', text2: getErrorMessage(error) });
        return {
            documents: [],
            error: getErrorMessage(error),
            isSuccess: false,
        };
    }
}
export async function fetchDocumentView({ mimeType, token, viewUrl, }) {
    if (!token) {
        Toast.show({ type: 'Document view API skipped: auth token missing' });
        return {
            data: null,
            error: 'Auth token missing. Please login again.',
            isSuccess: false,
        };
    }
    if (!viewUrl) {
        Toast.show({ type: 'Document view API skipped: view url missing' });
        return {
            data: null,
            error: 'Document view URL missing.',
            isSuccess: false,
        };
    }
    const documentViewRoute = viewUrl.startsWith('http')
        ? viewUrl
        : `${API_BASE_URL}${viewUrl}`;
    const contentType = getDocumentContentType(mimeType, viewUrl);
    return {
        data: {
            contentType,
            viewUri: documentViewRoute,
        },
        error: '',
        isSuccess: true,
    };
}
