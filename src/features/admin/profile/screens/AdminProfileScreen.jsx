import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { logoutUser, updateProfileUser } from '../../../../store/slices/authSlice';
import { useThemeColors } from '../../../../theme/colors';
import { s } from '../../../../theme/responsive';
import { fetchClientProfile } from '../../../profile/api/clientProfileDetailsApi';

const AdminProfileScreen = () => {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const user = useAppSelector(state => state.auth.user);
  const token = useAppSelector(state => state.auth.token);
  console.log(user)
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      const result = await fetchClientProfile(token);
      if (isMounted && result.user) {
        dispatch(updateProfileUser(result.user));
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [dispatch, token]);

  const profileImage = user?.profileImage ?? user?.profilePicture ?? user?.avatar ?? user?.image ?? user?.photo;

  const profileItems = [
    { label: 'Full Name', value: user?.name || user?.fullName || user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName || 'N/A', icon: 'user-o' },
    { label: 'Email', value: user?.email || 'N/A', icon: 'envelope-o' },
    { label: 'Phone', value: user?.phone || user?.phoneNumber || user?.mobile || user?.contactNumber || 'N/A', icon: 'phone' },
    { label: 'Role', value: user?.role || 'N/A', icon: 'id-badge' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: s(16),
          paddingBottom: s(24),
          paddingTop: s(12),
        }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, alignItems: 'center', padding: 20, borderWidth: 1, borderColor: '#F1F5F9' }}>
          <View style={{ width: 128, height: 128, borderRadius: 64, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' }}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={{ width: 128, height: 128 }} />
            ) : (
              <FontAwesome name="user" size={52} color="#1E3A8A" />
            )}
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 12 }}>{user?.name || 'Admin'}</Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{user?.email || ''}</Text>
          <View style={{ backgroundColor: '#E0E7FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: '#3730A3', fontWeight: '600' }}>{user?.role || 'owner'}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>Contact Information</Text>
          {profileItems.map((item, idx) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: '#F1F5F9' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <FontAwesome name={item.icon} size={16} color="#1E3A8A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#94A3B8' }}>{item.label}</Text>
                <Text style={{ fontSize: 13, color: '#0F172A', marginTop: 2 }}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable onPress={() => dispatch(logoutUser())} style={{ backgroundColor: '#DC2626', marginTop: 20, paddingVertical: 12, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <FontAwesome name="sign-out" size={16} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Logout</Text>
        </Pressable>

        <Text style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 16 }}>App version 1.6.0</Text>
      </ScrollView>
    </View>
  );
};

export default AdminProfileScreen;
