import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const COMPANY_BASE_URL = `${API_BASE_URL}/api/companies`;
const COMPANY_COMPLIANCE_URL = `${API_BASE_URL}/api/company-compliance`;
const COMPANY_DOCUMENTS_URL = `${API_BASE_URL}/api/documents/company`;
const DOCUMENT_UPLOAD_URL = `${API_BASE_URL}/api/documents/upload/multiple`;
const REQUEST_TIMEOUT_MS = 15000;
const UPLOAD_TIMEOUT_MS = 60000;
const LIST_CACHE_TTL_MS = 2 * 60 * 1000;

const listCache = new Map();
const inFlightRequests = new Map();

function buildListCacheKey({
  category = '',
  search = '',
  status = 'all',
} = {}) {
  return JSON.stringify({
    category: category || '',
    search: String(search || '')
      .trim()
      .toLowerCase(),
    status: status || 'all',
  });
}

export function getCachedCompanies(args = {}) {
  const key = buildListCacheKey(args);
  const entry = listCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > LIST_CACHE_TTL_MS) {
    listCache.delete(key);
    return null;
  }
  return entry.data;
}

export function invalidateCompaniesCache() {
  listCache.clear();
}

export function prefetchCompanies(args = {}) {
  return fetchCompanies(args).catch(() => null);
}

function buildHeaders(token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['x-auth-token'] = token;
  }
  return headers;
}

function requireToken(token) {
  if (!token) {
    throw new Error('Auth token missing. Please login again.');
  }
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}

