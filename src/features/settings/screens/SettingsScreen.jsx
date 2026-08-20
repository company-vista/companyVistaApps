import { Linking, Pressable, ScrollView, Share, Switch, Text, View, } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { toggleTheme } from '../../../store/slices/themeSlice';
import { useThemeColors } from '../../../theme/colors';
import styles from './SettingsScreen.styles';
const COMPANY_URL = 'https://www.companyvista.com/';
const INVITE_MESSAGE = [
  'Join me on Company Vista to manage company work in one place.',
  `Company URL: ${COMPANY_URL}`,
].join('\n\n');
function SettingsScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const isDarkTheme = useAppSelector(state => state.theme.mode === 'dark');
  function handleToggleTheme() {
    dispatch(toggleTheme());
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
  return (<ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
    <View style={styles.group}>
      <Pressable onPress={handleToggleTheme} style={[styles.menuItem, {}]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name={isDarkTheme ? 'moon-o' : 'sun-o'} size={18} color={isDarkTheme ? colors.accent : '#f59e0b'} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Switch Theme</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Switch between Light and Dark mode
          </Text>
        </View>

        <Switch onValueChange={handleToggleTheme} thumbColor={isDarkTheme ? colors.primary : "#0000ff81"} trackColor={{ false: colors.border, true: colors.accentSoft }} value={isDarkTheme} />
      </Pressable>

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
    </View>
  </ScrollView>);
}
export default SettingsScreen;
