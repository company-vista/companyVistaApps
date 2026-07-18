import axios, { type AxiosError } from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../../../config/api';

const COMPANY_REGISTRATION_ROUTE = `${API_BASE_URL}/api/company/public-register`;

type RegistrationResult = {
  error: string;
  isSuccess: boolean;
  data?: any;
};

export async function submitCompanyRegistration(
  payload: Record<string, any>,
  token?: string | null,
): Promise<RegistrationResult> {
  if (!token) {
    return { error: 'Auth token missing. Please login again.', isSuccess: false };
  }

  try {
    const formData = new FormData();

    const FILE_FIELD_MAP: Record<string, string> = {
      holdingFiles: 'companyRegistrationDocuments',
      otherFiles: 'otherDocuments',
    };

    const MIME_MAP: Record<string, string> = {
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
      if (value === null || value === undefined) return;

      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0]?.name && value[0]?.uri) {
        const fieldName = FILE_FIELD_MAP[key] || key;
        value.forEach((file: { name: string; uri: string }) => {
          const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
          formData.append(fieldName, {
            uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
            name: file.name,
            type: MIME_MAP[fileExt] || 'application/octet-stream',
          } as any);
        });
      } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await axios.post<RegistrationResult>(
      COMPANY_REGISTRATION_ROUTE,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return {
      error: '',
      isSuccess: response.data?.isSuccess ?? true,
      data: response.data,
    };

  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    return {
      error:
        axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        axiosError.message ??
        'Registration failed. Please try again.',
      isSuccess: false,
    };
  }
}
