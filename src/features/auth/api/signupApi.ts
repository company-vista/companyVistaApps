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
};

const SIGNUP_STEP1_ROUTE = `${API_BASE_URL}/api/signup/step1`;

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
    };
  }

  try {
    const response = await fetch(SIGNUP_STEP1_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        phoneNumber: trimmedPhone,
        countryCode,
        address,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const apiErrors: SignupErrors = {};

      if (data.message) {
        if (data.message.toLowerCase().includes('email')) {
          apiErrors.email = data.message;
        } else {
          apiErrors.email = data.message;
        }
      }

      Toast.show({
        type: 'error',
        text1: 'Signup failed',
        text2: data.message || 'Something went wrong.',
      });

      return {
        errors: apiErrors,
        isSuccess: false,
        email: trimmedEmail,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      };
    }

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
    };
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Network error',
      text2: 'Unable to reach server.',
    });

    return {
      errors: { email: 'Network error' },
      isSuccess: false,
      email: trimmedEmail,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
    };
  }
}
