import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { handleLoginApi, handleGoogleLoginApi, } from '../../features/auth/api/loginApi';
import { handleSignupApi, handleResendVerificationApi, } from '../../features/auth/api/signupApi';
import { deactivateAccount as deactivateAccountApi } from '../../features/auth/api/deactivateApi';
import { deleteAccount as deleteAccountApi } from '../../features/auth/api/deleteAccountApi';
const AUTH_STORAGE_KEY = 'vista.auth';
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isRestoring: true,
    loginErrors: {},
    signupErrors: {},
    pendingAddCompany: false,
    redirectToLogin: false,
};
async function saveAuthSession(session) {
    try {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
    catch (error) {
        console.warn('Unable to persist auth session', error);
    }
}
async function clearAuthSession() {
    try {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
    catch (error) {
        console.warn('Unable to clear auth session', error);
    }
}
export const restoreAuth = createAsyncThunk('auth/restoreAuth', async () => {
    const sessionJson = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!sessionJson) {
        return null;
    }
    return JSON.parse(sessionJson);
});
export const loginUser = createAsyncThunk('auth/loginUser', async (payload, { rejectWithValue }) => {
    const result = await handleLoginApi(payload);
    if (!result.isSuccess) {
        return rejectWithValue({
            errors: result.errors,
            email: result.email,
            isRegistrationIncomplete: result.isRegistrationIncomplete || false,
            message: result.message,
            user: result.user,
        });
    }
    const session = {
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
export const googleLoginUser = createAsyncThunk('auth/googleLoginUser', async (payload, { rejectWithValue }) => {
    const result = await handleGoogleLoginApi(payload);
    if (!result.isSuccess) {
        return rejectWithValue({
            errors: result.errors,
            email: result.email,
            isRegistrationIncomplete: result.isRegistrationIncomplete || false,
            message: result.message,
            user: result.user,
        });
    }
    const session = {
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
export const signupUser = createAsyncThunk('auth/signupUser', async (payload, { rejectWithValue }) => {
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
export const resendVerification = createAsyncThunk('auth/resendVerification', async (payload, { rejectWithValue }) => {
    const result = await handleResendVerificationApi(payload.email);
    if (!result.isSuccess) {
        return rejectWithValue({ message: result.message });
    }
    return { message: result.message };
});
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
    await clearAuthSession();
});
export const deactivateAccountThunk = createAsyncThunk('auth/deactivateAccount', async (password, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const result = await deactivateAccountApi(auth.token, password);
    if (!result.isSuccess) {
        return rejectWithValue({ message: result.message });
    }
    await clearAuthSession();
    return { message: result.message };
});
export const deleteAccountThunk = createAsyncThunk('auth/deleteAccount', async (password, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const result = await deleteAccountApi(auth.token, password);
    if (!result.isSuccess) {
        return rejectWithValue({ message: result.message });
    }
    await clearAuthSession();
    return { message: result.message };
});
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearLoginError(state, action) {
            state.loginErrors[action.payload] = undefined;
        },
        clearSignupError(state, action) {
            state.signupErrors[action.payload] = undefined;
        },
        clearAuthErrors(state) {
            state.loginErrors = {};
            state.signupErrors = {};
        },
        updateProfileUser(state, action) {
            state.user = {
                ...state.user,
                ...action.payload,
            };
        },
        setAuthSession(state, action) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isRestoring = false;
            saveAuthSession({ user: action.payload.user, token: action.payload.token });
        },
        setOnboardingComplete(state, action) {
            if (state.user) state.user.hasCompletedOnboarding = true;
            const session = { user: { ...state.user, hasCompletedOnboarding: true }, token: state.token };
            saveAuthSession(session);
        },
        setPendingAddCompany(state, action) {
            state.pendingAddCompany = action.payload;
        },
        setRedirectToLogin(state, action) {
            state.redirectToLogin = action.payload;
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
                state.pendingAddCompany = false;
                // keep redirectToLogin flag intact so AuthStack can read it
            })
            .addCase(deactivateAccountThunk.fulfilled, state => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.loginErrors = {};
                state.signupErrors = {};
                state.pendingAddCompany = false;
            })
            .addCase(deleteAccountThunk.fulfilled, state => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.loginErrors = {};
                state.signupErrors = {};
                state.pendingAddCompany = false;
            });
    },
});
export const { clearAuthErrors, clearLoginError, clearSignupError, updateProfileUser, setAuthSession, setOnboardingComplete, setPendingAddCompany, setRedirectToLogin } = authSlice.actions;
export default authSlice.reducer;
