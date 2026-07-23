import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  handleLoginApi,
  handleGoogleLoginApi,
  type LoginErrors,
  type LoginUser,
} from '../../features/auth/api/loginApi';
import {
  handleSignupApi,
  handleResendVerificationApi,
  type SignupErrors,
} from '../../features/auth/api/signupApi';

type AuthUser = LoginUser;

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  loginErrors: LoginErrors;
  signupErrors: SignupErrors;
};

type LoginPayload = {
  email: string;
  password: string;
};

type GoogleLoginPayload = {
  idToken: string;
};

type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  address: string;
};

type LoginSuccess = {
  user: AuthUser;
  token: string;
};

type LoginFailure = {
  errors: LoginErrors;
  email: string;
};

type GoogleLoginFailure = {
  errors: { general?: string };
  email: string;
};

type SignupFailure = {
  errors: SignupErrors;
  email: string;
  firstName: string;
  lastName: string;
};

const AUTH_STORAGE_KEY = 'vista.auth';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoring: true,
  loginErrors: {},
  signupErrors: {},
};

async function saveAuthSession(session: LoginSuccess) {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.warn('Unable to persist auth session', error);
  }
}

async function clearAuthSession() {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear auth session', error);
  }
}

export const restoreAuth = createAsyncThunk<LoginSuccess | null>(
  'auth/restoreAuth',
  async () => {
    const sessionJson = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

    if (!sessionJson) {
      return null;
    }

    return JSON.parse(sessionJson) as LoginSuccess;
  },
);

export const loginUser = createAsyncThunk<
  LoginSuccess,
  LoginPayload,
  { rejectValue: LoginFailure }
>('auth/loginUser', async (payload, { rejectWithValue }) => {
  const result = await handleLoginApi(payload);

  if (!result.isSuccess) {
    return rejectWithValue({
      errors: result.errors,
      email: result.email,
    });
  }

  const session: LoginSuccess = {
    user: result.user ?? {
      email: result.email,
    },
    token: result.token ?? '',
  };

  saveAuthSession(session).catch(error => {
    console.warn('Unable to persist auth session after login', error);
  });

  return session;
});

export const googleLoginUser = createAsyncThunk<
  LoginSuccess,
  GoogleLoginPayload,
  { rejectValue: GoogleLoginFailure }
>('auth/googleLoginUser', async (payload, { rejectWithValue }) => {
  const result = await handleGoogleLoginApi(payload);

  if (!result.isSuccess) {
    return rejectWithValue({
      errors: result.errors,
      email: result.email,
    });
  }

  const session: LoginSuccess = {
    user: result.user ?? {
      email: result.email,
    },
    token: result.token ?? '',
  };

  saveAuthSession(session).catch(error => {
    console.warn('Unable to persist auth session after Google login', error);
  });

  return session;
});

export const signupUser = createAsyncThunk<
  { email: string; firstName: string; lastName: string; token: string; clientId: string },
  SignupPayload,
  { rejectValue: SignupFailure }
>('auth/signupUser', async (payload, { rejectWithValue }) => {
  const result = await handleSignupApi(payload);

  if (!result.isSuccess) {
    return rejectWithValue({
      errors: result.errors,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
    });
  }

  return {
    email: result.email,
    firstName: result.firstName,
    lastName: result.lastName,
    token: result.token,
    clientId: result.clientId,
  };
});

export const resendVerification = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: { message: string } }
>('auth/resendVerification', async (payload, { rejectWithValue }) => {
  const result = await handleResendVerificationApi(payload.email);

  if (!result.isSuccess) {
    return rejectWithValue({ message: result.message });
  }

  return { message: result.message };
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await clearAuthSession();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearLoginError(state, action: PayloadAction<keyof LoginErrors>) {
      state.loginErrors[action.payload] = undefined;
    },
    clearSignupError(state, action: PayloadAction<keyof SignupErrors>) {
      state.signupErrors[action.payload] = undefined;
    },
    clearAuthErrors(state) {
      state.loginErrors = {};
      state.signupErrors = {};
    },
    updateProfileUser(state, action: PayloadAction<AuthUser>) {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(restoreAuth.pending, state => {
        state.isRestoring = true;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.isRestoring = false;
        state.user = action.payload?.user ?? null;
        state.token = action.payload?.token ?? null;
        state.isAuthenticated = Boolean(action.payload?.token);
      })
      .addCase(restoreAuth.rejected, state => {
        state.isRestoring = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.loginErrors = {};
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loginErrors = {};
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.loginErrors = action.payload?.errors ?? {};
      })
      .addCase(googleLoginUser.pending, state => {
        state.isLoading = true;
        state.loginErrors = {};
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loginErrors = {};
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.loginErrors = action.payload?.errors ?? {};
      })
      .addCase(signupUser.pending, state => {
        state.isLoading = true;
        state.signupErrors = {};
      })
      .addCase(signupUser.fulfilled, state => {
        state.isLoading = false;
        state.signupErrors = {};
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.signupErrors = action.payload?.errors ?? {};
      })
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loginErrors = {};
        state.signupErrors = {};
      });
  },
});

export const {
  clearAuthErrors,
  clearLoginError,
  clearSignupError,
  updateProfileUser,
} =
  authSlice.actions;

export default authSlice.reducer;