async function request(config, token) {
  requireToken(token);
  try {
    const response = await axios({
      timeout: REQUEST_TIMEOUT_MS,
      ...config,
      headers: {
        ...buildHeaders(token),
        ...(config.headers || {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

async function publicRequest(config) {
  try {
    const response = await axios({
      timeout: REQUEST_TIMEOUT_MS,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

function toList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.companies)) return data.companies;
  return [];
}

function toItem(data) {
  return data?.data?.company ?? data?.company ?? data?.data ?? data ?? null;
}

export async function fetchCompanies({
  token,
  category = 'formed',
  search = '',
  status = 'all',
} = {}) {
  const params = { category };
  if (search && String(search).trim()) {
    params.search = String(search).trim();
  }
  if (status && status !== 'all') {
    params.status = status;
  }

  const cacheKey = buildListCacheKey({ category, search, status });
  const pending = inFlightRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const requestPromise = request(
    { method: 'get', url: COMPANY_BASE_URL, params },
    token,
  )
    .then(data => {
      const list = toList(data);
      listCache.set(cacheKey, { data: list, timestamp: Date.now() });
      return list;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

export async function fetchCompanyStats({ token } = {}) {
  const data = await request(
    { method: 'get', url: `${COMPANY_BASE_URL}/stats` },
    token,
  );
  return data?.stats ?? data?.data?.stats ?? data?.data ?? null;
}

export async function fetchCompanyById({ token, companyId } = {}) {
  if (!companyId) throw new Error('Company id missing.');
  const data = await publicRequest({
    method: 'get',
    url: `${COMPANY_BASE_URL}/${companyId}`,
  });
  return toItem(data);
}

export async function fetchCompanyDocuments({ token, companyId } = {}) {
  if (!companyId) throw new Error('Company id missing.');
  const data = await request(
    { method: 'get', url: `${COMPANY_DOCUMENTS_URL}/${companyId}` },
    token,
  );
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.documents)) return data.documents;
  return [];
}

export async function fetchCompanyCompliance({ companyId } = {}) {
  if (!companyId) throw new Error('Company id missing.');
  const data = await publicRequest({
    method: 'get',
    url: `${COMPANY_COMPLIANCE_URL}/${companyId}`,
  });
  return data?.data ?? null;
}

export async function createCompany({ token, payload } = {}) {
  const data = await request(
    { method: 'post', url: COMPANY_BASE_URL, data: payload },
    token,
  );
  return toItem(data);
}

export async function updateCompany({ token, companyId, payload } = {}) {
  if (!companyId) throw new Error('Company id missing.');
  const data = await request(
    { method: 'put', url: `${COMPANY_BASE_URL}/${companyId}`, data: payload },
    token,
  );
  return toItem(data);
}

export const SUPPORTED_DOCUMENT_TYPES = [
  'mailsAndLetters',
  'companyRegistrationDocuments',
  'federalTaxDocuments',
  'annualStateFilingDocuments',
  'otherDocuments',
];

export const YEARLY_FILING_TYPES = [
  'federalTaxDocuments',
  'annualStateFilingDocuments',
];

export async function uploadCompanyDocuments({
  token,
  companyId,
  filesByType,
  filingYears = {},
  country = 'US',
  description = '',
  expiresAt = '',
  tags = [],
  sendNotification = true,
  isDraft = false,
} = {}) {
  requireToken(token);
  if (!companyId) throw new Error('Company id missing.');
  if (!filesByType || typeof filesByType !== 'object') {
    throw new Error('Select at least one file to upload.');
  }

  const unknownType = Object.keys(filesByType).find(
    type =>
      !SUPPORTED_DOCUMENT_TYPES.includes(type) &&
      Array.isArray(filesByType[type]) &&
      filesByType[type].length,
  );
  if (unknownType) throw new Error(`Unsupported document type: ${unknownType}`);

  const groupEntries = SUPPORTED_DOCUMENT_TYPES.map(type => [
    type,
    Array.isArray(filesByType[type]) ? filesByType[type] : [],
  ]);
  const totalFiles = groupEntries.reduce(
    (total, [, files]) => total + files.length,
    0,
  );
  if (!totalFiles) throw new Error('Select at least one file to upload.');

  YEARLY_FILING_TYPES.forEach(type => {
    const count = filesByType[type]?.length || 0;
    if (count && !filingYears[type]) {
      throw new Error('Select the filing year for this document type.');
    }
  });

  const normalizedFilingYears = Object.fromEntries(
    YEARLY_FILING_TYPES.filter(
      type => filesByType[type]?.length && filingYears[type],
    ).map(type => [type, String(filingYears[type])]),
  );

  const formData = new FormData();
  formData.append('companyId', companyId);
  formData.append('country', country || 'US');
  formData.append('description', description || '');
  formData.append('expiresAt', expiresAt || '');
  formData.append('tags', JSON.stringify(Array.isArray(tags) ? tags : []));
  formData.append('sendNotification', String(sendNotification));
  formData.append('isDraft', String(isDraft));
  formData.append('filingYears', JSON.stringify(normalizedFilingYears));
  groupEntries.forEach(([type, files]) => {
    files.forEach(file => {
      formData.append(type, {
        uri: file.uri,
        name: file.name || `document-${Date.now()}`,
        type: file.type || 'application/octet-stream',
      });
    });
  });

  return request(
    {
      method: 'post',
      url: DOCUMENT_UPLOAD_URL,
      data: formData,
      timeout: UPLOAD_TIMEOUT_MS,
    },
    token,
  );
}

export async function deleteCompany({ token, companyId } = {}) {
  if (!companyId) throw new Error('Company id missing.');
  const data = await request(
    { method: 'delete', url: `${COMPANY_BASE_URL}/${companyId}` },
    token,
  );
  return data;
}

export async function searchCompanies({ keyword, search, q } = {}) {
  const term = keyword || search || q;
  if (!term || !String(term).trim()) {
    return [];
  }
  const trimmed = String(term).trim();
  try {
    const data = await publicRequest({
      method: 'get',
      url: `${COMPANY_BASE_URL}/search`,
      params: { search: trimmed, q: trimmed, keyword: trimmed },
    });
    return toList(data);
  } catch (error) {
    try {
      const data = await publicRequest({
        method: 'get',
        url: `${COMPANY_BASE_URL}/search`,
        params: { name: trimmed },
      });
      return toList(data);
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
}

export async function fetchAllCompaniesSimple({ token } = {}) {
  const data = await publicRequest({
    method: 'get',
    url: `${COMPANY_BASE_URL}/all/simple`,
  });
  return toList(data);
}

export async function verifyGst({ token, gst } = {}) {
  const data = await request(
    { method: 'post', url: `${COMPANY_BASE_URL}/verify-gst`, data: { gst } },
    token,
  );
  return data;
}

export async function bulkImportCompanies({ token, companies } = {}) {
  const data = await request(
    {
      method: 'post',
      url: `${COMPANY_BASE_URL}/bulk-import`,
      data: { companies },
    },
    token,
  );
  return data;
}

export async function bulkUpdateCompanies({ token, companies } = {}) {
  const data = await request(
    {
      method: 'put',
      url: `${COMPANY_BASE_URL}/bulk-update`,
      data: { companies },
    },
    token,
  );
  return data;
}

export async function fetchCompaniesByShareholder({
  token,
  shareholderId,
} = {}) {
  if (!shareholderId) throw new Error('Shareholder id missing.');
  const data = await request(
    {
      method: 'get',
      url: `${COMPANY_BASE_URL}/shareholder/companies`,
      params: { shareholder: shareholderId },
    },
    token,
  );
  return toList(data);
}

export async function searchClientsForShareholder({ token, query } = {}) {
  const data = await request(
    {
      method: 'get',
      url: `${COMPANY_BASE_URL}/clients/search`,
      params: { search: query },
    },
    token,
  );
  return toList(data);
}

export async function addCompanyShareholder({
  token,
  companyId,
  payload,
} = {}) {
  if (!companyId) throw new Error('Company id missing.');
  const data = await request(
    {
      method: 'post',
      url: `${COMPANY_BASE_URL}/${companyId}/add-shareholder`,
      data: payload,
    },
    token,
  );
  return data;
}

export async function removeCompanyShareholder({
  token,
  companyId,
  shareholderId,
} = {}) {
  if (!companyId || !shareholderId)
    throw new Error('Company or shareholder id missing.');
  const data = await request(
    {
      method: 'delete',
      url: `${COMPANY_BASE_URL}/${companyId}/remove-shareholder/${shareholderId}`,
    },
    token,
  );
  return data;
}

export async function updateShareholderPercentage({
  token,
  companyId,
  shareholderId,
  sharePercentage,
} = {}) {
  if (!companyId || !shareholderId)
    throw new Error('Company or shareholder id missing.');
  const data = await request(
    {
      method: 'patch',
      url: `${COMPANY_BASE_URL}/${companyId}/shareholder/${shareholderId}/percentage`,
      data: { sharePercentage },
    },
    token,
  );
  return data;
}

export async function triggerShareholderAiCall({
  token,
  companyId,
  shareholderId,
} = {}) {
  if (!companyId || !shareholderId)
    throw new Error('Company or shareholder id missing.');
  const data = await request(
    {
      method: 'post',
      url: `${COMPANY_BASE_URL}/${companyId}/shareholder/${shareholderId}/ai-call`,
    },
    token,
  );
  return data;
}

export async function fetchAccessGrantsForClient({ token, clientId } = {}) {
  if (!clientId) throw new Error('Client id missing.');
  const data = await request(
    { method: 'get', url: `${COMPANY_BASE_URL}/access/client/${clientId}` },
    token,
  );
  return toList(data);
}

export async function fetchCompanyAccessGrants({ token, companyId } = {}) {
  if (!companyId) throw new Error('Company id missing.');
  const data = await request(
    { method: 'get', url: `${COMPANY_BASE_URL}/${companyId}/access` },
    token,
  );
  return toList(data);
}

export async function grantCompanyAccess({ token, companyId, payload } = {}) {
  if (!companyId) throw new Error('Company id missing.');
  const data = await request(
    {
      method: 'post',
      url: `${COMPANY_BASE_URL}/${companyId}/access`,
      data: payload,
    },
    token,
  );
  return data;
}

export async function revokeCompanyAccess({ token, companyId, clientId } = {}) {
  if (!companyId || !clientId) throw new Error('Company or client id missing.');
  const data = await request(
    {
      method: 'delete',
      url: `${COMPANY_BASE_URL}/${companyId}/access/${clientId}`,
    },
    token,
  );
  return data;
}

export async function markClientConfirmationByAdmin({
  token,
  companyId,
  payload,
} = {}) {
  if (!companyId) throw new Error('Company id missing.');
  const data = await request(
    {
      method: 'patch',
      url: `${COMPANY_BASE_URL}/${companyId}/admin-client-confirmation`,
      data: payload,
    },
    token,
  );
  return data;
}
