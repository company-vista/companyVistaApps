import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    container: {
        gap: 12,
        marginTop: 18,
    },
    menuItem: {
        minHeight: 68,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconWrap: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 17,
        marginRight: 14,
    },
    copy: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '500',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '400',
        marginTop: 4,
    },
    socialIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
});
export default styles;
