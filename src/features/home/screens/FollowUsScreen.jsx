import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../theme/colors';
import { font } from '../../../theme/typography';
const socialItems = [
    {
        icon: 'youtube-play',
        iconColor: '#ff0000',
        title: 'Watch our Youtube channel',
    },
    {
        icon: 'instagram',
        iconColor: '#c13584',
        title: 'Follow us on Instagram',
    },
    {
        icon: 'facebook-square',
        iconColor: '#3154a4',
        title: 'Follow us on Facebook',
        url: 'https://www.facebook.com/companyvista',
    },
    {
        icon: 'linkedin-square',
        iconColor: '#0a66c2',
        title: 'Follow us on LinkedIn',
        url: 'https://www.linkedin.com/company/companyvista/about',
    },
    {
        icon: 'x',
        iconColor: '#111827',
        title: 'Follow us on X',
    },
];
function FollowUsScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    return (<View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(safeAreaInsets.bottom, 24) },
        ]}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Stay Connected with Company Vista
        </Text>

        <View style={styles.socialGrid}>
          {socialItems.map(item => (<Pressable key={item.title} onPress={() => item.url && Linking.openURL(item.url)} style={[
                styles.socialCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
              {item.icon === 'x' ? (<View style={styles.xIcon}>
                  <Text style={styles.xIconText}>X</Text>
                </View>) : (<FontAwesome name={item.icon} size={27} color={item.iconColor}/>)}
              <Text style={[styles.socialTitle, { color: colors.text }]}>
                {item.title}
              </Text>
            </Pressable>))}
        </View>

        <Text style={[styles.infoText, { color: colors.text }]}>
          Follow us on social media to receive important announcements, exclusive
          benefits and helpful information.
        </Text>
      </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    header: {
        height: 42,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: '#111827',
        fontSize: 20,
        fontWeight: '500',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    heading: {
        color: '#111827',
        fontSize: font.xxl,
        fontWeight: '400',
        marginBottom: 28,
    },
    socialGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    socialCard: {
        width: '47.4%',
        minHeight: 96,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 14,
        backgroundColor: '#ffffff',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    socialTitle: {
        color: '#111827',
        fontSize: font.lg,
        fontWeight: '400',
        lineHeight: 20,
        marginTop: 10,
        textAlign: 'center',
    },
    xIcon: {
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        backgroundColor: '#111827',
    },
    xIconText: {
        color: '#ffffff',
        fontSize: font.xl,
        fontWeight: '800',
    },
    infoText: {
        color: '#111827',
        fontSize: font.base,
        fontWeight: '400',
        lineHeight: 22,
        marginTop: 46,
        textAlign: 'center',
    },
});
export default FollowUsScreen;
