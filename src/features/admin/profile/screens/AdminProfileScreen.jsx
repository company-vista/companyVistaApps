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
import ImagePicker from 'react-native-image-crop-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { logoutUser, updateProfileUser } from '../../../../store/slices/authSlice';
import { s } from '../../../../theme/responsive';
import { useThemeColors } from '../../../../theme/colors';
import BackButton from '../../../../components/buttons/BackButton';
import { fetchAdminProfile, updateAdminProfile, uploadAdminAvatar } from '../api/adminProfileApi';

function withImageCacheBust(uri) {
  if (!uri || !/^https?:\/\//i.test(uri)) {
    return uri;
  }
  const separator = uri.includes('?') ? '&' : '?';
  return `${uri}${separator}t=${Date.now()}`;
}

const AdminProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const user = useAppSelector(state => state.auth.user);
  const token = useAppSelector(state => state.auth.token);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState(null);

  const isDark = colors.mode === 'dark';
  const cardBackground = isDark ? colors.cardElevated : colors.cardHighlight;

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
    localAvatarUri ??
    user?.profileImage ??
    user?.profilePicture ??
    user?.avatar ??
    user?.image ??
    user?.photo;

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

  const handleAvatarPress = async () => {
    if (isUploadingAvatar) {
      return;
    }

    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
        compressImageQuality: 1,
      });

      if (!image?.path) {
        Alert.alert('Image missing', 'Please select another image.');
        return;
      }

      setLocalAvatarUri(image.path);
      setIsUploadingAvatar(true);

      const result = await uploadAdminAvatar({
        file: {
          name: image.filename || 'avatar.jpg',
          type: image.mime,
          uri: image.path,
        },
        token,
      });

      if (!result.isSuccess) {
        Alert.alert('Upload failed', result.error || 'Unable to update profile image.');
        return;
      }

      const nextAvatar = withImageCacheBust(result.avatar ?? image.path);
      dispatch(updateProfileUser({
        ...(user ?? { email: '' }),
        ...(result.user ?? {}),
        avatar: nextAvatar,
        image: nextAvatar,
        photo: nextAvatar,
        profileImage: nextAvatar,
        profilePicture: nextAvatar,
      }));
      setLocalAvatarUri(nextAvatar);
    } catch (error) {
      if (error?.code === 'E_PICKER_CANCELLED') {
        return;
      }
      const message = error instanceof Error
        ? error.message
        : 'Unable to update profile image right now.';
      Alert.alert('Upload failed', message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const contactItems = [
    { label: 'Email', value: user?.email || 'N/A', icon: 'envelope-o' },
    {
      label: 'Phone',
      value: user?.phone ?? user?.phoneNumber ?? user?.mobile ?? 'N/A',
      icon: 'phone',
    },
    { label: 'Role', value: user?.role || 'Admin', icon: 'user-o' },
  ];

  const rowBorderStyle = { borderTopWidth: 1, borderTopColor: colors.border };

  const accountItems = [
    {
      key: 'settings',
      title: 'Settings',
      subtitle: 'Security, notifications & policies',
      icon: 'cog',
      onPress: () => navigation.navigate('AdminSettings'),
    },
    {
      key: 'deactivate',
      title: 'Deactivate Account',
      subtitle: 'Temporarily disable your account',
      icon: 'pause-circle',
      onPress: () => navigation.navigate('DeactivateAccount'),
    },
    {
      key: 'delete',
      title: 'Delete Account',
      subtitle: 'Permanently delete your account',
      icon: 'trash-o',
      onPress: () => navigation.navigate('DeleteAccount'),
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + s(12),
            paddingBottom: Math.max(insets.bottom, s(24)) + s(16),
          },
        ]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <BackButton onPress={handleBack} />
            <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          </View>
          <Pressable
            onPress={handleOpenEditModal}
            style={[styles.editPill, { backgroundColor: colors.accentSoft }]}
            accessibilityRole="button">
            <FontAwesome name="pencil" size={14} color={colors.accent} />
            <Text style={[styles.editPillText, { color: colors.accent }]}>Edit</Text>
          </Pressable>
        </View>

        <View style={[styles.profileCard, { backgroundColor: cardBackground }]}>
          <Pressable
            onPress={handleAvatarPress}
            disabled={isUploadingAvatar}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            style={styles.avatarPressable}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.cardHighlight,
                  borderColor: colors.accentSoft,
                },
              ]}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <FontAwesome name="user" size={46} color={colors.accent} />
              )}
            </View>
            <View
              style={[
                styles.cameraButton,
                { backgroundColor: colors.accent, borderColor: colors.surface },
              ]}>
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color={colors.buttonText} />
              ) : (
                <FontAwesome name="camera" size={18} color={colors.buttonText} />
              )}
            </View>
          </Pressable>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.name || 'Admin'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {user?.email || 'Admin Portal Account'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.roleBadgeText, { color: colors.accent }]}>
              {user?.role || 'admin'}
            </Text>
          </View>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>
            Contact information
          </Text>
          {contactItems.map((item, index) => (
            <View
              key={item.label}
              style={[styles.detailRow, index > 0 && rowBorderStyle]}>
              <View
                style={[
                  styles.detailIcon,
                  { backgroundColor: colors.cardHighlight },
                ]}>
                <FontAwesome name={item.icon} size={17} color={colors.accent} />
              </View>
              <View style={styles.detailCopy}>
                <Text style={[styles.detailLabel, { color: colors.subtle }]}>
                  {item.label}
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.detailsCard, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>
            Account
          </Text>
          {accountItems.map((item, index) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              accessibilityRole="button"
              style={[styles.detailRow, index > 0 && rowBorderStyle]}>
              <View
                style={[
                  styles.detailIcon,
                  { backgroundColor: colors.cardHighlight },
                ]}>
                <FontAwesome name={item.icon} size={17} color={colors.accent} />
              </View>
              <View style={styles.detailCopy}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.detailValue, { color: colors.subtle }]}>
                  {item.subtitle}
                </Text>
              </View>
              <FontAwesome name="angle-right" size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => dispatch(logoutUser())}
          accessibilityRole="button"
          style={[styles.logoutButton, { backgroundColor: colors.buttonBackground }]}>
          <FontAwesome name="sign-out" size={17} color={colors.buttonText} />
          <Text style={[styles.logoutText, { color: colors.buttonText }]}>
            Logout
          </Text>
        </Pressable>

        <Text style={[styles.versionText, { color: colors.subtle }]}>
          App version 1.8.0
        </Text>
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
          <View style={[styles.modalCard, { backgroundColor: cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Profile
              </Text>
              <Pressable
                onPress={() => setIsEditModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close edit profile"
                disabled={isSavingProfile}
                hitSlop={8}>
                <FontAwesome name="close" size={18} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.cardHighlight,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
              editable={!isSavingProfile}
            />
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.cardHighlight,
                },
              ]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              editable={!isSavingProfile}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.cancelButton, { backgroundColor: colors.cardHighlight }]}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isSavingProfile}>
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, { backgroundColor: colors.buttonBackground }, isSavingProfile && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color={colors.buttonText} />
                ) : (
                  <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>
                    Save
                  </Text>
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
  screen: { flex: 1 },
  scrollContent: { paddingHorizontal: s(10) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
  },
  title: {
    fontSize: font.display,
    fontWeight: '400',
  },
  editPill: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(7),
    paddingHorizontal: s(14),
    borderRadius: 18,
  },
  editPillText: {
    fontSize: font.sm,
    fontWeight: '600',
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 29,
    marginTop: s(24),
    paddingVertical: s(24),
  },
  avatarPressable: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: 60,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 18,
  },
  name: {
    fontSize: font.displayXL,
    fontWeight: '400',
    marginTop: s(14),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: font.bodySmall,
    fontWeight: '400',
    marginTop: s(4),
    textAlign: 'center',
  },
  roleBadge: {
    marginTop: s(10),
    paddingHorizontal: s(12),
    paddingVertical: s(4),
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: font.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  detailsCard: {
    borderRadius: 18,
    marginTop: s(16),
    paddingHorizontal: s(10),
    paddingTop: s(16),
    paddingBottom: s(4),
  },
  sectionTitle: {
    fontSize: font.lg,
    fontWeight: '400',
    marginBottom: s(4),
  },
  detailRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(14),
    paddingVertical: s(12),
  },
  detailIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  detailCopy: { flex: 1 },
  detailLabel: {
    fontSize: font.sm,
    fontWeight: '400',
  },
  detailValue: {
    fontSize: font.md,
    fontWeight: '400',
    marginTop: s(4),
  },
  logoutButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(10),
    borderRadius: 34,
    marginTop: s(32),
  },
  logoutText: {
    fontSize: font.lg,
    fontWeight: '400',
  },
  versionText: {
    fontSize: font.sm,
    fontWeight: '400',
    marginTop: s(18),
    textAlign: 'center',
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
  },
  inputLabel: {
    fontSize: font.sm,
    fontWeight: '600',
    marginBottom: s(6),
  },
  modalInput: {
    minHeight: s(46),
    borderWidth: 1,
    borderRadius: s(8),
    paddingHorizontal: s(12),
    marginBottom: s(14),
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
  },
  cancelButtonText: {
    fontSize: font.sm,
    fontWeight: '600',
  },
  saveButton: {
    minWidth: s(84),
    minHeight: s(42),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(8),
  },
  saveButtonDisabled: { opacity: 0.65 },
  saveButtonText: {
    fontSize: font.sm,
    fontWeight: '600',
  },
});
