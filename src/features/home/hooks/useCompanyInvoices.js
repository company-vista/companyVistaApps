import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchInvoicesForCompany, selectHasLoadedInvoicesForCompany, selectInvoicesForCompany, } from '../../../store/slices/invoicesSlice';

export function useCompanyInvoices(companyId) {
    const dispatch = useAppDispatch();
    const token = useAppSelector(state => state.auth.token);
    const invoices = useAppSelector(state => selectInvoicesForCompany(state, companyId));
    const hasLoaded = useAppSelector(state => selectHasLoadedInvoicesForCompany(state, companyId));
    const isLoading = useAppSelector(state => state.invoices.isLoading);

    useEffect(() => {
        if (!companyId || !token || hasLoaded) {
            return;
        }
        dispatch(fetchInvoicesForCompany({ companyId, token }));
    }, [companyId, token, hasLoaded, dispatch]);

    return {
        invoices,
        isLoading: isLoading && !hasLoaded,
    };
}
