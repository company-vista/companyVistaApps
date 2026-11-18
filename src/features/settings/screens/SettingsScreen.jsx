import { Linking, Pressable, ScrollView, Share, Text, View, } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setThemeMode } from '../../../store/slices/themeSlice';
import { useThemeColors, useResolvedThemeMode } from '../../../theme/colors';
import styles from './SettingsScreen.styles';
const COMPANY_URL = 'https://www.companyvista.com/';
const INVITE_MESSAGE = [
  'Join me on Company Vista to manage company work in one place.',
  `Company URL: ${COMPANY_URL}`,
].join('\n\n');
const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun-o' },
  { value: 'dark', label: 'Dark', icon: 'moon-o' },
  { value: 'system', label: 'System', icon: 'laptop' },
];
function SettingsScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const themeMode = useAppSelector(state => state.theme.mode);
  const effectiveMode = useResolvedThemeMode();
  function handleThemeChange(mode) {
    dispatch(setThemeMode(mode));
  }
  // ------- Invite Friends Share Function------------
  async function handleInviteFriends() {
    await Share.share({
      message: INVITE_MESSAGE,
      title: 'Invite Friends',
      url: COMPANY_URL,
    }, {
      dialogTitle: 'Invite Friends',
      subject: `Company Vista - ${COMPANY_URL}`,
    });
  }
  return (<ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
    <View style={styles.group}>
      <View style={[styles.menuItem, styles.themeCard]}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Theme</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {themeMode === 'system'
              ? `Following system (${effectiveMode === 'dark' ? 'Dark' : 'Light'})`
              : 'Choose how Company Vista looks'}
          </Text>
        </View>

        <View style={styles.themeOptions}>
          {THEME_OPTIONS.map(option => {
            const active = themeMode === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleThemeChange(option.value)}
                style={[
                  styles.themeOption,
                  {
                    borderColor: active ? colors.accent : colors.border,
                    backgroundColor: active
                      ? colors.accentSoft
                      : colors.surface,
                  },
                ]}>
                <FontAwesome
                  name={option.icon}
                  size={16}
                  color={active ? colors.accent : colors.muted}
                />
                <Text
                  style={[
                    styles.themeOptionLabel,
                    { color: active ? colors.accent : colors.muted },
                  ]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable onPress={handleInviteFriends} style={[styles.menuItem, {}]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="user-plus" size={17} color={colors.accent} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Invite Friends</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Share Company Vista with your contacts
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle} />
      </Pressable>
    </View>

    <View style={styles.group}>
      <Pressable onPress={() => navigation.navigate('HelpFeedback')} style={[styles.menuItem, {}]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="life-ring" size={17} color={colors.accent} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Help and feedback</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Support, Contact us, Privacy policy
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle} />
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Support')} style={[styles.menuItem, {}]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="headphones" size={17} color={colors.accent} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Support</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Get help, contact support
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle} />
      </Pressable>

      <Pressable onPress={() => navigation.navigate('FollowUs')} style={[styles.menuItem, {}]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="share-alt" size={17} color={colors.accent} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Follow us</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Instagram, Facebook, LinkedIn
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle} />
      </Pressable>
    </View>

    <View style={styles.group}>
      <Text style={[styles.sectionHeader, { color: colors.muted }]}>Privacy & Security</Text>

      <Pressable onPress={() => Toast.show({ type: 'info', text1: 'Notifications' })} style={styles.menuItem}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="bell-o" size={17} color={colors.accent} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Manage notification preferences
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle} />
      </Pressable>

      <Pressable onPress={() => navigation.navigate('ChangePassword')} style={styles.menuItem}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="lock" size={17} color={colors.accent} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Update your account password
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle} />
      </Pressable>

      <Pressable onPress={() => Toast.show({ type: 'info', text1: 'Privacy Policy' })} style={styles.menuItem}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="shield" size={17} color={colors.accent} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            How we use your information
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle} />
      </Pressable>

      <Pressable onPress={() => Linking.openURL('https://companyvista.com/privacy-policy')} style={styles.menuItem}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="file-text-o" size={17} color={colors.accent} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Terms & Conditions</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Rules and guidelines
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle} />
      </Pressable>

    </View>

    <View style={styles.group}>
      <Text style={[styles.sectionHeader, { color: colors.muted }]}>Account Management</Text>

      <Pressable onPress={() => navigation.navigate('DeactivateAccount')} style={styles.menuItem}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="pause-circle-o" size={17} color={colors.danger} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Deactivate Account</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Temporarily disable your account
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle} />
      </Pressable>

      <Pressable onPress={() => navigation.navigate('DeleteAccount')} style={styles.menuItem}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="trash-o" size={17} color={colors.danger} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Delete Account</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Permanently delete your account
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle} />
      </Pressable>
    </View>
  </ScrollView>);
}
export default SettingsScreen;
