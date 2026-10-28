import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAppSelector } from '../../../store/hooks';
import { prefetchCompanies } from '../company/api/companyApi';
import AdminHeader from './AdminHeader';
import AdminBottomTab from './AdminBottomTab';

let hasPrefetchedCompanies = false;

const AdminLayout = ({ children }) => {
  const token = useAppSelector(state => state.auth.token);

  useEffect(() => {
    if (!token || hasPrefetchedCompanies) return;
    hasPrefetchedCompanies = true;
    prefetchCompanies({ token, category: 'formed' });
  }, [token]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AdminHeader />
      <View style={{ flex: 1 }}>{children}</View>
      <AdminBottomTab />
    </View>
  );
};

export default AdminLayout;
