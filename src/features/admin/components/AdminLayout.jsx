import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';
import { prefetchCompanies } from '../company/api/companyApi';
import AdminHeader from './AdminHeader';
import AdminBottomTab from './AdminBottomTab';

let hasPrefetchedCompanies = false;

const AdminLayout = ({ children }) => {
  const token = useAppSelector(state => state.auth.token);
  const colors = useThemeColors();

  useEffect(() => {
    if (!token || hasPrefetchedCompanies) return;
    hasPrefetchedCompanies = true;
    prefetchCompanies({ token, category: 'formed' });
  }, [token]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AdminHeader />
      <View style={{ flex: 1 }}>{children}</View>
      <AdminBottomTab />
    </View>
  );
};

export default AdminLayout;
