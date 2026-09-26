import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { handleLoginApi, handleGoogleLoginApi, } from '../../features/auth/api/loginApi';
import { handleSignupApi, handleResendVerificationApi, } from '../../features/auth/api/signupApi';
import { deactivateAccount as deactivateAccountApi } from '../../features/auth/api/deactivateApi';
import { deleteAccount as deleteAccountApi } from '../../features/auth/api/deleteAccountApi';
const AUTH_STORAGE_KEY = 'vista.auth';
// Adhoora signup (payment pending) yahan save hota hai taaki app band/ne band hone par
// user ko wapas usi company ka payment karne ka raasta mile
const PENDING_SIGNUP_STORAGE_KEY = 'vista.pendingSignup';
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
    pendingSignup: null,
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
// Sirf safe scalar fields pick karo - poora orderData kabhi JSON me mat daalo (bhaari/circular ho sakta hai)
function buildPendingSignup(source) {
    if (!source || typeof source !== 'object') return null;
    const companyId = source.companyId || source.company_id || null;
    const token = source.token || source.signupToken || null;
    if (!companyId && !token) return null;
    const email = source.email || source.userEmail || null;
    const fullName = source.fullName || source.name
        || [source.firstName, source.lastName].filter(Boolean).join(' ').trim() || null;
    return {
        companyId: companyId ? String(companyId) : null,
        token: token || null,
        clientId: source.clientId || source.signupClientId || null,
        email,
        fullName,
        pricingType: source.pricingType || null,
        totalAmount: Number(source.totalAmount ?? source.amount ?? 0) || 0,
        selectedState: source.selectedState || source.state || null,
        selectedCountry: source.selectedCountry || source.countryOfIncorporation || null,
        selectedStructure: source.selectedStructure || source.companyType || null,
        updatedAt: new Date().toISOString(),
    };
}
async function savePendingSignup(data) {
    const payload = buildPendingSignup(data);
    if (!payload) return;
    try {
        await AsyncStorage.setItem(PENDING_SIGNUP_STORAGE_KEY, JSON.stringify(payload));
    }
    catch (error) {
        console.warn('Unable to persist pending signup', error);
    }
}
async function clearPendingSignup() {
    try {
        await AsyncStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY);
    }
    catch (error) {
        console.warn('Unable to clear pending signup', error);
    }
}
export const restoreAuth = createAsyncThunk('auth/restoreAuth', async () => {
    // Corrupt JSON ya storage error par app crash nahi hona chahiye - dono keys alag try me
    let session = null;
    let pendingSignup = null;
    try {
        const sessionJson = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (sessionJson) session = JSON.parse(sessionJson);
    }
    catch (error) {
        console.warn('Unable to restore auth session', error);
    }
    try {
        const pendingJson = await AsyncStorage.getItem(PENDING_SIGNUP_STORAGE_KEY);
        if (pendingJson) pendingSignup = buildPendingSignup(JSON.parse(pendingJson));
    }
    catch (error) {
        console.warn('Unable to restore pending signup', error);
    }
    return { session, pendingSignup };
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
            // hasCompletedPayment bhi saath me persist karo, warna logout ke baad payment state kho jayegi
            const session = { user: { ...state.user, hasCompletedOnboarding: true }, token: state.token, hasCompletedPayment: state.hasCompletedPayment };
            saveAuthSession(session);
        },
        setPendingAddCompany(state, action) {
            state.pendingAddCompany = action.payload;
        },
        setPendingOrderData(state, action) {
            state.pendingOrderData = action.payload;
            // Payment tak ka data bhi save karo - app band ho to resume kar sake
            const pending = buildPendingSignup(action.payload);
            if (pending) {
                state.pendingSignup = pending;
                savePendingSignup(pending);
            }
        },
        clearPendingSignupState(state) {
            state.pendingSignup = null;
            clearPendingSignup();
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
            // payment ho gaya -> adhoora signup record hatana, warna dobara pay CTA dikhega
            if (action.payload) {
                state.pendingSignup = null;
                clearPendingSignup();
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(restoreAuth.pending, state => {
            state.isRestoring = true;
        })
            .addCase(restoreAuth.fulfilled, (state, action) => {
            state.isRestoring = false;
            const session = action.payload?.session ?? null;
            const storedPending = action.payload?.pendingSignup ?? null;
            state.user = session?.user ?? null;
            state.token = session?.token ?? null;
            state.isAuthenticated = Boolean(session?.token);
            state.hasCompletedPayment = Boolean(session?.hasCompletedPayment);
            // payment pehle ho chuka hai to stale pending record ignore karo
            state.pendingSignup = state.hasCompletedPayment ? null : storedPending;
            // login nahi hai par signup adhoora hai (payment pe chhod ke app band) ->
            // cold start par Onboarding nahi, Login se resume karwao
            if (!state.isAuthenticated && state.pendingSignup) {
                state.redirectToLogin = true;
            }
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
            }
            else if (compId) {
                state.pendingOrderData = { ...(state.pendingOrderData || {}), companyId: compId, clientId: cid, pricingType: pType, totalAmount: tAmount };
            }
            // Signup ke baad app band ho to company/payment yaad rahe - isAuthenticated abhi bhi false
            // (warna RootStack turant Main pe chala jayega aur pura registration flow toot jayega)
            const pending = buildPendingSignup({
                companyId: compId,
                token: tok,
                clientId: cid,
                email: action.payload?.email,
                firstName: action.payload?.firstName,
                lastName: action.payload?.lastName,
                pricingType: pType,
                totalAmount: tAmount,
            });
            if (pending) {
                state.pendingSignup = pending;
                savePendingSignup(pending);
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
            state.pendingSignup = null;
            state.redirectToLogin = true;
            clearPendingSignup();
        })
            .addCase(deactivateAccountThunk.fulfilled, state => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loginErrors = {};
            state.signupErrors = {};
            state.pendingAddCompany = false;
            state.pendingSignup = null;
            clearPendingSignup();
        })
            .addCase(deleteAccountThunk.fulfilled, state => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loginErrors = {};
            state.signupErrors = {};
            state.pendingAddCompany = false;
            state.pendingSignup = null;
            clearPendingSignup();
        });
    },
});
export const { clearAuthErrors, clearLoginError, clearSignupError, updateProfileUser, setAuthSession, setOnboardingComplete, setPendingAddCompany, setPendingOrderData, clearPendingSignupState, setRedirectToLogin, setPendingOpenOrderDetails, setPendingOpenRegistrationProgress, setPendingOpenRegistrationTracking, setHasCompletedPayment } = authSlice.actions;
export default authSlice.reducer;
