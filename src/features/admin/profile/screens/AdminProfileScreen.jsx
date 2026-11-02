import { font } from '../../../../theme/typography';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { logoutUser, updateProfileUser } from '../../../../store/slices/authSlice';
import { s } from '../../../../theme/responsive';
import { fetchAdminProfile, updateAdminProfile } from '../api/adminProfileApi';

const AdminProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useAppSelector(state => state.auth.user);
  const token = useAppSelector(state => state.auth.token);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('AdminHome');
  };

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      const result = await fetchAdminProfile(token);
      if (isMounted && result.user) {
        dispatch(updateProfileUser(result.user));
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [dispatch, token]);

  const profileImage =
    user?.profileImage ??
    user?.profilePicture ??
    user?.avatar ??
    user?.image ??
    user?.photo;

  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature will be available soon.');
  };

  const handleOpenEditModal = () => {
    setName(user?.name ?? '');
    setPhone(user?.phone ?? user?.phoneNumber ?? user?.mobile ?? '');
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (isSavingProfile) {
      return;
    }
    if (!name.trim()) {
      Alert.alert('Missing details', 'Please enter your name.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await updateAdminProfile({
        name,
        phone,
        token,
      });

      if (!result.isSuccess) {
        Alert.alert('Update failed', result.error || 'Unable to update profile.');
        return;
      }

      dispatch(updateProfileUser({
        ...(user ?? {}),
        ...(result.user ?? {}),
        mobile: phone.trim(),
        name: name.trim(),
        phone: phone.trim(),
        phoneNumber: phone.trim(),
      }));
      setIsEditModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Update failed',
        error instanceof Error ? error.message : 'Unable to update profile right now.',
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const securityItems = [
    {
      key: 'password',
      title: 'Password',
      subtitle: 'Change your account password',
      icon: 'lock-closed-outline',
      onPress: showComingSoon,
    },
    {
      key: 'help-support',
      title: 'Help & Support',
      subtitle: 'Get help or contact support',
      icon: 'help-circle-outline',
      onPress: showComingSoon,
    },
    {
      key: 'terms-policies',
      title: 'Terms & Policies',
      subtitle: 'View terms and privacy policy',
      icon: 'document-text-outline',
      onPress: showComingSoon,
    },
  ];

  const accountItems = [
    {
      key: 'logout',
      title: 'Logout',
      subtitle: 'Sign out from this account',
      icon: 'log-out-outline',
      onPress: () => dispatch(logoutUser()),
    },
    {
      key: 'deactivate',
      title: 'Deactivate Account',
      subtitle: 'Temporarily disable your account',
      icon: 'pause-circle-outline',
      onPress: () => navigation.navigate('DeactivateAccount'),
    },
    {
      key: 'delete',
      title: 'Delete Account',
      subtitle: 'Permanently delete your account',
      icon: 'trash-outline',
      onPress: () => navigation.navigate('DeleteAccount'),
    },
  ];

  const renderMenuItems = items =>
    items.map((item, index) => (
      <Pressable
        key={item.key}
        onPress={item.onPress}
        accessibilityRole="button"
        style={[styles.menuRow, index > 0 && styles.menuRowBorder]}>
        <Ionicons name={item.icon} size={20} color="#1F2937" style={styles.menuIcon} />
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
        {/* <Ionicons name="chevron-forward" size={16} color="#475569" /> */}
      </Pressable>
    ));

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, s(12)) }]}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerButton}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable
          onPress={showComingSoon}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          style={styles.headerButton}>
          <Ionicons name="settings-outline" size={21} color="#1F2937" />
        </Pressable>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: s(24) + insets.bottom,
          },
        ]}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <FontAwesome name="user" size={26} color="#1E3A8A" />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Admin'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
            {/* <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role || 'owner'}</Text>
            </View> */}
          </View>
          <Pressable
            style={styles.editButton}
            onPress={handleOpenEditModal}
            accessibilityRole="button">
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.menuGroup}>{renderMenuItems(securityItems)}</View>
        <View style={[styles.menuGroup, styles.accountGroup]}>
          {renderMenuItems(accountItems)}
        </View>

        <Text style={styles.versionText}>App version 1.7.0</Text>
      </ScrollView>
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsEditModalVisible(false)}
            disabled={isSavingProfile}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable
                onPress={() => setIsEditModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close edit profile"
                disabled={isSavingProfile}
                hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
              editable={!isSavingProfile}
            />
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.modalInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              editable={!isSavingProfile}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isSavingProfile}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, isSavingProfile && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default AdminProfileScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(18),
    paddingBottom: s(10),
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: s(40),
    height: s(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: font.lg,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: s(18),
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: s(18),
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  avatar: {
    width: s(52),
    height: s(52),
    borderRadius: s(26),
    flexShrink: 0,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: s(52),
    height: s(52),
  },
  profileInfo: {
    flex: 1,
    marginLeft: s(10),
    marginRight: s(8),
  },
  profileName: {
    fontSize: font.base,
    fontWeight: '600',
    color: '#0F172A',
  },
  profileEmail: {
    fontSize: font.xs,
    color: '#64748B',
    marginTop: 1,
  },
  roleBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: s(6),
    paddingVertical: s(2),
    borderRadius: s(4),
    marginTop: s(4),
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: font.micro,
    color: '#3730A3',
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: s(8),
    paddingVertical: s(5),
    borderRadius: s(4),
    backgroundColor: '#3182CE',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: font.xs,
    fontWeight: '600',
  },
  menuGroup: {
    paddingVertical: s(9),
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  accountGroup: {
    marginTop: s(4),
  },
  menuRow: {
    minHeight: s(58),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: s(6),
  },
  menuRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  menuIcon: {
    width: s(28),
    marginRight: s(12),
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: font.sm,
    fontWeight: '500',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: font.micro,
    color: '#64748B',
    marginTop: s(1),
  },
  versionText: {
    textAlign: 'center',
    fontSize: font.micro,
    color: '#94A3B8',
    marginTop: s(8),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(20),
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    padding: s(20),
    borderRadius: s(16),
    backgroundColor: '#FFFFFF',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(16),
  },
  modalTitle: {
    fontSize: font.xl,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: font.sm,
    fontWeight: '600',
    color: '#334155',
    marginBottom: s(6),
  },
  modalInput: {
    minHeight: s(46),
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: s(8),
    paddingHorizontal: s(12),
    marginBottom: s(14),
    color: '#0F172A',
    fontSize: font.base,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: s(10),
    marginTop: s(4),
  },
  cancelButton: {
    minWidth: s(84),
    minHeight: s(42),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(8),
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#334155',
    fontSize: font.sm,
    fontWeight: '600',
  },
  saveButton: {
    minWidth: s(84),
    minHeight: s(42),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(8),
    backgroundColor: '#3182CE',
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: font.sm,
    fontWeight: '600',
  },
});
