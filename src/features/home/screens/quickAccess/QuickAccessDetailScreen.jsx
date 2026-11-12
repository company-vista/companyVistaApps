import { font } from '../../../../theme/typography';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { s } from '../../../../theme/responsive';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../theme/colors';
function QuickAccessDetailScreen({ color, description, icon, onBackPress, title, }) {
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    return (<View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(safeAreaInsets.bottom, s(24)) },
        ]}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
            <FontAwesome name={icon} size={32} color={color}/>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            {description}
          </Text>
        </View>
      </ScrollView>
    </View>);
}
const styles = makeThemeStyles(() => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: s(20),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        flex: 1,
        color: themePalette.hex_111827,
        fontSize: font.lg,
        fontWeight: '600',
    },
    content: {
        paddingTop: s(24),
    },
    heroCard: {
        alignItems: 'center',
        borderRadius: s(18),
        backgroundColor: themePalette.hex_ffffff,
        paddingHorizontal: s(22),
        paddingVertical: s(36),
    },
    iconWrap: {
        width: s(72),
        height: s(72),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: s(36),
        backgroundColor: themePalette.hex_ecfeff,
    },
    heroTitle: {
        color: themePalette.hex_111827,
        fontSize: s(22),
        fontWeight: '900',
        marginTop: s(18),
        textAlign: 'center',
    },
    description: {
        color: themePalette.hex_64748b,
        fontSize: s(15),
        fontWeight: '600',
        lineHeight: s(22),
        marginTop: s(10),
        textAlign: 'center',
    },
}));
export default QuickAccessDetailScreen;
