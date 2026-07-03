import axios, { type AxiosError } from 'axios';

import { API_BASE_URL } from '../../../config/api';

const CLIENT_PROFILE_PATH = '/api/client/auth/profile';
const CLIENT_PROFILE_ROUTE = `${API_BASE_URL}${CLIENT_PROFILE_PATH}`;
const COMPANY_DETAILS_PATH = '/api/companies';
const COMPANY_COMPLIANCE_HISTORY_PATH = '/api/company-compliance-history';
const API_REQUEST_TIMEOUT_MS = 8000;

export type ClientCompany = {
  _id?: string;
  address?: string;
  businessName?: string;
  companyEmail?: string;
  Ein?: string;
  EIN?: string;
  ein?: string;
  einNumber?: string;
  federalTaxId?: string;
  countryOfIncorporation?: string;
  id?: string;
  isActive?: boolean;
  businessType?: string;
  companyType?: string;
  entityType?: string;
  legalName?: string;
  companyName?: string;
  name?: string;
  type?: string;
  email?: string;
  mobile?: string;
  phoneNumber?: string;
  phone?: string;
  taxId?: string;
  taxIdNumber?: string;
  registrationStatus?: string | boolean;
  status?: string | boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  shareholders?: any[];
};

type ClientProfileResponse = {
  client?: {
    companies?: ClientCompany[];
  };
  companies?: ClientCompany[];
  data?: {
    client?: {
      companies?: ClientCompany[];
    };
    companies?: ClientCompany[];
    user?: {
      companies?: ClientCompany[];
    };
  };
  success?: boolean;
  totalCompanies?: number;
  user?: {
    companies?: ClientCompany[];
  };
};

type ClientCompanyDetailsResponse = {
  company?: ClientCompany;
  data?: ClientCompany | {
    company?: ClientCompany;
  };
  success?: boolean;
};

export type CompanyComplianceHistoryItem = Record<string, unknown>;

type CompanyComplianceHistoryResponse = {
  complianceHistory?: CompanyComplianceHistoryItem[];
  data?: CompanyComplianceHistoryItem[] | {
    complianceHistory?: CompanyComplianceHistoryItem[];
    current?: Record<string, unknown>;
    history?: CompanyComplianceHistoryItem[];
    records?: CompanyComplianceHistoryItem[];
  };
  history?: CompanyComplianceHistoryItem[];
  records?: CompanyComplianceHistoryItem[];
  success?: boolean;
};

function asCompanyArray(value: unknown): ClientCompany[] {
  return Array.isArray(value) ? value : [];
}

function isClientCompanyArray(value: unknown): value is ClientCompany[] {
  return Array.isArray(value) && value.every(item => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const record = item as Record<string, unknown>;

    return Boolean(
      record.companyName ??
      record.businessName ??
      record.legalName ??
      record.companyEmail,
    );
  });
}

function findCompanies(value: unknown, depth = 0): ClientCompany[] {
  if (isClientCompanyArray(value)) {
    return value;
  }

  if (!value || typeof value !== 'object' || depth > 4) {
    return [];
  }

  if (Array.isArray(value)) {
    return [];
  }

  const record = value as Record<string, unknown>;
  const directCompanies =
    record.companies ??
    record.companyList ??
    record.allCompanies;

  if (Array.isArray(directCompanies)) {
    return directCompanies as ClientCompany[];
  }

  for (const nestedValue of Object.values(record)) {
    const nestedCompanies = findCompanies(nestedValue, depth + 1);

    if (nestedCompanies.length > 0) {
      return nestedCompanies;
    }
  }

  return [];
}

function getResponseCompanies(data: ClientProfileResponse) {
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

function isClientCompany(value: unknown): value is ClientCompany {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return Boolean(
    record._id ??
    record.id ??
    record.companyName ??
    record.businessName ??
    record.legalName ??
    record.companyEmail ??
    record.EIN ??
    record.Ein ??
    record.ein ??
    record.einNumber,
  );
}

function findCompany(value: unknown, depth = 0): ClientCompany | null {
  if (isClientCompany(value)) {
    return value;
  }

  if (!value || typeof value !== 'object' || depth > 4 || Array.isArray(value)) {
    return null;
  }

  for (const nestedValue of Object.values(value as Record<string, unknown>)) {
    const nestedCompany = findCompany(nestedValue, depth + 1);

    if (nestedCompany) {
      return nestedCompany;
    }
  }

  return null;
}

function getResponseCompany(data: ClientCompanyDetailsResponse) {
  if (isClientCompany(data.company)) {
    return data.company;
  }

  if (isClientCompany(data.data)) {
    return data.data;
  }

  if (
    data.data &&
    typeof data.data === 'object' &&
    !Array.isArray(data.data) &&
    isClientCompany(data.data.company)
  ) {
    return data.data.company;
  }

  return findCompany(data);
}

function mapCurrentComplianceHistory(
  current: Record<string, unknown> | undefined,
): CompanyComplianceHistoryItem[] {
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
      ...(value as Record<string, unknown>),
      complianceName: key,
      title: key,
    }];
  });
}

