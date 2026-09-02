import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutUser, updateProfileUser } from '../../../store/slices/authSlice';
import { useThemeColors } from '../../../theme/colors';
import BackButton from '../../../components/buttons/BackButton';
import { fetchClientProfile } from '../api/clientProfileDetailsApi';
import styles from './ProfileScreen.styles';
function formatProfileDate(value) {
  if (!value) {
    return 'N/A';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
function ProfileScreen() {
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const user = useAppSelector(state => state.auth.user);
  const token = useAppSelector(state => state.auth.token);
  const [isSwitchSheetVisible, setIsSwitchSheetVisible] = useState(false);
  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingEmail, setEditingEmail] = useState('');
  const [emailList, setEmailList] = useState([
    { email: user?.email ?? 'N/A', isPrimary: true },
  ]);
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
  const phone = user?.phone ?? user?.phoneNumber ?? user?.mobile ?? 'N/A';
  const dateOfBirth = formatProfileDate(user?.dateOfBirth ?? user?.dob);
  const passportNumber = user?.passportNumber ?? user?.passportNo ?? 'N/A';
  const profileItems = [
    { label: 'Phone', value: phone, icon: 'phone' },
    { label: 'Date of Birth', value: dateOfBirth, icon: 'calendar-o' },
    { label: 'Passport Number', value: passportNumber, icon: 'id-card-o' },
    { label: 'Role', value: user?.role ?? 'N/A', icon: 'user-o' },
  ];
  const street = user?.address?.addressLine1 ??
    user?.address?.street ??
    user?.addressLine1 ??
    user?.street;
  const cityState = [user?.address?.city, user?.address?.state]
    .filter(Boolean)
    .join(', ');
  const postalCode = user?.address?.postalCode ?? user?.postalCode;
  const country = user?.address?.country ?? user?.country;
  const addressSummary = [street, cityState, postalCode, country].filter(Boolean).join(', ') || 'Add address';
  // Profile completion: email, phone, DOB, passport, address
  const isEmailFilled = Boolean(user?.email && user.email !== 'N/A' && user.email.trim() !== '');
  const isPhoneFilled = Boolean(phone && phone !== 'N/A' && String(phone).trim() !== '');
  const isDobFilled = Boolean(dateOfBirth && dateOfBirth !== 'N/A');
  const isPassportFilled = Boolean(passportNumber && passportNumber !== 'N/A' && String(passportNumber).trim() !== '');
  const isAddressFilled = Boolean(addressSummary !== 'Add address');
  const completionFields = [
    { key: 'email', label: 'Email', filled: isEmailFilled },
    { key: 'phone', label: 'Phone No', filled: isPhoneFilled },
    { key: 'dob', label: 'Date of Birth', filled: isDobFilled },
    { key: 'passport', label: 'Passport No', filled: isPassportFilled },
    { key: 'address', label: 'Address', filled: isAddressFilled },
  ];
  const filledCount = completionFields.filter(f => f.filled).length;
  const totalCount = completionFields.length;
  const completionPercent = Math.round((filledCount / totalCount) * 100);
  const missingLabels = completionFields.filter(f => !f.filled).map(f => f.label);
  const switchSheetBackground = colors.mode === 'dark' ? '#1f1f22' : colors.surface;
  function handleSwitchAccountPress() {
    setIsSwitchSheetVisible(true);
  }
  function handleAddAccountPress() {
    setIsSwitchSheetVisible(false);
    dispatch(logoutUser());
  }
  return (<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[
    styles.scrollContent,
    {
      backgroundColor: colors.background,
      paddingBottom: Math.max(safeAreaInsets.bottom, 24),
      paddingTop: safeAreaInsets.top + 12,
    },
  ]} style={styles.screen}>

    <View style={styles.header}>
      <View style={styles.titleRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>
      <Pressable onPress={() => navigation.navigate('EditProfile')} style={{ padding: 4 }} hitSlop={8}>
        <FontAwesome name="pencil" size={17} color={colors.accent} />
      </Pressable>
    </View>

    <View style={[styles.profileCard, { backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight }]}>
      <View style={styles.avatarWrapNoCover}>
        <View style={[
          styles.avatar,
          { backgroundColor: colors.cardHighlight, borderColor: colors.accentSoft },
        ]}>
          {profileImage ? (<Image onError={event => console.log('Profile avatar failed', event.nativeEvent.error, profileImage)} source={{ uri: profileImage }} style={styles.avatarImage} />) : (<FontAwesome name="user" size={42} color={colors.accent} />)}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        <Text style={[styles.name, { color: colors.text, marginTop: 0, lineHeight: 30 }]}>{user?.name ?? 'N/A'}</Text>
        {filledCount === totalCount && (
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
            <FontAwesome name="check" size={10} color="#FFF" />
          </View>
        )}
      </View>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Client Portal Account</Text>
    </View>

    {/* Profile Completion Progress - hide when all fields filled */}
    {filledCount < totalCount ? (
      <View style={[styles.progressCard, { backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight, borderColor: colors.border }]}>
        <View style={styles.progressHeader}>
          <View style={styles.progressTitleRow}>
            <FontAwesome name="tasks" size={14} color={colors.accent} />
            <Text style={[styles.progressTitle, { color: colors.text }]}>Profile Complete</Text>
          </View>
          <View style={[styles.progressBadge, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.progressBadgeText, { color: colors.accent }]}>{filledCount}/{totalCount}</Text>
          </View>
        </View>
        <View style={styles.progressSubRow}>
          <Text style={[styles.progressPercent, { color: colors.accent }]}>{completionPercent}%</Text>
          <Text style={[styles.progressSubText, { color: colors.subtle }]}>{`${missingLabels.join(', ')} pending`}</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${completionPercent}%`, backgroundColor: colors.accent }]} />
        </View>
        <View style={styles.progressFieldsRow}>
          {completionFields.map(f => (
            <View key={f.key} style={styles.progressFieldItem}>
              <View style={[styles.progressDot, { backgroundColor: f.filled ? '#10B981' : colors.border }]}>
                {f.filled && <FontAwesome name="check" size={7} color="#FFF" />}
              </View>
              <Text style={[styles.progressFieldLabel, { color: f.filled ? colors.text : colors.muted }]}>{f.label}</Text>
            </View>
          ))}
        </View>
        <Pressable onPress={() => navigation.navigate('EditProfile')} style={styles.progressCta}>
          <Text style={[styles.progressCtaText, { color: colors.accent }]}>Complete now →</Text>
        </Pressable>
      </View>
    ) : null}

    <Pressable onPress={handleSwitchAccountPress} style={[
      styles.switchAccountButton,
      {
        backgroundColor: colors.cardHighlight,
        borderColor: colors.border,
      },
    ]}>
      <View style={[styles.switchAccountIcon, { backgroundColor: colors.cardHighlight }]}>
        <FontAwesome name="exchange" size={16} color={colors.accent} />
      </View>
      <View style={styles.switchAccountCopy}>
        <Text style={[styles.switchAccountTitle, { color: colors.text }]}>
          Switch account
        </Text>
        <Text style={[styles.switchAccountSubtitle, { color: colors.subtle }]}>
          Sign in with another account
        </Text>
      </View>
      <FontAwesome name="angle-right" size={22} color={colors.muted} />
    </Pressable>

    <View style={[styles.detailsCard, { backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight }]}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>
        Contact information
      </Text>
      <View>
        <Pressable onPress={() => setIsEmailDropdownOpen(prev => !prev)} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.detailIcon, { backgroundColor: colors.cardHighlight }]}>
            <FontAwesome name="envelope-o" size={17} color={colors.accent} />
          </View>
          <View style={styles.detailCopy}>
            <Text style={[styles.detailLabel, { color: colors.subtle }]}>
              Email
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{user?.email ?? 'N/A'}</Text>
          </View>
          <View style={styles.emailDropdownRight}>
            <Text style={styles.emailDropdownPrimaryLabel}>Primary</Text>
            <FontAwesome name={isEmailDropdownOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.muted} style={{ marginTop: 6 }} />
          </View>
        </Pressable>
        {isEmailDropdownOpen && (<View style={[styles.emailDropdown, { backgroundColor: colors.cardHighlight, borderColor: colors.border }]}>
          {emailList.map((item, index) => (<View key={item.email + index} style={[styles.emailDropdownItem, index < emailList.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            {editingIndex === index ? (<View style={styles.emailEditRow}>
              <TextInput autoFocus keyboardType="email-address" value={editingEmail} onChangeText={setEditingEmail} style={[styles.emailInput, { color: colors.text, borderColor: colors.border, flex: 1 }]} onSubmitEditing={() => {
                if (editingEmail.trim()) {
                  setEmailList(prev => prev.map((e, i) => i === index ? { ...e, email: editingEmail.trim() } : e));
                  setEditingIndex(null);
                  setEditingEmail('');
                }
              }} />
              <Pressable onPress={() => {
                if (editingEmail.trim()) {
                  setEmailList(prev => prev.map((e, i) => i === index ? { ...e, email: editingEmail.trim() } : e));
                  setEditingIndex(null);
                  setEditingEmail('');
                }
              }} style={[styles.emailInputSubmit, { backgroundColor: colors.cardHighlight }]}>
                <FontAwesome name="check" size={14} color={colors.buttonText} />
              </Pressable>
              <Pressable onPress={() => { setEditingIndex(null); setEditingEmail(''); }} style={[styles.emailInputClose, { backgroundColor: colors.cardHighlight }]}>
                <FontAwesome name="times" size={14} color={colors.muted} />
              </Pressable>
            </View>) : (<>
              <View style={styles.emailDropdownLeft}>
                <Text style={[styles.emailDropdownValue, { color: colors.text }]}>{item.email}</Text>
              </View>
              {item.isPrimary ? (<Pressable onPress={() => setIsAddingEmail(true)} style={[styles.emailDropdownAdd, { backgroundColor: colors.accentSoft }]}>
                <FontAwesome name="plus" size={12} color={colors.accent} />
              </Pressable>) : (<Pressable onPress={() => { setEditingIndex(index); setEditingEmail(item.email); }} style={[styles.emailDropdownAdd, { backgroundColor: colors.cardHighlight, borderWidth: 1, borderColor: colors.border }]}>
                <FontAwesome name="pencil" size={11} color={colors.accent} />
              </Pressable>)}
            </>)}
          </View>))}
          {isAddingEmail && (<View style={[styles.emailInputRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <TextInput autoFocus keyboardType="email-address" placeholder="Enter email" placeholderTextColor={colors.muted} value={newEmail} onChangeText={setNewEmail} style={[styles.emailInput, { color: colors.text, borderColor: colors.border }]} onSubmitEditing={() => {
              if (newEmail.trim()) {
                setEmailList(prev => [...prev, { email: newEmail.trim(), isPrimary: false }]);
                setNewEmail('');
                setIsAddingEmail(false);
              }
            }} />
            <Pressable onPress={() => {
              if (newEmail.trim()) {
                setEmailList(prev => [...prev, { email: newEmail.trim(), isPrimary: false }]);
                setNewEmail('');
                setIsAddingEmail(false);
              }
            }} style={[styles.emailInputSubmit, { backgroundColor: colors.cardHighlight }]}>
              <FontAwesome name="check" size={14} color={colors.buttonText} />
            </Pressable>
            <Pressable onPress={() => { setNewEmail(''); setIsAddingEmail(false); }} style={[styles.emailInputClose, { backgroundColor: colors.cardHighlight }]}>
              <FontAwesome name="times" size={14} color={colors.muted} />
            </Pressable>
          </View>)}
        </View>)}
        {profileItems.map(item => (<View key={item.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.detailIcon, { backgroundColor: colors.cardHighlight }]}>
            <FontAwesome name={item.icon} size={17} color={colors.accent} />
          </View>
          <View style={styles.detailCopy}>
            <Text style={[styles.detailLabel, { color: colors.subtle }]}>
              {item.label}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{item.value}</Text>
          </View>
        </View>))}
      </View>
    </View>

    <Pressable onPress={() => navigation.navigate('ProfileAddress')} style={[styles.addressCard, { backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight }]}>
      <View style={[styles.detailIcon, { backgroundColor: colors.cardHighlight }]}>
        <FontAwesome name="map-marker" size={17} color={colors.accent} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={[styles.detailLabel, { color: colors.subtle }]}>Address & Edit</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>{addressSummary}</Text>
      </View>
      <FontAwesome name="angle-right" size={22} color={colors.muted} />
    </Pressable>

    <Pressable onPress={() => dispatch(logoutUser())} style={[styles.logoutButton, { backgroundColor: colors.buttonBackground }]}>
      <FontAwesome name="sign-out" size={18} color={colors.buttonText} />
      <Text style={[styles.logoutText, { color: colors.buttonText }]}>Logout</Text>
    </Pressable>

    <Text style={[styles.versionText, { color: colors.subtle }]}>
      App version 1.4.1
    </Text>

    <Modal animationType="slide" transparent visible={isSwitchSheetVisible} onRequestClose={() => setIsSwitchSheetVisible(false)}>
      <Pressable style={styles.switchSheetOverlay} onPress={() => setIsSwitchSheetVisible(false)}>
        <Pressable onPress={event => event.stopPropagation()} style={[
          styles.switchSheet,
          { backgroundColor: switchSheetBackground },
        ]}>
          <View style={styles.switchSheetHandle} />

          <View style={[styles.switchSheetAccountBox, { borderColor: colors.border }]}>
            <View style={styles.switchSheetAccountRow}>
              <View style={styles.switchSheetAvatar}>
                {profileImage ? (<Image source={{ uri: profileImage }} style={styles.switchSheetAvatarImage} />) : (<FontAwesome name="user" size={17} color={colors.accent} />)}
              </View>
              <Text numberOfLines={1} style={[styles.switchSheetAccountName, { color: colors.text }]}>
                {user?.name ?? user?.email ?? 'Current account'}
              </Text>
            </View>

            <Pressable onPress={handleAddAccountPress} style={styles.switchSheetAddRow}>
              <View style={styles.switchSheetAddIcon}>
                <FontAwesome name="plus" size={18} color="#ffffff" />
              </View>
              <Text style={[styles.switchSheetAddText, { color: colors.text }]}>
                Add another account
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.metaText, { color: colors.muted }]}>Company Vista</Text>
        </Pressable>
      </Pressable>
    </Modal>

  </ScrollView>);
}
export default ProfileScreen;
