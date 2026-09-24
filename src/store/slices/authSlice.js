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
    pendingOrderData: null,
    pendingOpenOrderDetails: false,
    pendingOpenRegistrationProgress: false,
    pendingOpenRegistrationTracking: false,
    hasCompletedPayment: false,
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
        companyId: result.companyId,
        pricingType: result.pricingType,
        totalAmount: result.totalAmount,
        rawResponse: result.rawResponse,
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
            saveAuthSession({ user: action.payload.user, token: action.payload.token, hasCompletedPayment: state.hasCompletedPayment });
        },
        setOnboardingComplete(state, action) {
            if (state.user) state.user.hasCompletedOnboarding = true;
            const session = { user: { ...state.user, hasCompletedOnboarding: true }, token: state.token };
            saveAuthSession(session);
        },
        setPendingAddCompany(state, action) {
            state.pendingAddCompany = action.payload;
        },
        setPendingOrderData(state, action) {
            state.pendingOrderData = action.payload;
        },
        setRedirectToLogin(state, action) {
            state.redirectToLogin = action.payload;
        },
        setPendingOpenOrderDetails(state, action) {
            state.pendingOpenOrderDetails = action.payload;
        },
        setPendingOpenRegistrationProgress(state, action) {
            state.pendingOpenRegistrationProgress = action.payload;
        },
        setPendingOpenRegistrationTracking(state, action) {
            state.pendingOpenRegistrationTracking = action.payload;
        },
        setHasCompletedPayment(state, action) {
            state.hasCompletedPayment = action.payload;
            // persist with current session
            const session = { user: state.user, token: state.token, hasCompletedPayment: action.payload };
            saveAuthSession(session);
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
            state.hasCompletedPayment = Boolean(action.payload?.hasCompletedPayment);
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
            // hasCompletedPayment ko preserve rakho (login ke baad bhi), save session with flag
            saveAuthSession({ user: action.payload.user, token: action.payload.token, hasCompletedPayment: state.hasCompletedPayment });
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
            .addCase(signupUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.signupErrors = {};
            // token ko auth.token me save rakho taaki Status pe auto-login ke liye mile (isAuthenticated abhi false)
            const tok = action.payload?.token;
            const cid = action.payload?.clientId;
            const compId = action.payload?.companyId;
            const pType = action.payload?.pricingType;
            const tAmount = action.payload?.totalAmount;
            if (tok) {
                state.token = tok;
                // pendingOrderData me bhi token rakh do fallback ke liye (companyId/pricingType/totalAmount bhi)
                state.pendingOrderData = { ...(state.pendingOrderData || {}), token: tok, clientId: cid, companyId: compId, pricingType: pType, totalAmount: tAmount, email: action.payload?.email || state.pendingOrderData?.email };
            } else if (compId) {
                state.pendingOrderData = { ...(state.pendingOrderData || {}), companyId: compId, clientId: cid, pricingType: pType, totalAmount: tAmount };
            }
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
                state.pendingOrderData = null;
                state.pendingOpenOrderDetails = false;
                state.pendingOpenRegistrationProgress = false;
                state.pendingOpenRegistrationTracking = false;
                state.hasCompletedPayment = false;
                state.redirectToLogin = true;
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
export const { clearAuthErrors, clearLoginError, clearSignupError, updateProfileUser, setAuthSession, setOnboardingComplete, setPendingAddCompany, setPendingOrderData, setRedirectToLogin, setPendingOpenOrderDetails, setPendingOpenRegistrationProgress, setPendingOpenRegistrationTracking, setHasCompletedPayment } = authSlice.actions;
export default authSlice.reducer;
