import { Pressable, Text, View, } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors, themePalette } from '../../../theme/colors';
import styles from './MoreTabContent.styles';
function MoreTabContent({ onManagePress, onFollowUsPress, onHelpFeedbackPress, onSupportPress, onProfilePress, onSettingsPress, }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    return (<View style={styles.container}>
      <Pressable onPress={onProfilePress} style={[styles.menuItem, { backgroundColor: isLight ? themePalette.rgba_229_231_235_0_5 : themePalette.rgba_255_255_255_0_07 }]}>
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

      <Pressable onPress={onSettingsPress} style={[styles.menuItem, { backgroundColor: isLight ? themePalette.rgba_229_231_235_0_5 : themePalette.rgba_255_255_255_0_07 }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="cog" size={17} color={colors.accent}/>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Theme, help, support and more
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle}/>
      </Pressable>

      <Pressable onPress={onManagePress} style={[styles.menuItem, { backgroundColor: isLight ? themePalette.rgba_229_231_235_0_5 : themePalette.rgba_255_255_255_0_07 }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <FontAwesome name="cog" size={17} color={colors.accent}/>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Manage</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Manage your company
          </Text>
        </View>

        <FontAwesome name="angle-right" size={22} color={colors.subtle}/>
      </Pressable>

      <Pressable onPress={onFollowUsPress} style={[styles.menuItem, { backgroundColor: isLight ? themePalette.rgba_229_231_235_0_5 : themePalette.rgba_255_255_255_0_07 }]}>
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
          <FontAwesome name="instagram" size={18} color={themePalette.hex_e11d48}/>
          <FontAwesome name="facebook" size={18} color={themePalette.hex_2563eb}/>
          <FontAwesome name="linkedin" size={18} color={themePalette.hex_0f766e}/>
        </View>
      </Pressable>
    </View>);
}
export default MoreTabContent;