function findCurrentCompliance(
  value: unknown,
  depth = 0,
): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 3) {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  if (
    record.current &&
    typeof record.current === 'object' &&
    !Array.isArray(record.current)
  ) {
    return record.current as Record<string, unknown>;
  }

  return findCurrentCompliance(record.data, depth + 1);
}

function getResponseComplianceHistory(data: CompanyComplianceHistoryResponse) {
  return mapCurrentComplianceHistory(findCurrentCompliance(data));
}

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const requestError = axiosError.request as { _response?: string } | undefined;

  if (axiosError.message === 'Network Error') {
    return 'Unable to reach server. Check that the backend is running on port 5000.';
  }

  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.error ??
    requestError?._response ??
    axiosError.message ??
    'Unable to load companies. Please try again.'
  );
}

type FetchClientCompaniesParams = {
  token?: string | null;
  userId?: string | null;
};

export async function fetchClientCompanies({
  token,
  userId,
}: FetchClientCompaniesParams) {
  if (!token) {
    console.log('Client profile API skipped: auth token missing');

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
      const response = await axios.get<ClientProfileResponse>(CLIENT_PROFILE_ROUTE, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
        },
        timeout: API_REQUEST_TIMEOUT_MS,
        params,
      });
      const companies = getResponseCompanies(response.data);

      console.log('Client profile companies loaded', {
        companyCount: companies.length,
        success: response.data.success,
        url: CLIENT_PROFILE_ROUTE,
      });

      return {
        companies,
        error: '',
        isSuccess: response.data.success ?? true,
        totalCompanies: response.data.totalCompanies ?? companies.length,
      };
    } catch (routeError) {
      lastError = getErrorMessage(routeError);
      const axiosError = routeError as AxiosError<{ message?: string; error?: string }>;

      console.log('Client profile route failed', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
        tokenLoaded: Boolean(token),
        url: CLIENT_PROFILE_ROUTE,
      });
    }

    return {
      companies: [],
      error: lastError || 'Unable to load companies. Please try again.',
      isSuccess: false,
      totalCompanies: 0,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    console.log('Client profile API error', {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
      tokenLoaded: Boolean(token),
      url: CLIENT_PROFILE_ROUTE,
    });

    return {
      companies: [],
      error: getErrorMessage(error),
      isSuccess: false,
      totalCompanies: 0,
    };
  }
}

type FetchClientCompanyDetailsParams = {
  companyId?: string | null;
  token?: string | null;
};

export async function fetchClientCompanyDetails({
  companyId,
  token,
}: FetchClientCompanyDetailsParams) {
  if (!token) {
    console.log('Client company details API skipped: auth token missing');

    return {
      company: null,
      error: 'Auth token missing. Please login again.',
      isSuccess: false,
    };
  }

  if (!companyId) {
    console.log('Client company details API skipped: company id missing');

    return {
      company: null,
      error: 'Company id missing.',
      isSuccess: false,
    };
  }

  const companyDetailsRoute = `${API_BASE_URL}${COMPANY_DETAILS_PATH}/${companyId}`;

  try {
    const response = await axios.get<ClientCompanyDetailsResponse>(
      companyDetailsRoute,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
        },
        timeout: API_REQUEST_TIMEOUT_MS,
      },
    );
    const company = getResponseCompany(response.data);

    console.log('Client company details loaded', {
      companyId,
      einLoaded: Boolean(
        company?.EIN ??
        company?.Ein ??
        company?.ein ??
        company?.einNumber ??
        company?.federalTaxId,
      ),
      success: response.data.success,
      url: companyDetailsRoute,
    });

    return {
      company,
      error: company ? '' : 'Company details not found.',
      isSuccess: response.data.success ?? Boolean(company),
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    console.log('Client company details API error', {
      companyId,
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
      tokenLoaded: Boolean(token),
      url: companyDetailsRoute,
    });

    return {
      company: null,
      error: getErrorMessage(error),
      isSuccess: false,
    };
  }
}

type FetchCompanyComplianceHistoryParams = {
  companyId?: string | null;
  token?: string | null;
};

export async function fetchCompanyComplianceHistory({
  companyId,
  token,
}: FetchCompanyComplianceHistoryParams) {
  if (!token) {
    console.log('Company compliance history API skipped: auth token missing');

    return {
      error: 'Auth token missing. Please login again.',
      history: [],
      isSuccess: false,
    };
  }

  if (!companyId) {
    console.log('Company compliance history API skipped: company id missing');

    return {
      error: 'Company id missing.',
      history: [],
      isSuccess: false,
    };
  }

  const complianceHistoryRoute =
    `${API_BASE_URL}${COMPANY_COMPLIANCE_HISTORY_PATH}/${companyId}/compliance-history`;

  try {
    const response = await axios.get<CompanyComplianceHistoryResponse>(
      complianceHistoryRoute,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
        },
        timeout: API_REQUEST_TIMEOUT_MS,
      },
    );
    const history = getResponseComplianceHistory(response.data);

    return {
      error: '',
      history,
      isSuccess: response.data.success ?? true,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    return {
      error: getErrorMessage(error),
      history: [],
      isSuccess: false,
    };
  }
}
