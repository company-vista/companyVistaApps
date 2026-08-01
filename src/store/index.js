import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import invoicesReducer from './slices/invoicesSlice';
import themeReducer from './slices/themeSlice';
import companyRegistrationReducer from './slices/companyRegistrationSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        invoices: invoicesReducer,
        theme: themeReducer,
        companyRegistration: companyRegistrationReducer,
    },
});
