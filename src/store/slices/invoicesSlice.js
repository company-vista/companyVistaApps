import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { fetchClientInvoices, } from '../../features/home/api/clientInvoicesApi';
const initialState = {
    byCompanyId: {},
    loadedCompanyIds: {},
    isAllLoaded: false,
    all: [],
    errorMessage: '',
    isLoading: false,
};
export const fetchInvoicesForCompany = createAsyncThunk('invoices/fetchInvoicesForCompany', async ({ companyId, token }, { rejectWithValue }) => {
    try {
        const result = await fetchClientInvoices({ companyId, token });
        if (!result.isSuccess) {
            return rejectWithValue(result.error);
        }
        return { companyId, invoices: result.invoices };
    }
    catch {
        return rejectWithValue('Failed to load invoices');
    }
});
const invoicesSlice = createSlice({
    name: 'invoices',
    initialState,
    reducers: {
        clearInvoices(state) {
            state.byCompanyId = {};
            state.loadedCompanyIds = {};
            state.isAllLoaded = false;
            state.all = [];
            state.errorMessage = '';
            state.isLoading = false;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchInvoicesForCompany.pending, state => {
            state.isLoading = true;
            state.errorMessage = '';
        })
            .addCase(fetchInvoicesForCompany.fulfilled, (state, action) => {
            state.isLoading = false;
            const { companyId, invoices } = action.payload;
            if (companyId) {
                state.byCompanyId[companyId] = invoices;
                state.loadedCompanyIds[companyId] = true;
            }
            else {
                state.all = invoices;
                state.isAllLoaded = true;
            }
        })
            .addCase(fetchInvoicesForCompany.rejected, (state, action) => {
            state.isLoading = false;
            state.errorMessage = action.payload ?? 'Failed to load invoices';
        });
    },
});
export const { clearInvoices } = invoicesSlice.actions;
export default invoicesSlice.reducer;
const selectInvoicesState = (state) => state.invoices;
const selectCompanyId = (_, companyId) => companyId;
export const selectInvoicesForCompany = createSelector([selectInvoicesState, selectCompanyId], (invoicesState, companyId) => {
    if (companyId) {
        return invoicesState.byCompanyId[companyId] ?? [];
    }
    return invoicesState.all;
});
export const selectHasLoadedInvoicesForCompany = createSelector([selectInvoicesState, selectCompanyId], (invoicesState, companyId) => {
    if (companyId) {
        return invoicesState.loadedCompanyIds[companyId] === true;
    }
    return invoicesState.isAllLoaded;
});
