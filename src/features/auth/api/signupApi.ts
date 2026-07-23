import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../../config/api';

export type SignupErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
};

type SignupApiParams = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  address: string;
};

type SignupApiResult = {
  errors: SignupErrors;
  isSuccess: boolean;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  clientId: string;
};

const SIGNUP_STEP1_ROUTE = `${API_BASE_URL}/api/signup/step1`;
const RESEND_VERIFICATION_ROUTE = `${API_BASE_URL}/api/signup/resend-verification`;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function handleSignupApi({
  firstName,
  lastName,
  email,
  phoneNumber,
  countryCode,
  address,
}: SignupApiParams): Promise<SignupApiResult> {
  const errors: SignupErrors = {};
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = phoneNumber.trim();

  if (!trimmedFirstName) {
    errors.firstName = 'First name is required';
  } else if (trimmedFirstName.length < 2) {
    errors.firstName = 'First name is too short';
  }

  if (!trimmedLastName) {
    errors.lastName = 'Last name is required';
  } else if (trimmedLastName.length < 2) {
    errors.lastName = 'Last name is too short';
  }

  if (!trimmedEmail) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(trimmedEmail)) {
    errors.email = 'Enter a valid email';
  }

  if (!trimmedPhone) {
    errors.phoneNumber = 'Phone number is required';
  }

  if (Object.keys(errors).length > 0) {
    Toast.show({
      type: 'error',
      text1: 'Signup failed',
      text2: 'Please check your details.',
    });

    return {
      errors,
      isSuccess: false,
      email: trimmedEmail,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      token: '',
      clientId: '',
    };
  }

  try {
    const response = await axios.post(SIGNUP_STEP1_ROUTE, {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      phoneNumber: trimmedPhone,
      countryCode,
      address,
    });

    const token = response.data?.token || '';
    const clientId = response.data?.clientId || response.data?.client_id || '';
   
    Toast.show({
      type: 'success',
      text1: 'Account created',
      text2: 'Please login.',
    });

    return {
      errors: {},
      isSuccess: true,
      email: trimmedEmail,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      token,
      clientId,
    };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Something went wrong.';

    Toast.show({
      type: 'error',
      text1: 'Signup failed',
      text2: message,
    });

    return {
      errors: { email: message },
      isSuccess: false,
      email: trimmedEmail,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      token: '',
      clientId: '',
    };
  }
}

export type ResendVerificationResult = {
  isSuccess: boolean;
  message: string;
};

export async function handleResendVerificationApi(
  email: string,
): Promise<ResendVerificationResult> {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { isSuccess: false, message: 'Email is required.' };
  }

  try {
    const response = await axios.post(RESEND_VERIFICATION_ROUTE, {
      email: trimmedEmail,
    });

    return {
      isSuccess: true,
      message: response.data?.message || 'Verification email sent successfully.',
    };
  } catch (error: any) {
    return {
      isSuccess: false,
      message: error.response?.data?.message || 'Network error. Unable to reach server.',
    };
  }
}
