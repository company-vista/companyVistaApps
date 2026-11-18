import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { deleteNotification } from '../api/notificationsApi';
import { useAppSelector } from '../../../store/hooks';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../theme/colors';
import { s } from '../../../theme/responsive';
import { font } from '../../../theme/typography';
function NotificationDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { notification } = route.params;
    const colors = useThemeColors();
    const token = useAppSelector(state => state.auth.token);
    const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
    const handleDelete = React.useCallback(async () => {
        setIsDropdownVisible(false);
        await deleteNotification({
            token,
            notificationId: notification.id,
            companyId: notification.companyId || null,
        });
        navigation.navigate('Notifications');
    }, [navigation, notification, token]);
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (<View style={styles.moreWrapper}>
                <Pressable style={styles.moreButton} onPress={() => setIsDropdownVisible(prev => !prev)}>
                    <FontAwesome name="ellipsis-v" size={18} color={colors.muted} />
                </Pressable>
                {isDropdownVisible ? (<View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Pressable onPress={handleDelete} style={[styles.dropdownOption, { borderBottomColor: colors.border }]}>
                        <FontAwesome name="trash-o" size={14} color={colors.danger} />
                        <Text style={[styles.dropdownOptionText, { color: colors.danger }]}>Delete</Text>
                    </Pressable>
                </View>) : null}
            </View>),
        });
    }, [navigation, isDropdownVisible, handleDelete, colors.border, colors.danger, colors.muted, colors.surface]);
    return (<View style={styles.screen}>
        <View style={[styles.detailCard, { borderColor: colors.border }]}>
            <View style={styles.headerRow}>
                <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
                    <FontAwesome name="bell-o" size={16} color={colors.accent} />
                </View>
                <View style={styles.titleWrap}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {notification.title}
                    </Text>
                    <Text style={[styles.time, { color: colors.subtle }]}>
                        {notification.time}
                    </Text>
                </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.message, { color: colors.muted }]}>
                {notification.message}
            </Text>
        </View>
    </View>);
}
const styles = makeThemeStyles(() => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: s(20),
        paddingTop: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    titleWrap: {
        flex: 1,
    },
    moreButton: {
        padding: 8,
    },
    moreWrapper: {
        position: 'relative',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 4,
        minWidth: 130,
        borderRadius: 10,
        borderWidth: 1,
        zIndex: 20,
        elevation: 8,
        shadowColor: themePalette.hex_000,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: s(16),
        borderBottomWidth: 1,
    },
    dropdownOptionText: {
        fontSize: font.md,
        fontWeight: '400',
    },
    headerTitle: {
        color: themePalette.hex_111827,
        fontSize: font.hero,
        fontWeight: '400',
    },
    detailCard: {
        borderRadius: 18,
        borderWidth: 1,
        marginTop: 24,
        paddingHorizontal: s(20),
        paddingVertical: 24,
    },
    iconWrap: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 21,
        backgroundColor: themePalette.hex_ecfeff,
    },
    title: {
        color: themePalette.hex_111827,
        fontSize: font.md,
        fontWeight: '400',
        lineHeight: 22,
    },
    time: {
        color: themePalette.hex_94a3b8,
        fontSize: font.sm,
        fontWeight: '400',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: themePalette.hex_e5e7eb,
        marginVertical: 18,
    },
    message: {
        color: themePalette.hex_64748b,
        fontSize: font.base,
        fontWeight: '400',
        lineHeight: 20,
    },
}));
export default NotificationDetailScreen;
