import { Pressable, Share, Switch, Text, View, } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { toggleTheme } from '../../../store/slices/themeSlice';
import { useThemeColors } from '../../../theme/colors';
import styles from './MoreTabContent.styles';
const COMPANY_URL = 'https://www.companyvista.com/';
const INVITE_MESSAGE = [
    'Join me on Company Vista to manage company work in one place.',
    `Company URL: ${COMPANY_URL}`,
].join('\n\n');
function MoreTabContent({ onFollowUsPress, onHelpFeedbackPress, onSupportPress, onProfilePress, }) {
    const dispatch = useAppDispatch();
    const colors = useThemeColors();
    const isDarkTheme = useAppSelector(state => state.theme.mode === 'dark');
    const isLight = colors.mode === 'light';
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
    return (<View style={styles.container}>
      <Pressable onPress={onProfilePress} style={[styles.menuItem, { backgroundColor: isLight ? 'rgba(229,231,235,0.5)' : 'rgba(255,255,255,0.07)' }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="user-circle" size={17} color={colors.accent}/>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Manage your personal information
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle}/>
      </Pressable>

      <Pressable onPress={handleToggleTheme} style={[styles.menuItem, { backgroundColor: isLight ? 'rgba(229,231,235,0.5)' : 'rgba(255,255,255,0.07)' }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name={isDarkTheme ? 'moon-o' : 'sun-o'} size={18} color={isDarkTheme ? colors.accent : '#f59e0b'}/>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Switch Theme</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Switch between Light and Dark mode
          </Text>
        </View>

        <Switch onValueChange={handleToggleTheme} thumbColor={isDarkTheme ? colors.primary : colors.background} trackColor={{ false: colors.border, true: colors.accentSoft }} value={isDarkTheme}/>
      </Pressable>

      <Pressable onPress={handleInviteFriends} style={[styles.menuItem, { backgroundColor: isLight ? 'rgba(229,231,235,0.5)' : 'rgba(255,255,255,0.07)' }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="user-plus" size={17} color={colors.accent}/>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Invite Friends</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Share Company Vista with your contacts
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle}/>
      </Pressable>

      <Pressable onPress={onHelpFeedbackPress} style={[styles.menuItem, { backgroundColor: isLight ? 'rgba(247, 248, 250, 0.5)' : 'rgba(255,255,255,0.07)' }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="life-ring" size={17} color={colors.accent}/>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Help and feedback</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Support, Contact us, Privacy policy
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle}/>
      </Pressable>

      <Pressable onPress={onSupportPress} style={[styles.menuItem, { backgroundColor: isLight ? 'rgba(229,231,235,0.5)' : 'rgba(255,255,255,0.07)' }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="headphones" size={17} color={colors.accent}/>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Support</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Get help, contact support
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle}/>
      </Pressable>

      <Pressable onPress={onFollowUsPress} style={[styles.menuItem, { backgroundColor: isLight ? 'rgba(229,231,235,0.5)' : 'rgba(255,255,255,0.07)' }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="share-alt" size={17} color={colors.accent}/>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Follow us</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Instagram, Facebook, LinkedIn
          </Text>
        </View>

        <View style={styles.socialIcons}>
          <FontAwesome name="instagram" size={18} color="#e11d48"/>
          <FontAwesome name="facebook" size={18} color="#2563eb"/>
          <FontAwesome name="linkedin" size={18} color="#0f766e"/>
        </View>
      </Pressable>
    </View>);
}
export default MoreTabContent;
