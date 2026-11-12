import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { font } from '../../../../theme/typography';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../theme/colors';
import { s } from '../../../../theme/responsive';

function ServicesButton({ onPress, onAddCompanyPress }) {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    const cardStyle = {
        backgroundColor: isLight ? colors.cardHighlight : themePalette.hex_0d1b2a,
        borderColor: isLight ? colors.border : themePalette.rgba_255_255_255_0_08,
    };

    return (
        <View style={[styles.card, cardStyle]}>
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Open services"
                style={({ pressed }) => [styles.action, { opacity: pressed ? 0.85 : 1 }]}
            >
                <View style={[styles.iconWrap, { backgroundColor: themePalette.rgba_139_92_246_0_15 }]}>
                    <FontAwesome name="th-large" size={s(18)} color={isLight ? themePalette.hex_7c3aed : themePalette.hex_ffffff} />
                </View>
                <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>Services</Text>
            </Pressable>

            <View style={[styles.divider, { backgroundColor: isLight ? colors.border : themePalette.rgba_255_255_255_0_08 }]} />

            <Pressable
                onPress={onAddCompanyPress}
                accessibilityRole="button"
                accessibilityLabel="Add company"
                style={({ pressed }) => [styles.action, { opacity: pressed ? 0.85 : 1 }]}
            >
                <View style={[styles.iconWrap, { backgroundColor: isLight ? themePalette.hex_ecfdf5 : themePalette.rgba_52_211_153_0_18 }]}>
                    <FontAwesome name="plus-circle" size={s(18)} color={isLight ? themePalette.hex_16a34a : themePalette.hex_ffffff} />
                </View>
                <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>Add Company</Text>
            </Pressable>
        </View>
    );
}

const styles = makeThemeStyles(() => StyleSheet.create({
    card: {
        width: '100%',
        flexDirection: 'row',
        marginTop: s(12),
        borderRadius: s(14),
        borderWidth: 1,
        overflow: 'hidden',
    },
    action: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s(8),
        paddingHorizontal: s(8),
        paddingVertical: s(14),
    },
    divider: {
        width: 1,
        marginVertical: s(10),
    },
    iconWrap: {
        width: s(32),
        height: s(32),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: s(10),
    },
    title: {
        fontSize: font.bodySmall,
        fontWeight: '700',
    },
}));

export default ServicesButton;
