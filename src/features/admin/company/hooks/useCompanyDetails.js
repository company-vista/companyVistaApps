import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../../../store/hooks';
import {
  fetchCompanyById,
  fetchCompanyCompliance,
  fetchCompanyDocuments,
} from '../api/companyApi';

export function useCompanyDetails(route) {
  const token = useAppSelector(state => state.auth.token);
  const initialCompany = route?.params?.company || null;
  const initialCompliance = route?.params?.compliance || null;
  const companyId =
    route?.params?.companyId ||
    initialCompany?._id ||
    initialCompany?.id ||
    null;

  const [company, setCompany] = useState(initialCompany);
  const [compliance, setCompliance] = useState(initialCompliance);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(!initialCompany);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (!companyId) {
        setError('Company id missing.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!isRefresh && !initialCompany) {
        setLoading(true);
      }

      const [companyResult, complianceResult, documentsResult] =
        await Promise.allSettled([
          fetchCompanyById({ companyId }),
          fetchCompanyCompliance({ companyId }),
          fetchCompanyDocuments({ token, companyId }),
        ]);

      if (companyResult.status === 'fulfilled' && companyResult.value) {
        setCompany(companyResult.value);
        setError('');
      } else if (!initialCompany) {
        setError(
          companyResult.reason?.message ||
            'Failed to load company details. Please try again.',
        );
      }

      if (complianceResult.status === 'fulfilled') {
        setCompliance(complianceResult.value || null);
      }

      if (documentsResult.status === 'fulfilled') {
        setDocuments(documentsResult.value);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [companyId, initialCompany, token],
  );

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load({ isRefresh: true });
  }, [load]);

  return {
    company,
    compliance,
    documents,
    loading,
    refreshing,
    error,
    load,
    onRefresh,
  };
}
