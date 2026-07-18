import axios, { type AxiosError } from 'axios';

import { API_BASE_URL } from '../../../config/api';
import Toast from 'react-native-toast-message';

const COMPANY_DOCUMENTS_PATH = '/api/documents/company';
const API_REQUEST_TIMEOUT_MS = 8000;

export type DocumentItem = {
  _id?: string;
  companyId?: string;
  companyName?: string;
  company?: {
    _id?: string;
    companyName?: string;
  };
  documentType?: string;
  country?: string;
  fileName?: string;
  originalFileName?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedBy?: string;
  uploadedAt?: string;
  createdAt?: string;
  status?: string;
  sourceGroup?: string;
  viewUrl?: string;
  downloadUrl?: string;
  deleteUrl?: string;
  canDelete?: boolean;
};

export type DocumentViewData = {
  contentType: string;
  viewUri: string;
};

type CompanyDocumentsResponse = {
  success?: boolean;
  documents?: DocumentItem[];
  data?: DocumentItem[] | {
    documents?: DocumentItem[];
  };
};

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
    'Unable to load documents. Please try again.'
  );
}

function getResponseDocuments(data: CompanyDocumentsResponse): DocumentItem[] {
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

function getDocumentContentType(mimeType?: string | null, viewUrl?: string | null) {
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

type FetchCompanyDocumentsParams = {
  companyId?: string | null;
  token?: string | null;
};

export async function fetchCompanyDocuments({
  companyId,
  token,
}: FetchCompanyDocumentsParams) {
  if (!token) {
    Toast.show({type: "Company documents API skipped: auth token missing"})
    

    return {
      documents: [],
      error: 'Auth token missing. Please login again.',
      isSuccess: false,
    };
  }

  if (!companyId) {
    Toast.show({type: 'Company documents API skipped: company id missing'});

    return {
      documents: [],
      error: 'Company id missing.',
      isSuccess: false,
    };
  }

  const documentsRoute = `${API_BASE_URL}${COMPANY_DOCUMENTS_PATH}/${companyId}`;

  try {
    const response = await axios.get<CompanyDocumentsResponse>(documentsRoute, {
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
  } catch (error) {
    Toast.show({ type: 'error', text1: 'Company documents API error', text2: getErrorMessage(error) });

  
    return {
      documents: [],
      error: getErrorMessage(error),
      isSuccess: false,
    };
  }
}

type FetchDocumentViewParams = {
  mimeType?: string | null;
  token?: string | null;
  viewUrl?: string | null;
};

export async function fetchDocumentView({
  mimeType,
  token,
  viewUrl,
}: FetchDocumentViewParams) {
  if (!token) {
    Toast.show({type: 'Document view API skipped: auth token missing'});

    return {
      data: null as DocumentViewData | null,
      error: 'Auth token missing. Please login again.',
      isSuccess: false,
    };
  }

  if (!viewUrl) {
    Toast.show({type: 'Document view API skipped: view url missing'});

    return {
      data: null as DocumentViewData | null,
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
