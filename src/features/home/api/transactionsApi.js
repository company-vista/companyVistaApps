import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { getNetworkErrorMessage } from '../../../utils/errorMessages';

// Web client transaction history (vista-fronted CompanyTransactionHistory.jsx) ise
// use karta hai: GET /api/subscription/payment -> protectClient + getClientPayments.
// Ye logged-in client ki hi companies ke payments (Payment + Transaction merged)
// deta hai, is liye company filter client-side karna padta hai.
// Response: { success, data: [...], pagination: { page, limit, total, pages } }
const TRANSACTIONS_ROUTE = `${API_BASE_URL}/api/subscription/payment`;
const API_REQUEST_TIMEOUT_MS = 8000;
const TRANSACTIONS_PAGE_LIMIT = 100;
const TRANSACTIONS_MAX_PAGES = 50;

function getResponseTransactions(data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (!data || typeof data !== 'object') {
        return [];
    }
    if (Array.isArray(data.data)) {
        return data.data;
    }
    if (Array.isArray(data.transactions)) {
        return data.transactions;
    }
    if (data.data && typeof data.data === 'object') {
        if (Array.isArray(data.data.transactions)) {
            return data.data.transactions;
        }
        if (Array.isArray(data.data.records)) {
            return data.data.records;
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
        'Unable to load transactions. Please try again.');
}

export async function fetchCompanyTransactions({ companyId, token } = {}) {
    try {
        const headers = token
            ? {
                Authorization: `Bearer ${token}`,
                'x-auth-token': token,
            }
            : undefined;
        // Backend selected company ke hisaab se filter nahi karta (koi companyId
        // query accept nahi hoti) — saare pages laao, filtering screen me hoti hai.
        const transactions = [];
        let page = 1;
        let totalPages = 1;
        do {
            const response = await axios.get(TRANSACTIONS_ROUTE, {
                headers,
                params: {
                    page,
                    limit: TRANSACTIONS_PAGE_LIMIT,
                    ...(companyId ? { companyId } : {}),
                },
                timeout: API_REQUEST_TIMEOUT_MS,
            });
            transactions.push(...getResponseTransactions(response.data));
            const pages = Number(response.data?.pagination?.pages);
            totalPages = Number.isFinite(pages) && pages > 0 ? pages : 1;
            page += 1;
        } while (page <= totalPages && page <= TRANSACTIONS_MAX_PAGES);
        return {
            error: '',
            isSuccess: true,
            transactions,
        };
    }
    catch (error) {
        return {
            error: getErrorMessage(error),
            isSuccess: false,
            transactions: [],
        };
    }
}
